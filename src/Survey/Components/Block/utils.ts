/* eslint-disable no-param-reassign */
import { Block } from 'common/Survey.d';

export const getDeepObjectKey = (blockIds: string[], block: Block) => {
  if (block.container === 'page' && blockIds.at(-1) === block.id) {
    return blockIds.slice(0, blockIds.length - 1).join('.');
  }

  if (block.type === 'group' && block.repeated) {
    return [...blockIds, `${block.id}()`].join('.');
  }

  return blockIds.join('.');
};

export const getDeepObject = (object: any, keys: string) => {
  const reducer = (val: any, key: string) => {
    if (!key) return val;

    const [isArray, arrayKey, arrayIndex] = key.match(/(.*)\((.*)\)/) || [];
    if (isArray) {
      if (Number.isFinite(parseInt(arrayIndex, 10))) {
        return val?.[arrayKey]?.[arrayIndex];
      }
      return val?.[arrayKey];
    }

    return val?.[key];
  };

  return keys.split('.').reduce(reducer, object);
};

export const createDeepObject = (object: any, keys: string) => {
  if (!object) throw new Error(`Can't create a value object inside an seed`);

  const reducer = (val: any, key: string) => {
    const [isArray, arrayKey, arrayIndex] = key.match(/(.*)\((.*)\)/) || [];
    if (isArray) {
      if (!val[arrayKey]) {
        val[arrayKey] = [];
      }

      const hasArrayIndex = Number.isFinite(parseInt(arrayIndex, 10));
      if (hasArrayIndex) {
        val[arrayKey][arrayIndex] = {};
      }

      return hasArrayIndex ? val[arrayKey][arrayIndex] : val[arrayKey];
    }
    if (!val[key]) {
      val[key] = {};
    }

    return val[key];
  };

  return keys.split('.').reduce(reducer, object);
};
