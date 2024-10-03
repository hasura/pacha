import {
  Box,
  BoxProps,
  Group,
  GroupProps,
  Stack,
  StackProps,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';

export function HoverBox({
  children,
  ...props
}: {
  children: (hovered: boolean) => React.ReactNode;
} & Omit<BoxProps, 'children'>) {
  const { ref, hovered } = useHover();

  return (
    <Box ref={ref} {...props}>
      {children(hovered)}
    </Box>
  );
}

export function HoverStack({
  children,
  ...props
}: {
  children: (hovered: boolean) => React.ReactNode;
} & Omit<StackProps, 'children'>) {
  const { ref, hovered } = useHover();

  return (
    <Stack ref={ref} {...props}>
      {children(hovered)}
    </Stack>
  );
}

export function HoverGroup({
  children,
  ...props
}: {
  children: (hovered: boolean) => React.ReactNode;
} & Omit<GroupProps, 'children'>) {
  const { ref, hovered } = useHover();

  return (
    <Group ref={ref} {...props}>
      {children(hovered)}
    </Group>
  );
}
