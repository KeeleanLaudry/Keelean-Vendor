// src/redux/slices/vendorProfileSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companyInfo: {
    company_name: "",
    trade_name: "",
  },

  bankDetails: {
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    iban_number: "",
  },

  documents: {
    trade_license: null,
    ejari: null,
    logo: null,
    trade_name_document: null,
    emirates_id: null,
    vat_certificate: null,
    corporate_tax_certificate: null,
  },
};

const vendorProfileSlice = createSlice({
  name: "vendorProfile",
  initialState,
  reducers: {
    saveCompanyInfo: (state, action) => {
      state.companyInfo = action.payload;
    },
    saveBankDetails: (state, action) => {
      state.bankDetails = action.payload;
    },
    saveDocuments: (state, action) => {
      state.documents = action.payload;
    },
    resetVendorProfile: () => initialState,
  },
});

export const {
  saveCompanyInfo,
  saveBankDetails,
  saveDocuments,
  resetVendorProfile,
} = vendorProfileSlice.actions;

export default vendorProfileSlice.reducer;
