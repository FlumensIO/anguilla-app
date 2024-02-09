import { Model, ModelMetadata, ModelAttrs } from '@flumens';
import { Choice } from '@flumens/tailwind/dist/Survey';
import { listsStore } from 'models/store';

export interface Attrs extends ModelAttrs {
  list: Choice[];
}
export interface Metadata extends ModelMetadata {}

export default class List extends Model {
  static fromJSON(json: any) {
    return new this(json);
  }

  declare id: string;

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs & SurveyT = Model.extendAttrs(this.attrs, { list: [] });

  collection?: any;

  declare metadata: Metadata;

  constructor(options: any) {
    super({ ...options, store: listsStore });
  }
}
