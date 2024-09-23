import type { MantineColorsTuple } from '@mantine/core';
import colors from 'tailwindcss/colors';

const isTailwindColorObject = (
  color: unknown
): color is Record<string, string> => {
  return typeof color === 'object' && color !== null && !Array.isArray(color);
};

const tailwindColorToMantineColor = (
  tailwindColorObject: Record<string, string>
): MantineColorsTuple => {
  return Object.values(tailwindColorObject) as unknown as MantineColorsTuple;
};

export const tailwindColors = Object.entries(colors).reduce<
  Record<string, MantineColorsTuple>
>((colorz, color) => {
  const [key, colorData] = color;

  // this check only adds colors that are objects
  // i.e. not the string value colors like black/white/transparent/current/inherit etc.
  if (isTailwindColorObject(colorData)) {
    colorz[key] = tailwindColorToMantineColor(colorData);
  }

  return colorz;
}, {});
