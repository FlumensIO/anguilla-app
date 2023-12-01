/* eslint-disable @getify/proper-arrows/name */
import { getDeepObject, createDeepObject, getDeepObjectKey } from './utils';

describe('utils', () => {
  describe('createBlockValueObject', () => {
    it('should throw if no initial object is given', () => {
      // Given
      const object = null;

      // When
      // Then
      expect(() => createDeepObject(object, '')).toThrow(Error);
    });

    it('should not create a value for empty array', () => {
      // Given
      const object: any = {};

      // When
      createDeepObject(object, '');

      // Then
      expect(object['1']).toBeUndefined();
    });

    it('should create a value object', () => {
      // Given
      const object: any = {};

      // When
      createDeepObject(object, '1.2.3');

      // Then
      expect(object['1']['2']['3']).toEqual({});
    });

    it('should create arrays', () => {
      // Given
      const object: any = {};

      // When
      createDeepObject(object, '1.2.3()');

      // Then
      expect(object['1']['2']['3']).toEqual([]);
    });

    it('should create arrays with index', () => {
      // Given
      const object: any = {};

      // When
      createDeepObject(object, '1.2.3(1)');

      // Then
      expect(object['1']['2']['3'][1]).toEqual({});
    });
  });

  describe('getDeepObject', () => {
    it('should return initial object with empty key', () => {
      // Given
      const object: any = {};

      // When
      const returnedObject = getDeepObject(object, '');

      // Then
      expect(returnedObject).toEqual(object);
    });

    it('should return object value with key', () => {
      // Given
      const object: any = { a: { b: 1 } };

      // When
      const returnedObject = getDeepObject(object, 'a.b');

      // Then
      expect(returnedObject).toEqual(1);
    });

    it('should return object value with array key', () => {
      // Given
      const object: any = { a: { b: [] } };

      // When
      const returnedObject = getDeepObject(object, 'a.b()');

      // Then
      expect(returnedObject).toEqual([]);
    });

    it('should return object value with array key index', () => {
      // Given
      const object: any = { a: { b: [2] } };

      // When
      const returnedObject = getDeepObject(object, 'a.b(0)');

      // Then
      expect(returnedObject).toEqual(2);
    });
  });

  describe('getDeepObjectKey', () => {
    it('should return empty if no key', () => {
      // Given
      const block: any = { id: '1' };
      const blockIds: string[] = [];

      // When
      const key = getDeepObjectKey(blockIds, block);

      // Then
      expect(key).toBe('');
    });

    it('should return joined block ids key', () => {
      // Given
      const block: any = { id: '1' };
      const blockIds: string[] = ['1', '2'];

      // When
      const key = getDeepObjectKey(blockIds, block);

      // Then
      expect(key).toBe('1.2');
    });

    it('should remove the last matching block entry if the block is a page', () => {
      // Given
      const block: any = { id: '3', container: 'page' };
      const blockIds: string[] = ['1', '2', '3'];

      // When
      const key = getDeepObjectKey(blockIds, block);

      // Then
      expect(key).toBe('1.2');
    });

    it('should append the repeated group block id with brackets', () => {
      // Given
      const block: any = { id: '3', type: 'group', repeated: true };
      const blockIds: string[] = ['1', '2'];

      // When
      const key = getDeepObjectKey(blockIds, block);

      // Then
      expect(key).toBe('1.2.3()');
    });
  });
});
