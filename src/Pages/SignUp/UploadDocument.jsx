import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  TrashIcon,
  InformationCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  UserIcon,
  CreditCardIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import {
  useUploadVendorProfileMutation,
  useGetVendorProfileQuery,
} from "../../api/authApi";
import { getVendorId } from "../../utils/localStorageMethods";
const ProfessionalDocumentUpload = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } =
    useGetVendorProfileQuery();
  const [uploadVendorProfile, { isLoading, isSuccess, isError, error }] =
    useUploadVendorProfileMutation();

  const fileInputRefs = useRef({});

  // Initialize documents state with proper structure
  const [documents, setDocuments] = useState({
    tradeLicense: { file: null, status: "pending", name: "", error: null },
    emiratesId: { file: null, status: "pending", name: "", error: null },
    ejari: { file: null, status: "pending", name: "", error: null },
    vatCertificate: { file: null, status: "pending", name: "", error: null },
    corporateTaxCertificate: {
      file: null,
      status: "pending",
      name: "",
      error: null,
    },
    logo: { file: null, status: "pending", name: "", error: null },
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    tradeName: "",
    licenseNumber: "",
    establishmentDate: "",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    branchCode: "",
    bankAddress: "",
  });

  const [errors, setErrors] = useState({
    companyName: "",
    tradeName: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    branchCode: "",
  });

  const [activeCategory, setActiveCategory] = useState("all");
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankDetailsStatus, setBankDetailsStatus] = useState("pending"); // pending, completed

  const documentConfig = {
    tradeLicense: {
      title: "Trade License",
      description: " (PDF, JPG, PNG up to 10MB)",
      category: "legal",
      required: true,
      icon: "📄",
      maxSize: 10 * 1024 * 1024,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    emiratesId: {
      title: "Emirates ID",
      description: " (PDF, JPG, PNG up to 5MB)",
      category: "identification",
      required: true,
      icon: "🆔",
      maxSize: 5 * 1024 * 1024,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    ejari: {
      title: "Ejari Certificate",
      description: " (PDF, JPG, PNG up to 10MB)",
      category: "legal",
      required: true,
      icon: "🏠",
      maxSize: 10 * 1024 * 1024,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    vatCertificate: {
      title: "VAT Certificate",
      description: "(PDF, JPG, PNG up to 10MB)",
      category: "tax",
      required: true,
      icon: "💰",
      maxSize: 10 * 1024 * 1024,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    corporateTaxCertificate: {
      title: "Corporate Tax Certificate",
      description: "(PDF, JPG, PNG up to 10MB)",
      category: "tax",
      required: true,
      icon: "🏢",
      maxSize: 10 * 1024 * 1024,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    logo: {
      title: "Company Logo",
      description: "(JPG, PNG, SVG up to 2MB)",
      category: "branding",
      required: true,
      icon: "🎨",
      maxSize: 2 * 1024 * 1024,
      accept: ".jpg,.jpeg,.png,.svg",
    },
  };

  const categories = [
    { id: "all", name: "Documents" },
    { id: "legal", name: "Legal" },
    { id: "tax", name: "Tax" },
    { id: "financial", name: "Financial" },
    { id: "identification", name: "ID" },
    { id: "branding", name: "Branding" },
  ].map((cat) => ({
    ...cat,
    count:
      cat.id === "all"
        ? Object.keys(documents).length + 1 // +1 for bank details
        : cat.id === "financial"
          ? 1
          : Object.keys(documentConfig).filter(
              (key) => documentConfig[key].category === cat.id,
            ).length,
  }));

  const filteredDocuments =
    activeCategory === "all"
      ? [
          ...Object.entries(documentConfig),
          [
            "bankDetails",
            {
              title: "Bank Details",
              description: "Enter your bank account information",
              category: "financial",
              required: true,
              icon: "🏦",
            },
          ],
        ]
      : activeCategory === "financial"
        ? [
            [
              "bankDetails",
              {
                title: "Bank Details",
                description: "Enter your bank account information",
                category: "financial",
                required: true,
                icon: "🏦",
              },
            ],
          ]
        : Object.entries(documentConfig).filter(
            ([, config]) => config.category === activeCategory,
          );

  const uploadedCount = Object.values(documents).filter(
    (doc) => doc.status === "uploaded",
  ).length;
  const totalCount = Object.keys(documents).length + 1; // +1 for bank details
  const progressPercent = Math.round(
    ((uploadedCount + (bankDetailsStatus === "completed" ? 1 : 0)) /
      totalCount) *
      100,
  );
  const requiredDocuments = Object.entries(documentConfig)
    .filter(([, config]) => config.required)
    .map(([key]) => key);

  const uploadedRequiredCount = requiredDocuments.filter(
    (key) => documents[key].status === "uploaded",
  ).length;

  // -----------------------
  // IBAN validator (MOD-97) - robust
  // -----------------------
  function isValidIBAN(input) {
    if (!input) return false;
    // Normalize, remove non-alphanum, uppercase
    const raw = String(input).normalize("NFKC");
    const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    // IBAN length must be between 15 and 34
    if (cleaned.length < 15 || cleaned.length > 34) return false;

    // Country (2 letters) + 2 digits checksum + rest
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;

    // Move first 4 chars to end and convert letters to numbers (A=10 ... Z=35)
    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

    // Use iterative mod-97 to avoid big integers
    let remainder = 0;
    for (let i = 0; i < rearranged.length; i++) {
      const ch = rearranged[i];
      if (ch >= "0" && ch <= "9") {
        remainder = (remainder * 10 + (ch.charCodeAt(0) - 48)) % 97;
      } else {
        const val = rearranged.charCodeAt(i) - 55; // A -> 10
        // append two digits of val
        remainder = (remainder * 100 + val) % 97;
      }
    }
    return remainder === 1;
  }

  // -----------------------
  // File validation
  // -----------------------
  const validateFile = (file, documentType) => {
    const config = documentConfig[documentType];
    const errors = [];

    if (file.size > config.maxSize) {
      const sizeInMB = config.maxSize / (1024 * 1024);
      errors.push(`File size must be less than ${sizeInMB}MB`);
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const acceptedExtensions = config.accept
      .replace(/\./g, "")
      .split(",")
      .map((ext) => ext.toLowerCase());

    if (!acceptedExtensions.includes(fileExtension)) {
      errors.push(`File type must be ${config.accept}`);
    }

    return errors;
  };

  const handleFileUpload = (documentType, file) => {
    if (!file) return;

    const validationErrors = validateFile(file, documentType);

    if (validationErrors.length > 0) {
      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: "error",
          error: validationErrors[0],
        },
      }));
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [documentType]: {
        file,
        status: "uploaded",
        name: file.name,
        error: null,
      },
    }));
  };

  const handleRemoveFile = (documentType) => {
    setDocuments((prev) => ({
      ...prev,
      [documentType]: {
        file: null,
        status: "pending",
        name: "",
        error: null,
      },
    }));
  };

  // -----------------------
  // Validation: Company & Bank
  // -----------------------
  const validateCompanyInfo = () => {
    const newErrors = {};

    if (!companyInfo.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!companyInfo.tradeName.trim()) {
      newErrors.tradeName = "Trade name is required";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateBankDetails = () => {
    const newErrors = {};

    // Bank name
    if (!bankDetails.bankName || !bankDetails.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    // Account holder name
    if (
      !bankDetails.accountHolderName ||
      !bankDetails.accountHolderName.trim()
    ) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    // Account number: digits only, length check (adjust min/max as needed)
    const acct = (bankDetails.accountNumber || "").replace(/\s/g, "");
    if (!acct) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(acct)) {
      newErrors.accountNumber = "Account number must contain only numbers";
    } else if (acct.length < 4 || acct.length > 34) {
      // common account number length varies by bank; adjust as needed
      newErrors.accountNumber = "Account number length looks invalid";
    }

    // IBAN: required + robust check (normalize spaces, uppercase, checksum)
    const ibanRaw = (bankDetails.iban || "").trim();
    if (!ibanRaw) {
      newErrors.iban = "IBAN is required";
    } else if (!isValidIBAN(ibanRaw)) {
      newErrors.iban = "Please enter a valid IBAN";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Clear specific field error as user types
  const handleBankDetailsChange = (field, value) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const canSubmit =
    uploadedRequiredCount === requiredDocuments.length &&
    companyInfo.companyName.trim() &&
    companyInfo.tradeName.trim() &&
    bankDetailsStatus === "completed";

  // When bankDetails change, re-evaluate completion status
  useEffect(() => {
    const isBankDetailsComplete =
      bankDetails.bankName.trim() &&
      bankDetails.accountHolderName.trim() &&
      bankDetails.accountNumber.trim() &&
      bankDetails.iban.trim();

    if (isBankDetailsComplete && validateBankDetails()) {
      setBankDetailsStatus("completed");
    } else {
      setBankDetailsStatus("pending");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankDetails]);

  // -----------------------
  // Submit handler
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCompanyInfo()) return;
    if (!validateBankDetails()) return;

    if (!canSubmit) {
      alert(
        "Please upload all required documents and fill in all required information",
      );
      return;
    }

    try {
      const formData = new FormData();

      // Company Info
      formData.append("company_name", companyInfo.companyName);
      formData.append("trade_name_document", companyInfo.tradeName);

      // Bank Details
      formData.append("bank_name", bankDetails.bankName);
      formData.append("account_holder_name", bankDetails.accountHolderName);
      formData.append("account_number", bankDetails.accountNumber);
      formData.append(
        "iban_number",
        bankDetails.iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
      );

      // Files
      if (documents.tradeLicense.file)
        formData.append("trade_license", documents.tradeLicense.file);

      if (documents.ejari.file) formData.append("ejari", documents.ejari.file);

      if (documents.logo.file) formData.append("logo", documents.logo.file);

      if (documents.emiratesId.file)
        formData.append("emirates_id", documents.emiratesId.file);

      if (documents.vatCertificate.file)
        formData.append("vat_certificate", documents.vatCertificate.file);

      if (documents.corporateTaxCertificate.file)
        formData.append(
          "corporate_tax_certificate",
          documents.corporateTaxCertificate.file,
        );

      await uploadVendorProfile(formData).unwrap();

      navigate("/Info");
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  //   setIsSubmitting(true);
  //   try {
  //     const submissionData = {
  //       companyInfo,
  //       bankDetails: {
  //         ...bankDetails,
  //         iban: (bankDetails.iban || "")
  //           .replace(/[^A-Za-z0-9]/g, "")
  //           .toUpperCase(), // normalized IBAN
  //       },
  //       documents: Object.entries(documents).reduce((acc, [key, doc]) => {
  //         if (doc.file) {
  //           acc[key] = {
  //             name: doc.name,
  //             status: doc.status,
  //             file: doc.file,
  //           };
  //         }
  //         return acc;
  //       }, {}),
  //     };
  //     console.log("Submission data:", submissionData);
  //     // simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1200));
  //     // navigate after successful submission
  //     navigate("/Info");
  //   } catch (error) {
  //     console.error("Submission failed:", error);
  //     alert("Submission failed. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "uploaded":
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Pending";
    }
  };
  useEffect(() => {
    if (!profileData?.profile) return;

    const profile = profileData.profile;

    // Company Info
    setCompanyInfo((prev) => ({
      ...prev,
      companyName: profile.company_name || "",
      tradeName: profile.trade_name_document || "",
    }));

    // Bank Details
    setBankDetails((prev) => ({
      ...prev,
      bankName: profile.bank_name || "",
      accountHolderName: profile.account_holder_name || "",
      accountNumber: profile.account_number || "",
      iban: profile.iban_number || "",
    }));

    // Documents mapping
    const backendFieldMap = {
      tradeLicense: "trade_license",
      emiratesId: "emirates_id",
      ejari: "ejari",
      vatCertificate: "vat_certificate",
      corporateTaxCertificate: "corporate_tax_certificate",
      logo: "logo",
    };

    setDocuments((prev) => {
      const updated = { ...prev };

      Object.keys(backendFieldMap).forEach((key) => {
        const backendKey = backendFieldMap[key];

        if (profile[backendKey]) {
          updated[key] = {
            file: null,
            status: "uploaded",
            name: profile[backendKey].split("/").pop(),
            error: null,
          };
        }
      });

      return updated;
    });
  }, [profileData]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-700">
              Business Document Upload
            </h1>
            <p className="text-sm text-gray-600 font-semibold mt-2">
              Upload all required documents and provide company information
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600">
                Overall Progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-900 min-w-10">
                {progressPercent}%
              </span>
            </div>
          </div>
        </header>
        <div className="bg-gray-20 border border-gray-200 rounded-xl shadow-sm">
          <section className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Company Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.companyName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1`}
                  placeholder="Enter company legal name"
                  value={companyInfo.companyName}
                  onChange={(e) => {
                    setCompanyInfo((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }));
                    if (errors.companyName) {
                      setErrors((prev) => ({ ...prev, companyName: "" }));
                    }
                  }}
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.tradeName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1`}
                  placeholder="Enter trading name"
                  value={companyInfo.tradeName}
                  onChange={(e) => {
                    setCompanyInfo((prev) => ({
                      ...prev,
                      tradeName: e.target.value,
                    }));
                    if (errors.tradeName) {
                      setErrors((prev) => ({ ...prev, tradeName: "" }));
                    }
                  }}
                />
                {errors.tradeName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.tradeName}
                  </p>
                )}
              </div>
            </div>
          </section>
          <section className="px-4 py-6 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-64 shrink-0 space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeCategory === category.id
                            ? "bg-blue-50 text-gray-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100 border border-transparent"
                        }`}
                      >
                        <span>{category.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            activeCategory === category.id
                              ? "bg-blue-100 text-gray-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-600 space-y-1.5">
                      <p className="font-medium text-gray-900 mb-1">
                        {" "}
                        Quick Tips:
                      </p>
                      <p className="flex items-start gap-1">
                        <span>•</span>
                        <span>Upload clear scans or photos</span>
                      </p>
                      <p className="flex items-start gap-1">
                        <span>•</span>
                        <span>Ensure documents are not expired</span>
                      </p>
                      <p className="flex items-start gap-1">
                        <span>•</span>
                        <span>File size limits apply</span>
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
              <main className="flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {activeCategory === "all"
                      ? "All Documents"
                      : categories.find((c) => c.id === activeCategory)?.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDocuments.map(([key, config]) => {
                    if (key === "bankDetails") {
                      return (
                        <div
                          key={key}
                          className="md:col-span-2 border border-gray-200 bg-gray-50 rounded-lg p-4 hover:border-gray-300 transition-colors shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <span className="text-xl mt-0.5">
                                {config.icon}
                              </span>
                              <div>
                                <div className="flex items-center gap-1">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {config.title}
                                  </h3>
                                  {config.required && (
                                    <span className="text-xs text-red-500">
                                      *
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {config.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  bankDetailsStatus === "completed"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {getStatusLabel(bankDetailsStatus)}
                              </span>
                              {getStatusIcon(bankDetailsStatus)}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Bank Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                                      errors.bankName
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    } text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1`}
                                    placeholder="Enter bank name"
                                    value={bankDetails.bankName}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        "bankName",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                {errors.bankName && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.bankName}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Account Holder Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                                      errors.accountHolderName
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    } text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1`}
                                    placeholder="Enter account holder name"
                                    value={bankDetails.accountHolderName}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        "accountHolderName",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                {errors.accountHolderName && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.accountHolderName}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Account Number{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                                      errors.accountNumber
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    } text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1`}
                                    placeholder="Enter account number"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        "accountNumber",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                {errors.accountNumber && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.accountNumber}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  IBAN <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HashtagIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                                      errors.iban
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    } text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1`}
                                    placeholder="Enter IBAN"
                                    value={bankDetails.iban}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        "iban",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                {errors.iban && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.iban}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                          </div>
                        </div>
                      );
                    }

                    const doc = documents[key];
                    const hasFile = doc.status === "uploaded";
                    return (
                      <div
                        key={key}
                        className="border border-gray-200 bg-gray-50 rounded-lg p-4 hover:border-gray-300 transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">
                              {config.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {config.title}
                                </h3>
                                {config.required && (
                                  <span className="text-xs text-red-500">
                                    *
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {config.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                doc.status === "uploaded"
                                  ? "bg-green-50 text-green-700"
                                  : doc.status === "error"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {getStatusLabel(doc.status)}
                            </span>
                            {getStatusIcon(doc.status)}
                          </div>
                        </div>
                        {doc.error && (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            {doc.error}
                          </div>
                        )}
                        {hasFile ? (
                          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <DocumentIcon className="w-4 h-4 text-gray-500 shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {doc.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(key)}
                              className="ml-2 text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Remove file"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed bg-gray-50 border-gray-300 rounded-lg p-2 text-center hover:border-gray-400 hover:bg-gray-100 transition-colors">
                              <CloudArrowUpIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900">
                                Click to upload
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {config.description.match(/\(([^)]+)\)/)?.[1] ||
                                  "PDF, JPG, PNG"}
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept={config.accept}
                              onChange={(e) =>
                                handleFileUpload(key, e.target.files[0])
                              }
                              ref={(el) => (fileInputRefs.current[key] = el)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        Submission Requirements:
                      </span>
                      {uploadedRequiredCount === requiredDocuments.length &&
                      bankDetailsStatus === "completed" ? (
                        <span className="text-green-600 font-medium">
                          ✓ All requirements met
                        </span>
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {requiredDocuments.length - uploadedRequiredCount}{" "}
                          document(s) and{" "}
                          {bankDetailsStatus === "pending"
                            ? "bank details"
                            : ""}{" "}
                          needed
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit || isLoading}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium
                                 bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                                 transition-colors min-w-[180px]"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Submit Documents"
                      )}
                    </button>
                  </div>
                </div>
              </main>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDocumentUpload;
