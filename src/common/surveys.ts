import type RemoteSurvey from './RemoteSurvey';
import { Control, SpeciesListControl } from './RemoteSurvey.d';
import type Survey from './Survey';
import type { Block } from './Survey';
import surveys from './cached_surveys.json';

export type { Survey };

export const INPUTS_WITH_VALUES = [
  'text_input',
  'number_input',
  'choice_input',
  'geometry_input',
];

const exists = (o: any) => !!o;

const getCustomAttribute = (control: Control): Block | null => {
  if (control.control_type === 'textarea') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      appearance: 'multiline',
      container: 'page',
    };
  }

  if (control.control_type === 'text') {
    return {
      type: 'text_input',
      id: control.field_name,
      title: control.label,
      container: 'inline',
    };
  }

  if (control.control_type === 'number') {
    return {
      type: 'number_input',
      id: control.field_name,
      title: control.label,
      appearance: 'slider',
      container: 'inline',
    };
  }

  if (control.control_type === 'radio_group') {
    const getOption = (term: any) => ({ data_name: term.id, title: term.term });
    return {
      type: 'choice_input',
      id: control.field_name,
      title: control.label,
      container: 'page',
      choices: control.terms.map(getOption),
    };
  }

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
    };
  }

  if (control.type === 'species_list') {
    return {
      type: 'group',
      id: 'occurrences',
      container: 'page',
      repeated: true,
      title: 'Occurrences',
      blocks: control.controls.map(getProcessedBlock).filter(exists) as Block[],
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
    };
  }

  if (control.type === 'occurrence_photos') {
    return {
      type: 'photo_input',
      id: 'occurrence_photos',
      title: control.label,
      multiple: true,
    };
  }

  if (control.type === 'occurrence_custom_attribute') {
    return getCustomAttribute(control);
  }

  if (control.type === 'location') return null;
  if (control.type === 'map') return null;
  if (control.type === 'spatial_ref') {
    return {
      type: 'geometry_input',
      id: control.field_name,
      allow_pin: true,
      title: 'Location',
      maps: [
        {
          isDefault: true,
          title: 'Map layer',
          style: 'TODO',
        },
      ],
      container: 'page',
    };
  }

  if (control.type === 'species_single' || control.type === 'species') {
    return {
      type: 'text_input',
      id: 'occurrence:taxa_taxon_list_id',
      title: control.label,
      container: 'page',
    };
  }

  console.warn(control);

  return null;
};

const indiciaPreProcess = ({
  title,
  description,
  id,
  controls,
  created_on,
  updated_on,
  created_by_id,
  updated_by_id,
}: RemoteSurvey): Survey => {
  const created_at = new Date(created_on).toISOString();
  const updated_at = new Date(updated_on).toISOString();

  return {
    id: `${id}`,
    title,
    description,
    version: 1,
    schema_version: 1,
    created_at,
    updated_at,
    created_by: `${created_by_id}`,
    updated_by: `${updated_by_id}`,
    status: 'active',
    container: 'page',
    blocks: controls.map(getProcessedBlock).filter(exists) as Block[],
  };
};

const processedSurveys = (surveys as RemoteSurvey[]).map(indiciaPreProcess);

export default [...processedSurveys];
