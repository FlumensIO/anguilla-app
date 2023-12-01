import {
  Model,
  ModelAttrs,
  ModelMetadata,
  ModelValidationMessage,
  useAlert,
} from '@flumens';
import { modelStore } from './store';

export interface Attrs extends ModelAttrs {}
export interface Metadata extends ModelMetadata {
  saved?: boolean;
  survey?: number;
}

const defaults: Attrs = {};

export default class Record extends Model {
  static fromJSON(json: any) {
    return new this(json);
  }

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = Model.extendAttrs(this.attrs, defaults);

  remote = { synchronising: false }; // TODO:

  collection?: any;

  declare metadata: Metadata;

  constructor(options: any) {
    super({ ...options, store: modelStore });
  }

  async upload() {
    // TODO:
  }

  validateRemote() {
    // TODO:
    return null as any;
  }

  isUploaded() {
    return false;
  }

  async save() {
    if (this.attrs.deleted) return; // we don't want to store deleted samples yet

    await super.save();
  }

  async destroy() {
    if (this.collection) this.collection.remove(this);

    this.attrs.deleted = true;

    await super.destroy();
  }
}

export const useValidateCheck = (record: Record) => {
  const alert = useAlert();

  const showValidateCheck = () => {
    const invalids = record.validateRemote();
    if (invalids) {
      alert({
        header: 'Survey incomplete',
        skipTranslation: true,
        message: <ModelValidationMessage {...invalids} />,
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
