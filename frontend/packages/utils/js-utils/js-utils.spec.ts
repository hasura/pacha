import { timeSince } from './time-utils';
import { stripTrailingSlash } from './url-utils';

describe('stripTrailingSlash', () => {
  it('strip trailing slash', () => {
    expect(stripTrailingSlash('http://test.com/')).toBe('http://test.com');
  });

  it('only strip trailing slash', () => {
    expect(stripTrailingSlash('http://test.com')).toBe('http://test.com');
  });
});

describe('timeSince', () => {
  it('returns formatted time since a given timestamp string', () => {
    const curDate = new Date(
      'Mon Jun 26 2023 16:43:32 GMT+0530 (India Standard Time)'
    );
    expect(timeSince('2023-06-15T04:35:20.437764+00:00', curDate)).toBe(
      '11 days ago'
    );
    expect(timeSince('2023-06-20T14:18:10.540754+00:00', curDate)).toBe(
      '5 days ago'
    );
    expect(timeSince('2023-06-26T11:08:11.274736+00:00', curDate)).toBe(
      '5 minutes ago'
    );
  });
});
