import { checkSubString, filterObjects } from './string-utils';

describe('checkSubString', () => {
  it('should return true if substring exists', () => {
    expect(checkSubString('HelloWorld', 'world')).toBe(true);
  });

  it('should return false if substring does not exist', () => {
    expect(checkSubString('HelloWorld', 'planet')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(checkSubString('HELLOWORLD', 'world')).toBe(true);
    expect(checkSubString('HelloWorld', 'WORLD')).toBe(true);
  });
});

describe('filterObjects', () => {
  const sampleObjects = [
    { name: 'John', city: 'New York' },
    { name: 'Jane', city: 'Los Angeles' },
    { name: 'Doe', city: 'San Francisco' },
  ];

  it('should return all objects if no filter string is provided', () => {
    expect(
      filterObjects({
        objects: sampleObjects,
        keys: 'name',
        filterString: '',
      })
    ).toEqual(sampleObjects);
  });

  it('should filter by single key', () => {
    expect(
      filterObjects({
        objects: sampleObjects,
        keys: 'name',
        filterString: 'john',
      })
    ).toEqual([{ name: 'John', city: 'New York' }]);
  });

  it('should filter by multiple keys', () => {
    expect(
      filterObjects({
        objects: sampleObjects,
        keys: ['name', 'city'],
        filterString: 'Los',
      })
    ).toEqual([{ name: 'Jane', city: 'Los Angeles' }]);
  });

  it('should be case-insensitive in filtering', () => {
    expect(
      filterObjects({
        objects: sampleObjects,
        keys: 'name',
        filterString: 'JOhN',
      })
    ).toEqual([{ name: 'John', city: 'New York' }]);
  });

  it('should return empty array if no matches are found', () => {
    expect(
      filterObjects({
        objects: sampleObjects,
        keys: 'name',
        filterString: 'XYZ',
      })
    ).toEqual([]);
  });
});
