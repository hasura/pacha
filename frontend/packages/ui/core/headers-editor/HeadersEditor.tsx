import * as React from 'react';
import { Grid, Paper } from '@mantine/core';
import { produce } from 'immer';
import { uniqueId } from 'lodash';

import { useSchemeColors } from '@/ui/hooks';
import { Table } from '../table/';
import { readOnlyKeys } from './constants';
import { TableRow } from './TableRow';
import { GraphiQLHeader } from './types';

export type HeadersEditorProps = {
  headers: GraphiQLHeader[];
  onHeadersUpdate: (headers: GraphiQLHeader[]) => void;
};

export const HeadersEditor = ({
  headers: graphiqlHeaders,
  onHeadersUpdate: setGraphiqlHeaders,
}: HeadersEditorProps) => {
  const [localHeaders, setLocalHeaders] = React.useState<GraphiQLHeader[]>([
    ...graphiqlHeaders,
  ]);

  React.useEffect(() => {
    setLocalHeaders(graphiqlHeaders);
  }, [graphiqlHeaders]);

  const onHeadersChange = React.useCallback(
    ({
      headers,
      updateGraphiQL,
    }: {
      headers: GraphiQLHeader[];
      updateGraphiQL?: boolean;
    }) => {
      setLocalHeaders(headers);
      if (updateGraphiQL) {
        setGraphiqlHeaders(headers);
      }
    },
    [setGraphiqlHeaders]
  );

  const [unmaskedHeaders, setUnmaskedHeaders] = React.useState<string[]>([]);
  const [draftId, setDraftId] = React.useState<string>(() => uniqueId());

  const { bg } = useSchemeColors();

  return (
    <>
      <Grid
        columns={100}
        component={Paper}
        //@ts-expect-error
        radius="lg"
        style={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
        bg={bg.level4}
        px={'md'}
        py={'xs'}
      >
        <Grid.Col fw={600} fz={'sm'} span={'content'}>
          Enabled
        </Grid.Col>
        <Grid.Col fw={600} fz={'sm'} span={35}>
          Header Key
        </Grid.Col>
        <Grid.Col fw={600} fz={'sm'} span={'auto'}>
          Value
        </Grid.Col>
      </Grid>
      <Paper
        radius={'lg'}
        pb={8}
        px={'md'}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflowY: 'auto',
        }}
        mah={{ base: '15dvh', md: '20dvh' }}
      >
        <Table
          noPaper
          verticalSpacing={8}
          horizontalSpacing={'md'}
          withRowBorders
          withTableBorder={false}
        >
          <Table.Body>
            {localHeaders.map((header, index) => (
              <TableRow
                header={header}
                key={header.id}
                canDelete={!readOnlyKeys.includes(header.key)}
                showMasked={unmaskedHeaders.includes(header.key)}
                onMaskClick={() => {
                  if (!unmaskedHeaders.includes(header.key)) {
                    setUnmaskedHeaders(draft => [...draft, header.key]);
                  } else {
                    setUnmaskedHeaders(draft =>
                      draft.filter(h => h !== header.key)
                    );
                  }
                }}
                onDelete={() => {
                  onHeadersChange({
                    headers: produce(localHeaders, draft => {
                      draft.splice(index, 1);
                    }),
                    updateGraphiQL: true,
                  });
                }}
                onBlur={item => {
                  onHeadersChange({
                    headers: produce(localHeaders, draft => {
                      draft[index] = item;
                    }),
                    updateGraphiQL: true,
                  });
                }}
                onChange={item => {
                  onHeadersChange({
                    headers: produce(localHeaders, draft => {
                      draft[index] = item;
                    }),
                  });
                }}
                onToggleCheckbox={item => {
                  onHeadersChange({
                    headers: produce(localHeaders, draft => {
                      draft[index] = item;
                    }),
                    updateGraphiQL: true,
                  });
                }}
                // this tells the component that this row was just added
                isDraft={header.id === draftId}
                onDraftMount={() => {
                  // when we mount the draft row, we reset the draft id
                  // we need to wait for the mount because the "isDraft" flag is used
                  // to transfer focus to the newly added row
                  // but after mount and focus transfer we need to reset the draft id
                  setDraftId(uniqueId());
                }}
              />
            ))}
            <TableRow
              key={draftId}
              keyTestId="add-request-header-key"
              valueTestId="add-request-header-value"
              header={{ key: '', value: '', enabled: true, id: draftId }}
              disableCheckbox
              onChange={row => {
                // on first change this row will be added to the headers
                // we use the draftId to transfer input focus
                onHeadersChange({
                  headers: produce(localHeaders, draft => {
                    draft.push(row);
                  }),
                });
              }}
            />
          </Table.Body>
        </Table>
      </Paper>
    </>
  );
};
