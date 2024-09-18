export const sortByField = <T>(arr: T[], field: keyof T) => {
  return arr.sort((x, y) => {
    let name1: any = x[field];
    if (typeof name1 === 'string') {
      name1 = name1.toLowerCase();
    }
    let name2: any = y[field];
    if (typeof name2 === 'string') {
      name2 = name2.toLowerCase();
    }
    if (name1 > name2) {
      return 1;
    }
    if (name2 > name1) {
      return -1;
    }
    return 0;
  });
};

export const sortStringComparison = (str1: string, str2: string) => {
  if (str1 > str2) {
    return 1;
  }
  if (str2 > str1) {
    return -1;
  }
  return 0;
};

export const getRandomNumericStr = (length: number) => {
  let str = '';
  Array(length)
    .fill(null)
    .forEach((_, i) => {
      str += Math.floor(Math.random() * 10);
    });
  return str;
};

/**
 * Check if a substring exists within another string (case-insensitive).
 * @param item The main string.
 * @param filter The substring to check.
 * @returns Whether the item contains the filter.
 */
export const checkSubString = (item: string, filter: string): boolean => {
  if (!item) return false;
  return item.toLowerCase().includes(filter.toLowerCase());
};

/**
 * Filters an array of objects based on a substring match in specified keys.
 * @param objects The array of objects to filter.
 * @param objectKeys The keys in the objects to check.
 * @param filterString The substring to look for.
 * @returns The filtered array of objects.
 */
export const filterObjects = <T extends Record<string, any>>({
  objects,
  keys,
  filterString,
}: {
  objects: T[];
  keys: string | string[];
  filterString: string;
}): T[] => {
  // If no filter string provided, return all objects.
  if (!filterString) return objects;

  // Ensure keys is an array for consistency.
  const keysToCheck = Array.isArray(keys) ? keys : [keys];

  return objects.filter(object =>
    keysToCheck.some(key => {
      let valueToCheck: Record<string, any> | string = object;

      // handle keys with . in them to check nested paths
      key.split('.').forEach(subKey => {
        valueToCheck =
          typeof valueToCheck !== 'string'
            ? valueToCheck[subKey]
            : valueToCheck;
      });

      return typeof valueToCheck === 'string'
        ? checkSubString(valueToCheck, filterString)
        : false; // TODO: raise sentry error
    })
  );
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const isValidEmail = (email: string) => {
  return email.match(emailRegex);
};

export const joinSnakeCase = (strings: string[]) => {
  return strings.join('_');
};

// handles capital letter in strings
export const joinCamelCase = (strings: string[]) => {
  return [strings[0]]
    .concat(strings.slice(1).map(s => capitalizeFirstLetter(s)))
    .join('');
};

// handles capital letter in strings
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const indefiniteArticle = (word: string): string => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return vowels.includes(word.charAt(0)) ? 'an' : 'a';
};
