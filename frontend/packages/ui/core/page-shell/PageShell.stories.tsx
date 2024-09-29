import { ErrorBoundary } from '@console/ui/common';
import { Container, Skeleton } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { hasMessageProperty } from '@/utils/js-utils';
import { MockAppShell } from '../../storybook/MockAppShell';
import { GenericError } from '../generic-error';
import { PageShellTab } from './components/TabBar';
import { PageShell } from './PageShell';

export default {
  component: PageShell,
  parameters: {
    layout: {
      fullscreen: true,
    },
  },
} as Meta<typeof PageShell>;

const mockTabs: PageShellTab[] = [
  {
    title: 'Tab One',
    isActive: false,
    icon: 'Build',
    onClick: () => {},
  },
  {
    title: 'Tab Two',
    isActive: true,
    icon: 'Api',
    onClick: () => {},
  },
  {
    title: 'Tab Three',
    isActive: false,
    icon: 'Broadcast',
    onClick: () => {},
  },
];

function SomeContent() {
  return (
    <Container fluid m="xs">
      Top
      {[...Array(50).keys()].map(i => (
        // shows different number of skeleton cards based on screen size
        <Skeleton animate={false} visible h={150} w={'100%'} mb={'sm'} />
      ))}
      Bottom
    </Container>
  );
}
export const Basic: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Header>Header</PageShell.Header>
            <PageShell.Content>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};

export const WithTabBar: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell tabs={mockTabs}>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Header>Header</PageShell.Header>
            <PageShell.Content>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};

export const NoHeader: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Content>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};
export const NoHeaderWithTabs: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell tabs={mockTabs}>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Content>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};
export const NoSidebar: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell>
          <PageShell.Main>
            <PageShell.Header>Header</PageShell.Header>
            <PageShell.Content>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};

export const ScrollAreaProps: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Header>Header</PageShell.Header>
            <PageShell.Content
              scrollAreaProps={{ type: 'auto', offsetScrollbars: 'y' }}
            >
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};
export const LargerHeader: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell headerHeight={120}>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Header>Header</PageShell.Header>
            <PageShell.Content>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};
export const ScrollClamp: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell scrollClamp>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Header>
              With the scrollClamp prop set on the page shell, it is up to the
              children of PageShell.Content to control scroll
            </PageShell.Header>
            <PageShell.Content>
              <div style={{ overflowY: 'auto' }}>
                <SomeContent />
              </div>
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};
export const BackgroundColors: StoryObj<typeof PageShell> = {
  render: () => {
    return (
      <MockAppShell>
        <PageShell sideBarHeaderBg={'var(--mantine-color-indigo-light)'}>
          <PageShell.Sidebar>
            <SomeContent />
          </PageShell.Sidebar>
          <PageShell.Main>
            <PageShell.Header>Header</PageShell.Header>
            <PageShell.Content bg={'var(--mantine-color-teal-light)'}>
              <SomeContent />
            </PageShell.Content>
          </PageShell.Main>
        </PageShell>
      </MockAppShell>
    );
  },
};

export const PageShellHierarchyError: StoryObj<typeof PageShell> = {
  name: '<PageShell /> hierarchy error',
  render: () => {
    return (
      <MockAppShell headerText="Inner PageShell components should only be used within <PageShell />. If they are used incorrectly, an error will be thrown.">
        <ErrorBoundary
          errorHandler={e => (
            <GenericError
              message={hasMessageProperty(e) ? e.message : 'Foof'}
            />
          )}
        >
          <PageShell.Main>foo</PageShell.Main>
        </ErrorBoundary>
      </MockAppShell>
    );
  },
};

export const PageShellMainHierarchyError: StoryObj<typeof PageShell> = {
  name: '<PageShell.Main /> hierarchy error',
  render: () => {
    return (
      <MockAppShell headerText="PageShell.Content and PageShell.Header should only be used within <PageShell.Main />. If they are used incorrectly, an error will be thrown.">
        <ErrorBoundary
          errorHandler={e => (
            <GenericError
              message={hasMessageProperty(e) ? e.message : 'Foof'}
            />
          )}
        >
          <PageShell.Content>foo</PageShell.Content>
        </ErrorBoundary>
      </MockAppShell>
    );
  },
};
