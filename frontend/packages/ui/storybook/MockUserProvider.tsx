import { UserContext } from '@console/context';

import { mockUser } from './mockUser';

export function MockUserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={mockUser}>{children}</UserContext.Provider>
  );
}
