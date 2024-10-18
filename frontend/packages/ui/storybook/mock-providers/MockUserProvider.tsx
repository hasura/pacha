import { UserContext } from '@console/context';

import { mockUser } from '../mock-data';

export function MockUserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={mockUser}>{children}</UserContext.Provider>
  );
}
