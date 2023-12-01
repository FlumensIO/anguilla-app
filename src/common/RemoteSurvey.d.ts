export default interface RemoteSurvey {
  id: number;
  title: string;
  survey_id: number;
  type: 'single_species_form' | 'list_species_form';
  data: { 'sample:survey_id': number; 'sample:input_form': string };
  controls: (Control | SpeciesListControl)[];
  subtype?: string;
  created_by_uid: number;
  created_by_id: number;
  created_on: string;
  revision_id: 4;
  updated_by_uid: number;
  updated_by_id: number;
  updated_on: string;
  description: string;
}

type Type =
  | 'date_picker'
  | 'location'
  | 'spatial_ref'
  | 'map'
  | 'sample_custom_attribute'
  | 'species_single'
  | 'occurrence_comment'
  | 'species'
  | 'occurrence_custom_attribute'
  | 'occurrence_photos';

interface Control {
  type: Type;
  /** Unique Indicia database field name */
  field_name:
    | 'sample:entered_sref'
    | 'sample:date'
    | 'sample:location_name'
    | 'sample:geom'
    | `smpAttr:${number}`
    | 'occurrence:comment'
    | 'occurrence:taxa_taxon_list_id'
    | `occAttr:${number}`;

  control_type?:
    | 'textarea'
    | 'number'
    | 'autocomplete'
    | 'text'
    | 'date'
    | 'radio_group'
    | 'select';
  label?: string;
  allow_vague_dates?: boolean;
  lockable?: boolean;
  required?: boolean;
  mode?: string;
  include_activity_sites?: number;
  include_my_sites?: number;
  save_unfound_name_as_adhoc?: number;
  allow_save_to_my_sites?: number;
  attribute_id?: `${number}`;
  admin_name?: string;
  data_type?: 'text' | 'integer' | 'lookup';
  terms: { id: string; term: string }[];
  admin_description?: string;
  help_text?: string;
  system?: string;
  number_options_min?: string;
  suffix?: string;
}

interface SpeciesListControl {
  type: 'species_list';
  species_to_add_list_type: 'all';
  controls: Control[];
}
