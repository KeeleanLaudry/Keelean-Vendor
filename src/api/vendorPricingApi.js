// src/api/vendorPricingApi.js
// RTK Query endpoints for Vendor Pricing Spreadsheet
// Backend: /api/vendor/pricing/* (VendorPricingViewSet)

import { baseApi } from "./baseApi";

export const vendorPricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── SPREADSHEET DATA ───
    // GET /api/vendor/pricing/spreadsheet_view/?service_id=&category_id=&subcategory_id=&item_id=
    getSpreadsheetView: builder.query({
      query: ({ serviceId, categoryId, subcategoryId, itemId } = {}) => {
        const params = new URLSearchParams();
        if (serviceId) params.append("service_id", serviceId);
        if (categoryId) params.append("category_id", categoryId);
        if (subcategoryId) params.append("subcategory_id", subcategoryId);
        if (itemId) params.append("item_id", itemId); // ✨ NEW
        const qs = params.toString();
        return `/api/vendor/pricing/spreadsheet_view/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Pricing"],
    }),

    // ─── STATS ───
    getPricingStats: builder.query({
      query: () => "/api/vendor/pricing/stats/",
      providesTags: ["Pricing"],
    }),

    // ─── SINGLE CRUD ───
    createPricing: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/pricing/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pricing"],
    }),

    // PATCH /api/vendor/pricing/{id}/  — partial update (only base_price)
    updatePricing: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/vendor/pricing/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Pricing"],
    }),

    deletePricing: builder.mutation({
      query: (id) => ({
        url: `/api/vendor/pricing/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pricing"],
    }),

    // ─── BULK OPERATIONS ───
    bulkCreatePricing: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/pricing/bulk_create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pricing"],
    }),

    bulkUpdatePricing: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/pricing/bulk_update/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pricing"],
    }),

    bulkDeletePricing: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/pricing/bulk_delete/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pricing"],
    }),

    // ─── CSV ───
    importCSV: builder.mutation({
      query: (formData) => ({
        url: "/api/vendor/pricing/import_csv/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Pricing"],
    }),

    exportCSV: builder.query({
      query: () => ({
        url: "/api/vendor/pricing/export_csv/",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSpreadsheetViewQuery,
  useGetPricingStatsQuery,
  useCreatePricingMutation,
  useUpdatePricingMutation,
  useDeletePricingMutation,
  useBulkCreatePricingMutation,
  useBulkUpdatePricingMutation,
  useBulkDeletePricingMutation,
  useImportCSVMutation,
  useLazyExportCSVQuery,
} = vendorPricingApi;
