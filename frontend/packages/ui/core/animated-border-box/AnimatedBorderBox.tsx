/* eslint-disable react/no-danger */
import React from 'react';
import { Paper, PaperProps } from '@mantine/core';

import { ExtendedCustomColors } from '@/types';

export type AnimatedBorderProps = {
  primaryColor?: ExtendedCustomColors;
  secondaryColor?: ExtendedCustomColors;
  shade?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

const css = (props?: AnimatedBorderProps): TrustedHTML => {
  const {
    primaryColor = 'indigo',
    secondaryColor = 'pink',
    shade = 3,
  } = props ?? {};

  const css = `
  /*test */
.animated-border-box {
  --border-angle: 0turn; 
  --main-bg: conic-gradient(
    from var(--border-angle),
    var(--mantine-color-background-1),
    var(--mantine-color-background-1) 5%,
    var(--mantine-color-background-2) 60%,
    var(--mantine-color-background-3) 95%
  );

  --gradient-border: conic-gradient(
    from var(--border-angle),
    transparent 25%,
    light-dark(var(--mantine-color-${primaryColor}-${shade}), var(--mantine-color-${primaryColor}-${shade})),
    light-dark(var(--mantine-color-${secondaryColor}-${shade - 1}), var(--mantine-color-${secondaryColor}-${shade - 1})) 99%,
    transparent
  );

  background:
    var(--main-bg) padding-box,
    var(--gradient-border) border-box,
    var(--main-bg) border-box;

  background-position: center center;

  animation: bg-spin 4s linear infinite;
}

@keyframes bg-spin {
  to {
    --border-angle: 1turn;
  }
}

.animated-border-box:hover {
  animation-play-state: paused;
}

@property --border-angle {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0turn;
}
`;

  return css;
};

export const AnimatedBorderBox = ({
  children,
  animationProps,
  ...props
}: {
  children: React.ReactNode;
  animationProps?: AnimatedBorderProps;
} & PaperProps) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css(animationProps) }} />
      <Paper
        p={0}
        {...props}
        bd={'solid 3px transparent'}
        style={{ overflow: 'hidden' }}
        className="animated-border-box"
      >
        {children}
      </Paper>
    </>
  );
};
