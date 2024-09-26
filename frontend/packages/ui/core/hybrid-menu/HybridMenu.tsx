import { useState } from 'react';
import { Menu, MenuItemProps, Text, Tooltip } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import clsx from 'clsx';

import { ExtendedCustomColors } from '@/types';
import { Icons } from '@/ui/icons';
import menuStyles from './menu-styles.module.css';

type Option = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: ExtendedCustomColors;
  disabled?: boolean;
  disableTooltip?: string;
};
type Action = {
  label: string;
  disableTooltip?: string;
  onClick: () => void;
  testId?: string;
} & MenuItemProps;

export function HybridMenu({
  options,
  value,
  defaultValue,
  target,
  actions = [],
  onChange,
  disableAllActions = false,
  disableAllActionsTooltip = 'These actions are not allowed.',
  disableAllValues = false,
  disableAllValuesTooltip = 'Changing the value is not allowed.',
}: {
  disableAllValues?: boolean;
  disableAllValuesTooltip?: string;
  disableAllActions?: boolean;
  disableAllActionsTooltip?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  actions?: Action[];
  target:
    | ((targetProps: {
        menuOpened: boolean;
        selectedOption: Option | undefined;
      }) => React.ReactNode)
    | React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  const [_value, handleChange] = useUncontrolled({
    value,
    defaultValue,
    onChange,
  });

  return (
    <Menu
      classNames={menuStyles}
      opened={opened}
      onChange={setOpened}
      width={'auto'}
      styles={{ dropdown: { minWidth: 120 } }}
      position="bottom-end"
    >
      <Menu.Target>
        {typeof target === 'function'
          ? // target can be passed opened state and selected option so target can use that data
            target({
              menuOpened: opened,
              selectedOption: options.find(o => o.value === _value),
            })
          : //target can also just be a react node
            target}
      </Menu.Target>
      <Menu.Dropdown>
        <Tooltip
          label={disableAllValuesTooltip}
          position="top"
          offset={10}
          disabled={!disableAllValues}
        >
          <div>
            {options.map((item: Option) => (
              <Tooltip
                key={item.value}
                disabled={!item.disabled}
                position="left"
                offset={10}
                withArrow
                label={item.disableTooltip}
              >
                {/* tooltip won't work when item is disabled, so we need to wrap this in a div */}
                <div>
                  <Menu.Item
                    disabled={disableAllValues || item.disabled}
                    onClick={() => {
                      handleChange(item.value);
                    }}
                    color={item.color}
                    leftSection={item.icon}
                    rightSection={
                      <Icons.Check
                        className={clsx(
                          'invisible',
                          item.value === _value && '!visible'
                        )}
                      />
                    }
                  >
                    <Text fw={item.value === _value ? 500 : 400} size="sm">
                      {item.label}
                    </Text>
                  </Menu.Item>
                </div>
              </Tooltip>
            ))}
          </div>
        </Tooltip>

        {actions.length > 0 && (
          <>
            <Menu.Divider />
            <Tooltip
              label={disableAllActionsTooltip}
              disabled={!disableAllActions}
            >
              <div>
                {actions.map(
                  ({
                    label,
                    onClick,
                    disableTooltip,
                    testId,
                    ...menuItemProps
                  }) => (
                    <Tooltip
                      key={label}
                      disabled={!menuItemProps.disabled || !disableTooltip}
                      label={disableTooltip}
                      position="left"
                      offset={10}
                      withArrow
                    >
                      <div>
                        <Menu.Item
                          onClick={() => {
                            onClick();
                            setOpened(false);
                          }}
                          {...menuItemProps}
                          disabled={menuItemProps.disabled || disableAllActions}
                          data-testid={testId}
                        >
                          {label}
                        </Menu.Item>
                      </div>
                    </Tooltip>
                  )
                )}
              </div>
            </Tooltip>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
