/* eslint-disable @getify/proper-arrows/name */

/* eslint-disable no-param-reassign */
import { observable } from 'mobx';
import clsx from 'clsx';
import {
  device,
  HandledError,
  makeRequest,
  Model,
  ModelAttrs,
  ModelMetadata,
  useAlert,
  date as DateHelp,
  getBlobFromURL,
} from '@flumens';
import ISurvey, {
  Block,
  GeometryInput,
  Group,
} from '@flumens/tailwind/dist/Survey';
import {
  setDefaultBlockValues,
  getAutoLocateBlocks,
} from '@flumens/tailwind/dist/components/Block/utils';
import config from 'common/config';
import geolocation from 'common/helpers/GPS';
import Survey, { Attrs as SurveyAttrs } from 'models/survey';
import surveys from 'models/surveys';
import appModel from './app';
import { modelStore } from './store';
import userModel from './user';

const REMOTE_URL = `${config.backend.indicia.url}/index.php/services/rest`;

const exists = (o: any) => !!o;

function setNewRemoteID(model: any & { id?: any }, responseData: any) {
  if (!responseData || !responseData.values) {
    console.warn("Model didn't receive an id from the server");
    return;
  }

  // eslint-disable-next-line no-param-reassign
  model.id = responseData.values.id;
}

function remoteCreateParse(model: any, responseData: any) {
  setNewRemoteID(model, responseData);
}

function printErroneousPayload(payload: any) {
  try {
    const MAX_PAYLOAD = 200000; // kb. https://develop.sentry.dev/sdk/event-payloads/
    console.warn(JSON.stringify(payload).substring(0, MAX_PAYLOAD / 2));
  } catch (e: any) {
    // do nothing
  }
}

const validate = (objectValue: any, block: Block | SurveyAttrs): any => {
  const validateGroup = (groupObjectValue: any, index?: number) => {
    const validateWrap = (b: Block) => validate(groupObjectValue, b);
    const groupBlock = block as Group | ISurvey;
    const errors = groupBlock.blocks.map(validateWrap).filter(exists);

    const title = Number.isFinite(index) ? index! + 1 : block.title || block.id;
    return !errors.length ? null : [title, errors];
  };

  if (block.type === 'survey') return validateGroup(objectValue);

  if (block.type === 'group') {
    if (block.repeated) {
      const repeatedValues = Object.values(objectValue?.[block.id] || {});
      if (!repeatedValues.length) return null;

      const errors = repeatedValues.map(validateGroup).filter(exists);
      return !errors.length ? null : [block.title || block.id, errors];
    }

    return validateGroup(objectValue?.[block.id]);
  }

  // const errors: string[] = [];
  if (!('validations' in block)) return null;
  if (!block.validations?.required) return null;

  const value = objectValue?.[block.id];
  if (value) return null;

  return `${block.title} is required`;
};

export interface Remote {
  synchronising?: boolean;
}

export interface Attrs extends ModelAttrs {
  training?: 't';
}

export interface Metadata extends ModelMetadata {
  saved?: boolean;
  /**
   * Internal survey CID. (ID + Version)
   */
  survey?: string;
  /**
   * Remote survey ID.
   */
  survey_id?: string;
}

const defaults: Attrs = {};

export default class Record extends Model {
  static fromJSON(json: any) {
    return new this(json);
  }

  static fromSurvey(surveyConfig: Survey) {
    const record = new this({
      metadata: { survey: surveyConfig.cid, survey_id: surveyConfig.id },
    });

    const setLocation = async (block: GeometryInput) => {
      await record.ready; // the record won't be auto-saved until it is ready, if we skip it then the new location won't be permanent
      const onChange = (value: any) => {
        (record.attrs as any)[block.id] = value;
        record.save();
        return null;
      };
      geolocation.locateAndSetValue(record.cid, onChange, block);
    };

    const autolocateBlocks = getAutoLocateBlocks(surveyConfig.attrs.blocks);
    autolocateBlocks.forEach(setLocation);

    setDefaultBlockValues(record.attrs, surveyConfig.attrs.blocks);

    if (appModel.attrs.useTraining) record.attrs.training = 't';

    return record;
  }

  remote = observable({ synchronising: false });

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = Model.extendAttrs(this.attrs, defaults);

  collection?: any;

  declare metadata: Metadata;

