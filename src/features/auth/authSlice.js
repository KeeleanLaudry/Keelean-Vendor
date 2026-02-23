import { createSlice } from "@reduxjs/toolkit";
import { getVendorId, getRole } from "@/utils/localStorageMethods";

const initialState = {
  vendorId: getVendorId(),
  role: getRole(),
  isAuthenticated: !!getVendorId(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      state.vendorId = action.payload.vendorId;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    clearAuthState: (state) => {
      state.vendorId = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthState, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
