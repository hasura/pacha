import { ReactNode, Suspense } from 'react';
import {
  Box,
  LoadingOverlay,
  LoadingOverlayProps,
  MantineStyleProps,
  Skeleton,
  SkeletonProps,
} from '@mantine/core';

type Base = {
  children: ReactNode;
  loaderType: 'overlay' | 'contained' | 'skeleton' | 'custom';
};

type Overlay = Base & {
  loaderType: 'overlay';
  loaderProps?: LoadingOverlayProps['loaderProps'];
};

type Contained = Base & {
  loaderType: 'contained';
  containerProps: MantineStyleProps;
  loaderProps?: LoadingOverlayProps['loaderProps'];
};

type Skeleton = Base & {
  loaderType: 'skeleton';
  skeletonProps: SkeletonProps;
};

type Custom = Base & {
  loaderType: 'custom';
  loader: ReactNode;
};

type LazyLoaderProps = Overlay | Contained | Skeleton | Custom;

const defaultLoaderProps = {
  type: 'bars',
  color: 'gray',
  opacity: 0.5,
};

export const LazyLoader = (props: LazyLoaderProps) => (
  <Suspense
    fallback={
      props.loaderType === 'overlay' ? (
        <LoadingOverlay
          loaderProps={{
            ...defaultLoaderProps,
            ...props.loaderProps,
          }}
          visible
        />
      ) : props.loaderType === 'contained' ? (
        <Box {...props.containerProps}>
          <LoadingOverlay
            loaderProps={{
              ...defaultLoaderProps,
              ...props.loaderProps,
            }}
            visible
          />
        </Box>
      ) : props.loaderType === 'skeleton' ? (
        <Skeleton {...props.skeletonProps} />
      ) : props.loaderType === 'custom' ? (
        props.loader
      ) : null
    }
  >
    {props.children}
  </Suspense>
);
