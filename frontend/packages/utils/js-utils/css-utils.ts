/**
 * multipies a css value by a number.
 * for example: multiplyCssValue('1rem', 2) => 'calc(1rem * 2)'
 * @param cssValue
 * @param multiplier
 * @returns string
 */
export function multiplyCssValue(cssValue: string, multiplier: number) {
  return `calc(${cssValue} * ${multiplier})`;
}
