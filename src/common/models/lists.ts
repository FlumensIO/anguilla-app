/* eslint-disable no-param-reassign */
import { set } from 'mobx';
import axios from 'axios';
import { initStoredSamples } from '@flumens';
import { Choice } from '@flumens/tailwind/dist/Survey';
import CONFIG from 'common/config';
import List from './list';
import { listsStore } from './store';
import userModel from './user';

type Collection = List[] & {
  ready: Promise<any>;
  resetDefaults: any;
  isFetching: boolean;
};

const lists: Collection = initStoredSamples(listsStore, List);

set(lists, { isFetching: false });

export const syncLists = async (listIds: string[]) => {
  async function getList(listId: string) {
    const config = {
      method: 'get',
      url: `${CONFIG.backend.indicia.url}/index.php/services/rest/reports/library/taxa/taxa_list_for_app_2.xml?taxon_list_id=${listId}`,
      headers: {
        Authorization: `Bearer ${await userModel.getAccessToken()}`,
      },
    };

    const rest = await axios.request(config);
    const getOption = ({ id, taxon }: any): Choice => ({
      data_name: id,
      title: taxon,
    });
    const options = rest.data?.data.map(getOption);
    const byId = (l: List) => l.id === listId;
    let list = lists.find(byId);
    if (!list) {
      list = new List({ id: listId, attrs: { list: options } });
      list.save();
      lists.push(list);
      return;
    }

    set(list.attrs.list, options);
    list.save();
  }

  await Promise.all(listIds.map(getList));
};

export default lists;
