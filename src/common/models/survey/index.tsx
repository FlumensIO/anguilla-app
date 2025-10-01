import { Model, ModelMetadata } from '@flumens';
import SurveyT, { Block, ChoiceInput } from '@flumens/tailwind/dist/Survey';
import { surveysStore } from 'models/store';
import type RemoteSurvey from './RemoteSurvey';
import {
  Control,
  SpeciesListControl,
  SubSamplesControl,
  Taxon,
} from './RemoteSurvey.d';
import config from 'common/config';

const checkBlockIdUniqueness = (blocks: Block[]) => {
  const checkUniqueness = (uniqueControlIds: Set<any>) => (block: Block) => {
    if (uniqueControlIds.has(block.id)) {
      throw new Error(
        `A duplicate control id was used for "${block.title || block.type}" ("${
          block.id
        }")`
      );
    }

    uniqueControlIds.add(block.id);

    if (block.type === 'group')
      block.blocks.forEach(checkUniqueness(new Set()));
  };

  blocks.forEach(checkUniqueness(new Set()));
};

const getTaxonOption = (taxon: Taxon) => {
  const title = taxon.default_common_name
    ? `${taxon.default_common_name}`
    : taxon.taxon;

  return {
    data_name: taxon.taxa_taxon_list_id,
    title,
  };
};

const exists = (o: any) => !!o;

const getCustomAttribute = (control: Control): Block | null => {
  try {
    if (control.control_type === 'textarea') {
      return {
        type: 'text_input',
        id: control.field_name,
        title: control.label,
        appearance: 'multiline',
        description: control.help_text,
        validations: { required: control.validation?.required },
      };
    }

    if (control.control_type === 'text') {
      return {
        type: 'text_input',
        id: control.field_name,
        title: control.label,
        container: 'inline',
        description: control.help_text,
        validations: { required: control.validation?.required },
      };
    }

    if (control.control_type === 'number') {
      return {
        type: 'number_input',
        id: control.field_name,
        title: control.label,
        appearance: 'counter',
        container: 'inline',
        description: control.help_text,
        placeholder: '0',
        validations: {
          required: control.validation?.required,
          min: Number.parseInt(control.validation?.min || '', 10) || undefined,
          max: Number.parseInt(control.validation?.max || '', 10) || undefined,
        },
      };
    }

    if (
      control.control_type === 'radio_group' ||
      control.control_type === 'checkbox_group' ||
      control.control_type === 'select'
    ) {
      const getOption = (term: any) => ({
        data_name: term.id,
        title: term.term,
      });

      const multiple = control.control_type === 'checkbox_group';

      const choices = control.terms?.map(getOption) || [];

      const hasLongChoiceList = choices.length > 10;

      const block: ChoiceInput = {
        type: 'choice_input',
        id: control.field_name,
        title: control.label,
        container: multiple || hasLongChoiceList ? 'page' : 'inline',
        appearance: multiple || hasLongChoiceList ? 'list' : 'button',
        multiple,
        description: control.help_text,
        choices,
        validations: { required: control.validation?.required },
      };

      return block;
    }

    if (
      control.control_type === 'checkbox' &&
      control.data_type === 'boolean'
    ) {
      return {
        type: 'yes_no_input',
        id: control.field_name,
        title: control.label,
        description: control.help_text,
        appearance: 'toggle',
      };
    }
  } catch (error: any) {
    console.error(error);

    throw new Error(
      `Error processing "${control.label || control.field_name}" attribute: ${
        error.message
      }`
    );
  }

  // we are missing a control implementation
  console.warn(control);

  return null;
};

