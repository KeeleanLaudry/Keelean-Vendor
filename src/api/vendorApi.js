// api/vendorApi.js
import { baseApi } from "./baseApi";

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── PRICING ─────────────────────────────
    createPricing: builder.mutation({
      query: (formData) => ({
        url: "/vendor/pricing/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Pricing"],
    }),

    getPricing: builder.query({
      query: () => "/vendor/pricing/",
      providesTags: ["Pricing"],
    }),

    // ── ITEM ADD-ONS ────────────────────────
    getItemAddOns: builder.query({
      query: (itemId) =>
        itemId ? `/vendor/item-addons/?item=${itemId}` : "/vendor/item-addons/",
      providesTags: ["ItemAddOn"],
    }),

    createItemAddOn: builder.mutation({
      query: (data) => ({
        url: "/vendor/item-addons/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ItemAddOn"],
    }),

    // ── ITEM FOLDING ────────────────────────
    getItemFoldings: builder.query({
      query: (itemId) =>
        itemId
          ? `/vendor/item-foldings/?item=${itemId}`
          : "/vendor/item-foldings/",
      providesTags: ["ItemFolding"],
    }),

    createItemFolding: builder.mutation({
      query: (data) => ({
        url: "/vendor/item-foldings/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ItemFolding"],
    }),

    // ── ITEM CUSTOMISATION ──────────────────
    getItemCustomisations: builder.query({
      query: (itemId) =>
        itemId
          ? `/vendor/item-customisations/?item=${itemId}`
          : "/vendor/item-customisations/",
      providesTags: ["ItemCustomisation"],
    }),

    createItemCustomisation: builder.mutation({
      query: (data) => ({
        url: "/vendor/item-customisations/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ItemCustomisation"],
    }),
  }),
});

export const {
  useCreatePricingMutation,
  useGetPricingQuery,

  useGetItemAddOnsQuery,
  useCreateItemAddOnMutation,

  useGetItemFoldingsQuery,
  useCreateItemFoldingMutation,

  useGetItemCustomisationsQuery,
  useCreateItemCustomisationMutation,
} = vendorApi;
