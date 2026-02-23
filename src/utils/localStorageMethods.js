const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const VENDOR_ID_KEY = "vendorId";
const ROLE_KEY = "role";

export const setAuthData = ({ access, refresh, vendor_id, role }) => {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (vendor_id) localStorage.setItem(VENDOR_ID_KEY, vendor_id);
  if (role) localStorage.setItem(ROLE_KEY, role);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY) || null;
export const getVendorId = () => localStorage.getItem(VENDOR_ID_KEY) || null;
export const getRole = () => localStorage.getItem(ROLE_KEY) || null;

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(VENDOR_ID_KEY);
  localStorage.removeItem(ROLE_KEY);
};
