import { expect } from 'vitest';

import { hasCachedDirective, toggleCacheDirective } from './cacheDirective';

describe('hasCachedDirective', () => {
  it('should not detect a cache directive on query when there is none present', () => {
    const query = `query MyQuery {
  Playlist {
    Name
  }
}

query MyQuery2 {
  Artist {
    ArtistId
  }
}`;
    const result = hasCachedDirective(query);
    expect(result).toBeFalsy();
  });

  it('should detect the cache directive on query when there all queries have the directive', () => {
    const query = `query MyQuery @cached {
  Playlist {
    Name
  }
}

query MyQuery2 @cached {
  Artist {
    ArtistId
  }
}`;
    const result = hasCachedDirective(query);
    expect(result).toBeTruthy();
  });

  it('should detect the cache directive on query when there some queries have the directive', () => {
    const query = `query MyQuery @cached {
  Playlist {
    Name
  }
}

query MyQuery2 {
  Artist {
    ArtistId
  }
}`;
    const result = hasCachedDirective(query);
    expect(result).toBeTruthy();
  });
});

describe('toggleCacheDirective', () => {
  it('should not add a cache directive on mutation', () => {
    const query = `mutation MyMutation($Title: String = "") {
  insert_Employee(objects: {Title: $Title}) {
    affected_rows
  }
}`;
    const result = toggleCacheDirective(query);

    expect(result).toEqual(query);
    expect(result).not.contains('@cached');
  });

  it('should not add a cache directive on subscription', () => {
    const query = `subscription MySubscription {
  Playlist {
    Name
  }
}`;
    const result = toggleCacheDirective(query);

    expect(result).toEqual(query);
    expect(result).not.contains('@cached');
  });

  it('should add a cache directive on query when there is none present', () => {
    const query = `query MyQuery {
  Playlist {
    Name
  }
}`;
    const result = toggleCacheDirective(query);

    expect(result).toMatchInlineSnapshot(`
      "query MyQuery @cached {
        Playlist {
          Name
        }
      }"
    `);
    expect(result).contains('@cached');
  });

  it('should remove the cache directive on query when there one present', () => {
    const query = `query MyQuery @cached {
  Playlist {
    Name
  }
}`;
    const result = toggleCacheDirective(query);

    expect(result).toMatchInlineSnapshot(`
      "query MyQuery {
        Playlist {
          Name
        }
      }"
    `);
    expect(result).not.contains('@cached');
  });

  it('should add the cache directive only on the query even if supplied with other operation', () => {
    const query = `query MyQuery {
  Playlist {
    Name
  }
}

subscription MySubscription {
  Playlist {
    Name
  }
}

mutation MyMutation($Title: String = "") {
  insert_Employee(objects: {Title: $Title}) {
    affected_rows
  }
}`;
    const result = toggleCacheDirective(query);

    expect(result).toMatchInlineSnapshot(`
  "query MyQuery @cached {
    Playlist {
      Name
    }
  }

  subscription MySubscription {
    Playlist {
      Name
    }
  }

  mutation MyMutation($Title: String = "") {
    insert_Employee(objects: {Title: $Title}) {
      affected_rows
    }
  }"
`);
    expect(result).contains('@cached');
  });

  it('should remove all cache directive when only one query has it', () => {
    const query = `query MyQuery @cached {
  Playlist {
    Name
  }
}

query MyQueryTwo {
  Playlist {
    Name
  }
}`;

    const result = toggleCacheDirective(query);

    expect(result).toMatchInlineSnapshot(`
      "query MyQuery {
        Playlist {
          Name
        }
      }

      query MyQueryTwo {
        Playlist {
          Name
        }
      }"
    `);
    expect(result).not.contains('@cached');
  });

  it('should add cache directives to multiple queries', () => {
    const query = `query MyQuery {
  Playlist {
    Name
  }
}

query MyQueryTwo {
  Playlist {
    Name
  }
}`;

    const result = toggleCacheDirective(query);

    expect(result).toMatchInlineSnapshot(`
      "query MyQuery @cached {
        Playlist {
          Name
        }
      }

      query MyQueryTwo @cached {
        Playlist {
          Name
        }
      }"
    `);
    expect(result).contains('@cached');
  });
});
