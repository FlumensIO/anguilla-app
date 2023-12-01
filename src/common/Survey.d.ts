type UUID = string;
type DateISO = string;

type Group = {
  type: 'group';
  id: UUID;
  container: 'page' | 'inline' | 'tabs' | 'grid';
  title?: string;
  repeated?: boolean;
  description?: string;
  blocks: Block[];
};

type CoreInputAttributes = {
  id: UUID;
  title?: string;
  description?: string;
  data_name?: string;
  style?: string;
  disabled?: boolean;
  hidden?: boolean;
  default_value?: string;
  default_previous_value?: boolean;
  container?: InputContainer;
};

type InputContainer = 'page' | 'inline';

type TextInput = {
  type: 'text_input';
  icon?: string;
  trailing_icon?: string;
  appearance?: 'multiline';
  prefix?: string;
  suffix?: string;
  validations?: { required?: boolean; min?: number; max?: number };
  placeholder?: string;
} & CoreInputAttributes;

type YesNoInput = {
  type: 'yes_no_input';
  icon?: string;
  allow_neutral?: boolean;
  appearance?: 'toggle' | 'buttons';
  validations?: { required?: boolean };
  choices: Choice[];
} & CoreInputAttributes;

type DateTimeInput = {
  type: 'date_time_input';
  icon?: string;
  trailing_icon?: string;
  prefix?: string;
  suffix?: string;
  validations?: { required?: boolean; min?: number; max?: number };
  placeholder?: string;
} & CoreInputAttributes;

type Choice = { data_name: string; title: string };
type ChoiceInput = {
  type: 'choice_input';
  icon?: string;
  validations?: { required?: boolean };
  multiple?: boolean;
} & ({ choice_list_id: UUID } | { choices: Choice[] }) &
  CoreInputAttributes;

type NumberInput = {
  type: 'number_input';
  id: UUID;
  icon?: string;
  trailing_icon?: string;
  appearance?: 'slider';
  prefix?: string;
  suffix?: string;
  validations?: { required?: boolean; min?: number; max?: number };
  placeholder?: string;
} & CoreInputAttributes;

type MapStyle = { title: string; style: string; isDefault?: boolean };

type GeometryInput = {
  type: 'geometry_input';
  maps?: MapStyle[];
  allow_pin?: boolean;
  allow_search?: boolean;
  allow_locate?: boolean;
  allow_line?: boolean;
  allow_polygon?: boolean;
  icon?: string;
  validations?: { required?: false };
} & CoreInputAttributes;

type Link = {
  type: 'link';
  id: UUID;
  title: string;
  icon?: string;
  link: string;
  external?: boolean;
  container?: 'inline';
};

type RecordLink = {
  type: 'record_link';
  survey_id: string;
  allow_creating_records?: boolean;
  allow_existing_records?: boolean;
  allow_updating_records?: boolean;
  allow_multiple_records?: boolean;
  icon?: string;
  validations?: { required?: boolean; min?: number; max?: number };
} & CoreInputAttributes;

type PhotoInput = {
  type: 'photo_input';
  icon?: string;
  multiple?: boolean;
  allow_annotations?: boolean;
  validations?: { required?: boolean };
} & CoreInputAttributes;

type FileInput = {
  type: 'file_input';
  icon?: string;
  multiple?: boolean;
  allow_annotations?: boolean;
  validations?: { required?: boolean };
} & CoreInputAttributes;

export type Block =
  | Group
  | Link
  | RecordLink
  | TextInput
  | ChoiceInput
  | NumberInput
  | GeometryInput
  | YesNoInput
  | PhotoInput
  | FileInput
  | DateTimeInput;

export default interface Survey {
  id: UUID;
  title: string;
  version: number;
  schema_version: number;
  created_by: UUID;
  updated_by: UUID;
  created_at: DateISO;
  updated_at: DateISO;
  status: 'active' | 'draft';
  container: 'multi_page' | 'page' | 'inline';
  description?: string;
  blocks: Block[];
}
