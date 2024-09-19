import { ProjectContext } from '@console/context';

import { mockProjectData } from './mockProjectData';

export function MockProjectContext({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={mockProjectData}>
      {children}
    </ProjectContext.Provider>
  );
}
