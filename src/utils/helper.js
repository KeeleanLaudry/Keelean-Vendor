import { clearAuthData } from "./localStorageMethods";

export const handleLogout = () => {
  clearAuthData();
  // Optional: redirect to login
};
