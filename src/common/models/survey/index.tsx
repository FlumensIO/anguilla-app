import { Model, ModelMetadata } from '@flumens';
import SurveyT, { Block, ChoiceInput } from '@flumens/tailwind/dist/Survey';
import { surveysStore } from 'models/store';
import type RemoteSurvey from './RemoteSurvey';
import { Control, SpeciesListControl, Taxon } from './RemoteSurvey.d';

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
  if (control.control_type === 'textarea') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      appearance: 'multiline',
      container: 'page',
      validations: { required: control.validation?.required },
    };
  }

  if (control.control_type === 'text') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      container: 'inline',
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
      validations: {
        required: control.validation?.required,
        min: Number.parseInt(control.validation?.min || '', 10) || undefined,
        max: Number.parseInt(control.validation?.max || '', 10) || undefined,
      },
    };
  }

  if (
    control.control_type === 'radio_group' ||
    control.control_type === 'select'
  ) {
    const getOption = (term: any) => ({ data_name: term.id, title: term.term });

    const block: ChoiceInput = {
      type: 'choice_input',
      id: control.field_name,
      title: control.label,
      container: 'inline',
      appearance: 'button',
      choices: control.terms.map(getOption),
      validations: { required: control.validation?.required },
    };

    return block;
  }

  if (control.control_type === 'checkbox' && control.data_type === 'boolean') {
    return {
      type: 'yes_no_input',
      id: control.field_name,
      title: control.label,
      appearance: 'toggle',
    };
  }

  console.warn(control);

  return null;
};

const getProcessedBlock = (
  control: Control | SpeciesListControl
): Block | null => {
  if (control.type === 'date_picker') {
    return {
      type: 'date_time_input',
      id: control.field_name,
      title: control.label,
      default_value: 'now',
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
      container: 'page',
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'sample_comment') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      appearance: 'multiline',
      container: 'page',
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'occurrence_photos') {
    return {
      type: 'photo_input',
      id: 'occurrence_photos',
      title: control.label,
      multiple: true,
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'sample_photos') {
    return {
      type: 'photo_input',
      id: 'sample_photos',
      title: control.label,
      multiple: true,
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
      validations: { required: control.validation?.required },
    };
  }

  if (control.type === 'map') return null;
  if (control.type === 'spatial_ref') {
    return {
      type: 'geometry_input',
      id: control.field_name,
      allow_pin: true,
      allow_locate: true,
      autolocate: true,
      title: control.label,
      maps: [
        {
          isDefault: true,
          title: 'Satellite',
          style: 'mapbox://styles/mapbox/satellite-streets-v11',
          view: { latitude: 18.23, longitude: -63.04, zoom: 10 }, // Anguilla
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
  survey_id,
  controls,
  created_on,
  updated_on,
  created_by_id,
  updated_by_id,
  groups,
}: RemoteSurvey): SurveyT => {
  const created_at = new Date(created_on).toISOString();
  const updated_at = new Date(updated_on).toISOString();

  return {
    type: 'survey',
    id: `${survey_id}`,
    title,
    description,
    version: new Date(updated_on).getTime() || 1,
    schema_version: 1,
    created_at,
    updated_at,
    created_by: `${created_by_id}`,
    updated_by: `${updated_by_id}`,
    status: 'active',
    container: 'page',
    tags: groups,
    blocks: (controls as any).map(getProcessedBlock).filter(exists) as Block[],
  };
};

export interface Attrs extends SurveyT {}
export interface Metadata extends ModelMetadata {}

export default class Survey extends Model {
  static fromJSON(json: any) {
    return new this(json);
  }

  declare id: string;

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs & SurveyT = Model.extendAttrs(this.attrs, {});

  collection?: any;

  declare metadata: Metadata;

  constructor(options: any) {
    super({ ...options, store: surveysStore });
  }
}
