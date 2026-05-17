import { AuthContext } from './contexts';

// Demo user for workspace preview.
// In production, replace this with the real Firebase AuthProvider.
const DEMO_USER = {
  uid: 'demo',
  displayName: 'Demo User',
  email: 'demo@bitebook.app',
  photoURL: null,
};

export const AuthProvider = ({ children }) => {
  const login = () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user: DEMO_USER, loading: false, login, logout, authError: null }}>
      {children}
    </AuthContext.Provider>
  );
};
