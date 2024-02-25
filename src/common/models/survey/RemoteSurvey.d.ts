export default interface RemoteSurvey {
  /** Drupal node ID */
  nid: number;
  title: string;
  /** Warehouse survey ID. Comes back as 0 for drafts. */
  survey_id: number;
  type:
    | 'single_species_form'
    | 'list_species_form'
    /** @deprecated not implementing */
    | 'multiplace_species_form”';
  subtype?:
    | 'spatial_ref_per_occurrence'
    /** not implementing */
    | 'optional_spatial_ref_per_occurrence';
  controls: (Control | SpeciesListControl | SubSamplesControl)[];
  created_by_uid: number;
  created_by_id: number;
  created_on: string;
  revision_id: number;
  updated_by_uid: number;
  updated_by_id: number;
  updated_on: string;
  groups: string[];
  description: string;
  is_published: boolean;
}

export interface Taxon {
  taxa_taxon_list_id: string;
  taxon: string;
  language_code: string;
  authority: any;
  default_common_name: string;
  prefered_taxa_taxon_list_id: string;
  preferred_taxon: string;
  preferred_authority: any;
  taxon_group_id: string;
  taxon_group: string;
  search_code: string;
  external_key: string;
  organism_key: string;
}

type Type =
  | 'date_picker'
  | 'location'
  | 'spatial_ref'
  | 'spatial_ref_system'
  | 'map'
  | 'sample_custom_attribute'
  | 'sample_photos'
  | 'sample_comment'
  | 'species_single'
  | 'sub_samples'
  | 'occurrence_comment'
  | 'species'
  | 'occurrence_custom_attribute'
  | 'occurrence_photos';

interface Control {
  type: Type;
  /** Unique Indicia database field name */
  field_name:
    | 'sample:entered_sref'
    | 'sample:entered_sref_system'
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
    | 'select' // same as 'radio_group'
    | 'checkbox_group' // same as 'radio_group' but allows multiple options
    | 'checkbox'
    | 'hidden'
    | 'select';
  label?: string;
  allow_vague_dates?: boolean;
  lockable?: boolean;
  mode?: string;
  include_activity_sites?: number;
  include_my_sites?: number;
  save_unfound_name_as_adhoc?: number;
  allow_save_to_my_sites?: number;
  attribute_id?: `${number}`;
  admin_name?: string;
  data_type?: 'text' | 'integer' | 'lookup' | 'boolean';
  terms: { id: string; term: string }[];
  admin_description?: string;
  help_text?: string;
  system?: string;
  number_options_min?: string;
  suffix?: string;
  default_value?: string;
  limit_taxa_to?: Taxon[];
  taxon_list_id?: number;
  validation?: {
    required?: boolean;

    // date
    allow_future?: boolean;

    // number
    min?: string;
    max?: string;
  };
}

interface SpeciesListControl {
  type: 'species_list';
  species_to_add_list_type: 'all';
  preloaded_scratchpad_list_id?: string;
  preload_taxa?: Taxon[];
  controls: Control[];
}

interface SubSamplesControl {
  type: 'sub_samples';
  controls: Control[];
}
