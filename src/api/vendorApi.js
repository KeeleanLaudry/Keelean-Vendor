// api/vendorApi.js
import { baseApi } from "./baseApi";

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ CREATE PRICING
    createPricing: builder.mutation({
      query: (formData) => ({
        url: "/vendor/pricing/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Pricing"],
    }),

    // ✅ GET PRICING
    getPricing: builder.query({
      query: () => "/vendor/pricing/",
      providesTags: ["Pricing"],
    }),
  }),
});

export const { useCreatePricingMutation, useGetPricingQuery } = vendorApi;
