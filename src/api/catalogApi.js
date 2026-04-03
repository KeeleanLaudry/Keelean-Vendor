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

    // ADD-ONS (admin catalogue — vendor reads)
    getAddOns: builder.query({
      query: () => "/api/admin/catalog/addons/",
      providesTags: ["AddOn"],
    }),

    // FOLDING OPTIONS (admin catalogue — vendor reads)
    getFoldingOptions: builder.query({
      query: () => "/api/admin/catalog/folding-options/",
      providesTags: ["FoldingOption"],
    }),

    // CUSTOMISATION OPTIONS (admin catalogue — vendor reads)
    getCustomisationOptions: builder.query({
      query: () => "/api/admin/catalog/customisation-options/",
      providesTags: ["CustomisationOption"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetItemsQuery,
  useGetAttributeTypesQuery,
  useGetAttributeOptionsQuery,
  useGetAddOnsQuery,
  useGetFoldingOptionsQuery,
  useGetCustomisationOptionsQuery,
} = catalogApi;
