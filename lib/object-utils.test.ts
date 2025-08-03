import { remapObjectKeys } from './object-utils';

describe('remapObjectKeys', () => {
  it('should remap object keys with sequential numbers', () => {
    const obj = { key1: 'value1', key2: 'value2', key3: 'value3' };
    const filteredKeys = ['key1', 'key3'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1', '2': 'value3' });
  });

  it('should handle empty filtered keys array', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const filteredKeys: string[] = [];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({});
  });

  it('should handle single key remapping', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const filteredKeys = ['key1'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1' });
  });

  it('should handle non-existent keys gracefully', () => {
    const obj = { key1: 'value1' };
    const filteredKeys = ['key1', 'nonexistent'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1', '2': undefined });
  });

  it('should work with different value types', () => {
    const obj = {
      key1: 'string',
      key2: 123,
      key3: true,
      key4: { nested: 'object' },
    };
    const filteredKeys = ['key1', 'key2', 'key3', 'key4'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({
      '1': 'string',
      '2': 123,
      '3': true,
      '4': { nested: 'object' },
    });
  });

  it('should preserve object reference for values', () => {
    const nestedObj = { nested: 'object' };
    const obj = { key1: nestedObj };
    const filteredKeys = ['key1'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result['1']).toBe(nestedObj);
    expect(result['1']).toEqual({ nested: 'object' });
  });

  it('should handle numeric keys', () => {
    const obj = { '1': 'value1', '2': 'value2', '3': 'value3' };
    const filteredKeys = ['1', '3'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1', '2': 'value3' });
  });

  it('should handle special characters in keys', () => {
    const obj = { 'key-1': 'value1', key_2: 'value2', 'key@3': 'value3' };
    const filteredKeys = ['key-1', 'key_2'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1', '2': 'value2' });
  });

  it('should handle empty object', () => {
    const obj = {};
    const filteredKeys = ['key1', 'key2'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': undefined, '2': undefined });
  });

  it('should handle all keys from object', () => {
    const obj = { a: 'value1', b: 'value2', c: 'value3' };
    const filteredKeys = ['a', 'b', 'c'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1', '2': 'value2', '3': 'value3' });
  });

  it('should handle duplicate keys in filtered array', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const filteredKeys = ['key1', 'key1', 'key2'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': 'value1', '2': 'value1', '3': 'value2' });
  });

  it('should handle null and undefined values', () => {
    const obj = { key1: null, key2: undefined, key3: 'value3' };
    const filteredKeys = ['key1', 'key2', 'key3'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': null, '2': undefined, '3': 'value3' });
  });

  it('should handle array values', () => {
    const obj = { key1: [1, 2, 3], key2: ['a', 'b'] };
    const filteredKeys = ['key1', 'key2'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result).toEqual({ '1': [1, 2, 3], '2': ['a', 'b'] });
  });

  it('should handle function values', () => {
    const testFunction = () => 'test';
    const obj = { key1: testFunction };
    const filteredKeys = ['key1'];

    const result = remapObjectKeys(obj, filteredKeys);

    expect(result['1']).toBe(testFunction);
    expect(typeof result['1']).toBe('function');
  });
});
