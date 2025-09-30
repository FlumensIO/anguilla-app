/* eslint-disable no-param-reassign */
import { set } from 'mobx';
import axios from 'axios';
import { initStoredSamples } from '@flumens';
import { Block } from '@flumens/tailwind/dist/Survey';
import config from 'common/config';
import { syncLists } from './lists';
import { surveysStore } from './store';
import Survey, { getIndiciaToLocalSurvey } from './survey';
import RemoteSurvey from './survey/RemoteSurvey.d';
import userModel from './user';

type Collection = Survey[] & {
  ready: Promise<any>;
  resetDefaults: any;
  isFetching: boolean;
};

const surveys: Collection = initStoredSamples(surveysStore, Survey);

set(surveys, { isFetching: false });

const latestOnes = (agg: any, survey: Survey) => {
  if (!agg[survey.id]) {
    agg[survey.id] = survey;
  } else if (agg[survey.id].attrs.version < survey.attrs.version) {
    agg[survey.id] = survey;
  }
  return agg;
};

export const getLatestSurveys = () =>
  Object.values<Survey>(surveys.reduce(latestOnes, {}));

export const syncSurveys = async () => {
  surveys.isFetching = true;

  const { data: surveyList } = await axios.request({
    url: `${config.backend.url}/iform_layout_builder/form_layout?_format=json`,
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    },
  });

  // delete draft surveys
  const isDraft = (s: Survey) => s.isDraft();
  const destroy = (s: Survey) => {
    const index = surveys.findIndex(({ cid }: Survey) => cid === s.cid);
    surveys.splice(index, 1);
    return s.destroy();
  };
  await Promise.all(surveys.filter(isDraft).map(destroy));

  // TODO: delete any surveys with no records and are missing in the new list

  const getListIds = (blocks: Block[]): string[] => {
    const exists = (o: any) => !!o;

    const getListId = (block: Block): any => {
      if ('choice_list_id' in block) return `${block.choice_list_id}`;
      if ('blocks' in block)
        return block.blocks.flatMap(getListId).filter(exists);

      return null;
    };
    return blocks.flatMap(getListId).filter(exists);
  };

  const getSurvey = async ({ id: drupalContentId, href, group_id, groups }: any) => {
    const res = await axios.request({
      url: `${href}?_format=json`,
      headers: {
        Authorization: `Bearer ${await userModel.getAccessToken()}`,
      },
    });

    const survey = getIndiciaToLocalSurvey({
      ...res.data,
      nid: drupalContentId,
      groups,
    } as RemoteSurvey);
    const cid = `${survey.id}_${group_id}${survey.version}`;

    const byCID = (s: Survey) => s.cid === cid;
    let surveyModel = surveys.find(byCID);
    if (!surveyModel) {
      surveyModel = new Survey({
        id: survey.id,
        cid,
        attrs: { ...survey, id: survey.id },
      });

      surveys.push(surveyModel);
    }

    const listIds: string[] = getListIds(surveyModel.attrs.blocks);
    await syncLists(listIds);
  };

  // create or update new surveys
  await Promise.all(surveyList.map(getSurvey));
};

export default surveys;