const getProcessedBlock = (
  control: Control | SpeciesListControl | SubSamplesControl
): Block | null => {
  if (control.type === 'date_picker') {
    return {
      type: 'date_time_input',
      id: control.field_name,
      title: control.label,
      default_value: 'now',
      description: control.help_text,
      validations: {
        required: true,
        noFutureValues: !control?.validation?.allow_future,
      },
    };
  }

  if (control.type === 'species_list') {
    const hasLocationControl = ({ type }: Control) => type === 'spatial_ref';
    const requiresLocation = control.controls.find(hasLocationControl);

    if (control.preload_taxa) {
      const species = ({ type }: Control) => type === 'species';
      const speciesControl = control.controls.find(species);
      if (speciesControl && !speciesControl.limit_taxa_to) {
        // instead of prefilling we are asking user to enter the species
        speciesControl.limit_taxa_to = control.preload_taxa;
      }
    }

    return {
      type: 'group',
      id: requiresLocation ? 'samples' : 'occurrences',
      container: 'page',
      repeated: true,
      title: 'Species',
      repeatTitle: requiresLocation ? '' : '${occurrence:taxa_taxon_list_id}', // eslint-disable-line
      blocks: control.controls.map(getProcessedBlock).filter(exists) as Block[],
    };
  }

  if (control.type === 'sub_samples') {
    const hasLocation = (c: Control) => c.type === 'spatial_ref';
    const sampleControls = (control as any).controls;

    if (!sampleControls.find(hasLocation)) {
      // TODO: remove once subsamples have it
      sampleControls.splice(0, 0, {
        type: 'spatial_ref',
        field_name: 'sample:entered_sref',
        control_type: 'text',
        label: 'Location',
        validation: { required: true },
      } as any);
    }

    return {
      type: 'group',
      id: 'samples',
      container: 'page',
      repeated: true,
      title: 'Entries',
      repeatTitle: (control as SubSamplesControl).child_sample_template,
      blocks: sampleControls.map(getProcessedBlock).filter(exists) as Block[],
    };
  }

  if (control.type === 'sample_custom_attribute') {
    return getCustomAttribute(control);
  }

  if (control.type === 'occurrence_comment') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      appearance: 'multiline',
      description: control.help_text,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'sample_comment') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      appearance: 'multiline',
      description: control.help_text,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'occurrence_photos') {
    return {
      type: 'photo_input',
      id: 'occurrence_photos',
      title: control.label,
      multiple: true,
      description: control.help_text,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'sample_photos') {
    return {
      type: 'photo_input',
      id: 'sample_photos',
      title: control.label,
      multiple: true,
      description: control.help_text,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'occurrence_custom_attribute') {
    return getCustomAttribute(control);
  }

  if (control.type === 'location') {
    if (control.field_name !== 'sample:location_name') return null;

    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      container: 'inline',
      description: control.help_text,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'map') return null;
  if (control.type === 'spatial_ref') {
    return {
      type: 'geometry_input',
      id: control.field_name,
      allow_draw_point: true,
      allow_locate: true,
      autolocate: true,
      title: control.label,
      maps: [
        {
          isDefault: true,
          title: 'Satellite',
          style: 'mapbox://styles/mapbox/satellite-streets-v11',
          view: { latitude: config.appMapLatitude, longitude: config.appMapLongitude, zoom: config.appMapZoom },
        },
      ],
      container: 'page',
      validations: { required: true },
    };
  }

  if (control.control_type === 'hidden') {
    return {
      type: 'text_input',
      id: control.field_name,
      hidden: true,
      default_value: control.default_value,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'species_single' || control.type === 'species') {
    if ('limit_taxa_to' in control) {
      return {
        type: 'choice_input',
        id: control.field_name,
        title: control.label,
        container: 'page',
        choices: control.limit_taxa_to?.map(getTaxonOption) || [],
        validations: { required: control.validation?.required },
      };
    }

    if (!('taxon_list_id' in control))
      throw new Error('taxon_list_id is missing');

    const block: ChoiceInput = {
      type: 'choice_input',
      id: control.field_name,
      title: control.label,
      container: 'page',
      choice_list_id: `${control.taxon_list_id}`,
      validations: { required: control.validation?.required },
    };

    return block;
  }

  console.warn(control);

  return null;
};

export const getIndiciaToLocalSurvey = ({
  title,
  description,
  nid,
  survey_id,
  group_id,
  controls,
  created_on,
  updated_on,
  created_by_id,
  updated_by_id,
  is_published,
  groups,
}: RemoteSurvey): SurveyT => {
  try {
    const created_at = new Date(created_on).toISOString();
    const updated_at = new Date(updated_on).toISOString();

    const blocks = (controls as any)
      .map(getProcessedBlock)
      .filter(exists) as Block[];

    is_published && checkBlockIdUniqueness(blocks);

    return {
      type: 'survey',
      id: `${survey_id || `_${nid}`}`,
      title,
      description,
      version: new Date(updated_on).getTime() || 1,
      schema_version: 1,
      group_id,
      created_at,
      updated_at,
      created_by: `${created_by_id}`,
      updated_by: `${updated_by_id}`,
      status: is_published ? 'active' : 'draft',
      container: 'page',
      tags: group_id ? groups : [],
      blocks,
    };
  } catch (error: any) {
    console.error(error);

    throw new Error(
      `There was an error parsing the survey ("${
        title || survey_id || `_${nid}`
      }") specification:  ${error.message}`
    );
  }
};

export interface Attrs extends SurveyT {}
export interface Metadata extends ModelMetadata {}

export default class Survey extends Model {
  static fromJSON(json: any) {
    return new this(json);
  }

  declare id: string;

  declare group_id: number;

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs & SurveyT = Model.extendAttrs(this.attrs, {});

  collection?: any;

  declare metadata: Metadata;

  constructor(options: any) {
    super({ ...options, store: surveysStore });
  }

  isDraft = () => this.attrs.status === 'draft';
}
