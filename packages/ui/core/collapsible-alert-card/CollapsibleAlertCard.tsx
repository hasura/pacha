import React from 'react';
import {
  ActionIcon,
  Card,
  CardProps,
  Collapse,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

import { ExtendedCustomColors } from '@/types';
import { AnimatedChevron } from '@/ui/icons/AnimatedChevron';
import sectionClasses from './collapsible-alert-card-section.module.scss';

type CollapsibleAlertCardProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  color?: ExtendedCustomColors;
  radius?: CardProps['radius'];
  withBorder?: CardProps['withBorder'];
} & CardProps;

export function CollapsibleAlertCard({
  title,
  children,
  subtitle,
  icon,
  opened,
  defaultOpened,
  onChange,
  color = 'indigo',
  radius = 'md',
  withBorder = true,
  ...cardProps
}: CollapsibleAlertCardProps) {
  const [_value, handler] = useUncontrolled({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Card
      radius={radius}
      style={{
        borderColor: `var(--mantine-color-${color}-3)`,
        borderWidth: 2,
      }}
      withBorder={withBorder}
      data-theme-color={color}
      {...cardProps}
    >
      <Card.Section
        p={'lg'}
        onClick={() => {
          triggerRef.current?.click();
        }}
        classNames={sectionClasses}
      >
        <Group gap={'lg'}>
          <Text c={`var(--mantine-color-${color}-text)`}>{icon}</Text>

          <Group flex={1} justify="space-between">
            <Stack gap={4}>
              <Text component={Group} size="lg" fw={500}>
                {title}
              </Text>
              {!!subtitle && <Text c={'gray'}>{subtitle}</Text>}
            </Stack>
            <ActionIcon
              ref={triggerRef}
              size={'lg'}
              variant="subtle"
              onClick={e => {
                handler(!_value);
                e.stopPropagation();
              }}
            >
              <AnimatedChevron size={26} opened={_value} />
            </ActionIcon>
          </Group>
        </Group>
      </Card.Section>
      <Card.Section>
        <Collapse in={_value}>{children}</Collapse>
      </Card.Section>
    </Card>
  );
}
