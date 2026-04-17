import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "@/utils/localStorageMethods";
import { handleLogout } from "@/utils/helper";

// ✅ Base query (FIXED)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:8000",

  prepareHeaders: (headers) => {
    const token = getToken();

    // 🔍 Debug (remove later)
    console.log("TOKEN:", token);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },

  // ❌ REMOVED: credentials: "include"
});

// ✅ Wrapper with safe logout
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const token = getToken();

    // only logout if user was actually logged in
    if (token) {
      console.warn("401 detected → logging out");

      handleLogout();

      // 🔥 clear RTK Query cache
      api.dispatch(baseApi.util.resetApiState());
    }
  }

  return result;
};

// ✅ API
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Vendor",
    "VendorProfile",
    "Pricing",
    "Service",
    "Item",
    "Category", // ← ADD THIS
    "Subcategory",
    "AttributeType",
    "AttributeOption",
    "Pricing",
  ],

  endpoints: () => ({}),
});
