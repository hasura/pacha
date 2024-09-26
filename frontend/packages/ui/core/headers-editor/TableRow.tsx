import * as React from 'react';
import { ActionIcon, Center, Checkbox, Group } from '@mantine/core';

import { Icons } from '@/ui/icons';
import { IconTooltip } from '../icon-tooltip';
import { Table } from '../table/';
import { TextInput } from '../text-input/';
import {
  headerTooltips,
  maskedKeys,
  readOnlyKeys,
  readOnlyValues,
} from './constants';
import { GraphiQLHeader } from './types';

export function TableRow({
  header,
  onChange,
  onBlur,
  showMasked,
  onMaskClick,
  canDelete,
  onDelete,
  isDraft,
  onDraftMount,
  disableCheckbox,
  onToggleCheckbox,
  keyTestId,
  valueTestId,
}: {
  header: GraphiQLHeader;
  onChange: (item: GraphiQLHeader) => void;
  onBlur?: (item: GraphiQLHeader) => void;
  showMasked?: boolean;
  onMaskClick?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
  isDraft?: boolean;
  onDraftMount?: () => void;
  disableCheckbox?: boolean;
  onToggleCheckbox?: (item: GraphiQLHeader) => void;
  keyTestId?: string;
  valueTestId?: string;
}) {
  React.useEffect(() => {
    if (isDraft && onDraftMount) {
      onDraftMount();
    }
  }, []);

  const isKeyReadOnly =
    header.readonly || readOnlyKeys.includes(header.key.toLowerCase());
  const isValueReadonly =
    header.readonly || readOnlyValues.includes(header.key.toLowerCase());
  const isMaskedValue = maskedKeys.includes(header.key.toLowerCase());

  return (
    <Table.Row>
      <Table.Cell width={25}>
        <Center>
          <Checkbox
            aria-label={header.key}
            disabled={disableCheckbox || header.readonly}
            checked={header.enabled}
            onChange={e =>
              onToggleCheckbox?.({
                ...header,
                enabled: e.currentTarget.checked,
              })
            }
          />
        </Center>
      </Table.Cell>
      <Table.Cell w={'35%'}>
        <TextInput
          variant="underline"
          data-testid={keyTestId}
          placeholder="Key"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={isDraft} // focus the input when we initially add a new row
          type={'text'}
          value={header.key}
          onTextChange={key => onChange({ ...header, key })}
          onBlur={e => onBlur?.({ ...header, key: e.currentTarget.value })}
          leftSection={isKeyReadOnly && <Icons.EditDisabled />}
          readOnly={isKeyReadOnly}
          rightSection={
            !!headerTooltips[header.key] && (
              <IconTooltip
                multiline
                maw={400}
                label={headerTooltips[header.key]}
              />
            )
          }
        />
      </Table.Cell>
      <Table.Cell>
        <TextInput
          variant="underline"
          placeholder="Value"
          data-testid={valueTestId}
          type={isMaskedValue && showMasked !== true ? 'password' : 'text'}
          value={header.value}
          onTextChange={value => onChange({ ...header, value })}
          onBlur={e => onBlur?.({ ...header, value: e.currentTarget.value })}
          leftSection={isValueReadonly && <Icons.EditDisabled />}
          readOnly={isValueReadonly}
          styles={{
            input: {
              // since this displays two icons, we need extra padding
              paddingRight: isMaskedValue && canDelete ? 50 : undefined,
            },
          }}
          rightSection={
            <Group wrap="nowrap" gap={8}>
              {isMaskedValue && onMaskClick && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="hide/show"
                  onClick={onMaskClick}
                >
                  {showMasked === true ? (
                    <Icons.PasswordHide />
                  ) : (
                    <Icons.PasswordShow />
                  )}
                </ActionIcon>
              )}
              {!header.readonly && canDelete && onDelete && (
                <ActionIcon variant="subtle" onClick={onDelete} color="gray">
                  <Icons.Delete />
                </ActionIcon>
              )}
            </Group>
          }
        />
      </Table.Cell>
    </Table.Row>
  );
}