  constructor(options: any) {
    super({ ...options, store: modelStore });
  }

  async upload() {
    if (this.remote.synchronising || this.isUploaded()) return true;

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    const isActivated = await userModel.checkActivation();
    if (!isActivated) return false;

    // this.cleanUp(); // TODO:

    return this.saveRemote();
  }

  async saveRemote() {
    try {
      let submission;
      try {
        this.remote.synchronising = true;
        const warehouseMediaNames = await this.uploadMedia();
        submission = this.getSubmission(warehouseMediaNames);

        const resp = await this._createRemote(submission);
        this.remote.synchronising = false;

        // // update the model and occurrences with new remote IDs
        remoteCreateParse(this, resp);

        // update metadata
        const timeNow = new Date().getTime();
        // TODO: use server times
        this.metadata.updatedOn = timeNow;
        this.metadata.syncedOn = timeNow;

        this.save();
      } catch (err: any) {
        this.remote.synchronising = false;
        err.payload = submission;
        throw err;
      }
    } catch (error: any) {
      if (error.status === 400 && error.payload)
        printErroneousPayload(error.payload);

      throw error;
    }
  }

  private async uploadMedia() {
    let warehouseMediaNames = {};

    const getPhotos = (agg: any, [attr, value]: any): any => {
      if (
        attr.includes('occurrence_photos') ||
        attr.includes('sample_photos')
      ) {
        Object.assign(agg, value);
        return agg;
      }

      if (attr === 'samples' || attr === 'occurrences') {
        Object.values(value).forEach((v: any) => {
          const photos = Object.entries(v).reduce(getPhotos, {});
          Object.assign(agg, photos);
        });

        return agg;
      }

      return agg;
    };

    const getFormData = async ([name, m]: any) => {
      // can provide both image/jpeg and jpeg
      const extension = m.data.split('/')?.[1]?.split(';')?.[0];

      const mediaType = `image/${extension}`;

      const url = m.data;

      const blob = await getBlobFromURL(url, mediaType as string);

      return [name, blob, `${name}.${extension}`];
    };

    const photos = Object.entries(this.attrs).reduce(getPhotos, {});

    const hasPhotos = Object.keys(photos).length;
    if (!hasPhotos) return warehouseMediaNames;

    const media = await Promise.all(Object.entries(photos).map(getFormData));

    const upload = async (data: any) => {
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await userModel.getAccessToken()}`,
        },
        body: data,
      };

      try {
        return makeRequest(`${REMOTE_URL}/media-queue`, options);
      } catch (e: any) {
        if (e.message === 'timeout') {
          throw new HandledError(
            'Request aborted because of a network issue (timeout or similar).'
          );
        }

        throw e;
      }
    };

    const chunk = 5;
    for (let index = 0; index < media.length; index += chunk) {
      const mediaChunkToUpload = media.slice(index, index + chunk);
      const data = new FormData();
      mediaChunkToUpload.forEach((m: any) => (data.append as any)(...m));

      const ids = await upload(data); // eslint-disable-line

      warehouseMediaNames = { ...warehouseMediaNames, ...ids };
    }

    return warehouseMediaNames;
  }

  getSubmission(warehouseMediaNames: any) {
    const getBasicModel = () => ({
      values: {},
      media: [],
      samples: [],
      occurrences: [],
    });

    let submission: any = getBasicModel();
    submission.values = { ...submission.values, external_key: this.cid };

    // const mapValue = (attr: string, value: any): any => {
    //   const valuesMapping = keys[attr].values;
    //   if (!valuesMapping) {
    //     return value;
    //   }

    //   if (typeof valuesMapping === 'function') {
    //     return valuesMapping(value, submission, this);
    //   }

    //   if (value instanceof Array) {
    //     return value.map(v => mapValue(attr, v));
    //   }

    //   if (valuesMapping instanceof Array) {
    //     const mapping = valuesMapping.find(({ value: val }) => val === value);
    //     if (!mapping || !mapping.id) {
    //       throw new Error(
    //         `A "${attr}" attribute "${value}" value could not be mapped to a remote database field.`
    //       );
    //     }
    //     return mapping.id;
    //   }

    //   return valuesMapping[value];
    // };

    const getValue =
      (skipOccNesting?: boolean) =>
      (agg: any, [attr, value]: any) => {
        const isEmpty = (val: any) => val === null || val === undefined;

        if (isEmpty(value)) return agg;

        if (attr === 'occurrences') {
          agg.occurrences = Object.values(value)?.map((occ: any) =>
            Object.entries(occ).reduce(getValue(true), getBasicModel())
          );
          return agg;
        }

        if (attr === 'samples') {
          agg.samples = Object.values(value)?.map((smp: any) =>
            Object.entries(smp).reduce(getValue(), getBasicModel())
          );
          return agg;
        }

        if (attr === 'deleted') return agg;

        if (attr === 'sample:date') {
          value = DateHelp.print(value, false);
        }

        if (attr === 'sample:entered_sref') {
          const lat = parseFloat(value.latitude);
          const lon = parseFloat(value.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lat)) return agg;

          value = `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
        }

