import { formatTimestamp } from './time-utils';

describe('formatTimestamp', () => {
  it('should display timestamp taking into account user timezone', () => {
    const timestamp = '2023-09-28T18:26:28.018Z';
    const expectedTimestamp = 'Sep 29, 2023, 2:26:28 PM';
    const timeZone = 'Australia/Melbourne';
    // Mock the return value of Date.getTimezoneOffset() to return -600
    expect(
      formatTimestamp(timestamp, { value: timeZone, offset: -600 })
    ).toEqual(expectedTimestamp);
  });
});
