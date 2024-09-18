import React from 'react';

export const copyToClipboard = (text: string, callback?: VoidFunction) => {
  navigator.clipboard.writeText(text).then(() => {
    if (callback) callback();
  });
};

export const handleEnterKey =
  (callback: (e: React.KeyboardEvent) => void) =>
  (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      callback(event);
    }
  };

export const abbreviateNumber = (number: number, decPlaces: number): string => {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces);

  // Enumerate number abbreviations
  const abbrev = ['k', 'm', 'b', 't'];

  // Go through the array backwards, so we do the largest first
  for (let i = abbrev.length - 1; i >= 0; i--) {
    // Convert array index to "1000", "1000000", etc
    const size = Math.pow(10, (i + 1) * 3);

    // If the number is bigger or equal do the abbreviation
    if (size <= number) {
      // Here, we multiply by decPlaces, round, and then divide by decPlaces.
      // This gives us nice rounding to a particular decimal place.
      number = Math.round((number * decPlaces) / size) / decPlaces;

      // Handle special case where we round up to the next abbreviation
      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      // Add the letter for the abbreviation
      number += abbrev[i] as any;

      // We are done... stop
      break;
    }
  }

  return number.toString();
};

export function coinFlip() {
  return Math.random() < 0.5 ? false : true;
}
// a function that returns a promise after waiting for a specified time
export const wait = (
  time: number,
  options?: { throwError?: boolean; errorMessage?: string }
) => {
  const { throwError = false, errorMessage = 'An error occurred' } =
    options ?? {};
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (throwError) {
        reject(errorMessage);
      } else {
        resolve();
      }
    }, time);
  });
};

export const sortObjectByKeys = <T extends Record<string, unknown>>(
  obj: T
): T => {
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = obj[key];
        return acc;
      },
      {} as Record<string, unknown>
    ) as T;
};