        const warehouseAttr = attr
          .replace('sample:', '')
          .replace('occurrence:', '');

        if (
          !skipOccNesting &&
          (attr.includes('occurrence:') || attr.includes('occAttr:'))
        ) {
          let [occ] = agg.occurrences;
          if (!occ) {
            occ = getBasicModel();
            agg.occurrences.push(occ);
          }
          occ.values[warehouseAttr] = value;
          return agg;
        }

        if (
          attr.includes('occurrence_photos') ||
          attr.includes('sample_photos')
        ) {
          let aggOrOcc = agg;
          if (attr.includes('occurrence_photos') && !skipOccNesting) {
            let [occ] = agg.occurrences;
            if (!occ) {
              occ = getBasicModel();
              agg.occurrences.push(occ);
            }
            aggOrOcc = occ;
          }

          const getRemoteCachedMediaId = (media: string) => ({
            values: {
              queued: warehouseMediaNames[media].name,
            },
          });
          aggOrOcc.media = Object.keys(value).map(getRemoteCachedMediaId);
          return agg;
        }

        // value = mapValue(attr, value);

        if (isEmpty(value)) return agg;

        agg.values[warehouseAttr] = value;

        return agg;
      };

    submission = Object.entries(this.attrs).reduce(getValue(), submission);

    return submission;
  }

  private async _createRemote(data: any): Promise<any> {
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${await userModel.getAccessToken()}` },
      body: JSON.stringify(data),
    };

    try {
      return await makeRequest(`${REMOTE_URL}/samples`, options);
    } catch (e: any) {
      if (e.status === 409 && e.res && e.res.duplicate_of) {
        return { values: { id: e.res.duplicate_of.id || -1 } };
      }

      if (e.message === 'timeout') {
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );
      }

      throw e;
    }
  }

  validateRemote() {
    return validate(this.attrs, this.getSurvey().attrs);
  }

  isUploaded() {
    return !!this.metadata.syncedOn;
  }

  getSurvey() {
    const byCID = (survey: Survey) => survey.cid === this.metadata.survey;
    return surveys.find(byCID)!;
  }

  async save() {
    if (this.attrs.deleted) return; // we don't want to store deleted samples yet

    await super.save();
  }

  async destroy() {
    if (this.collection) this.collection.remove(this);

    this.attrs.deleted = true;

    const autolocateBlocks = getAutoLocateBlocks(this.getSurvey().attrs.blocks);

    // eslint-disable-next-line @getify/proper-arrows/name
    autolocateBlocks.forEach((autolocateBlock: Block) =>
      geolocation.stopLocate(this.cid + autolocateBlock.id)
    );

    await super.destroy();
  }
}

export const useValidateCheck = (record?: Record) => {
  const alert = useAlert();

  const showValidateCheck = () => {
    const invalids = record?.validateRemote();

    if (invalids) {
      const [, errors] = invalids;
      const getErrorMessage = (err: any): any => {
        const isArray = Array.isArray(err);
        const isRepeatable = isArray && Array.isArray(err[0]);
        return (
          <div
            className={clsx(isRepeatable && 'border-l-2', 'ml-2 list-disc')}
            key={err}
          >
            {isArray ? err.map(getErrorMessage) : err}
          </div>
        );
      };
      const message = <div className="my-3">{errors.map(getErrorMessage)}</div>;

      alert({
        header: 'Survey incomplete',
        skipTranslation: true,
        message,
        buttons: [
          {
            text: 'Got it',
            role: 'cancel',
          },
        ],
      });
      return false;
    }
    return true;
  };

  return showValidateCheck;
};
