import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "@/utils/localStorageMethods";
import { handleLogout } from "@/utils/helper";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:8000",
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

// Optional: place for refresh logic later if you add refresh view
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // token invalid → logout
    handleLogout();
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vendor", "VendorProfile"],
  endpoints: () => ({}),
});
