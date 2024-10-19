import { ProjectNavigationDrawer } from '@console/routing/layout';
import { ConsoleAppShell } from '@console/ui/common';

export function MockAppShell({
  children,
  headerText,
}: {
  children: React.ReactNode;
  headerText?: string;
}) {
  return (
    <ConsoleAppShell
      navbar={<ProjectNavigationDrawer />}
      header={
        <div>
          {headerText ??
            'Navigation does not work. Disregard the sidebar data.'}
        </div>
      }
    >
      {children}
    </ConsoleAppShell>
  );
}
