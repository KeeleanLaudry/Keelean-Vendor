// api/catalogApi.js
import { baseApi } from "./baseApi";

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // SERVICES
    getServices: builder.query({
      query: () => "/api/admin/catalog/services/",
      providesTags: ["Service"],
    }),

    // ITEMS
    getItems: builder.query({
      query: () => "/api/admin/catalog/items/",
      providesTags: ["Item"],
    }),

    // ATTRIBUTE TYPES
    getAttributeTypes: builder.query({
      query: () => "/api/admin/catalog/attribute-types/",
      providesTags: ["AttributeType"],
    }),

    // ATTRIBUTE OPTIONS
    getAttributeOptions: builder.query({
      query: () => "/api/admin/catalog/attribute-options/",
      providesTags: ["AttributeOption"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetItemsQuery,
  useGetAttributeTypesQuery,
  useGetAttributeOptionsQuery,
} = catalogApi;
