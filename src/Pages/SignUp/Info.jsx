// ProfessionalBusinessSetup.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import debounce from "lodash/debounce";
import { useGetVendorProfileQuery } from "../../api/authApi";
import {
  PlusIcon,
  TrashIcon,
  MapPinIcon,
  TruckIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/* ----------------- colors & schemas ----------------- */
const colors = {
  background: "#FFFFFF",
  card: "#F8F9FA",
  borderLight: "#F3F4F6",
  border: "#9CA3AF",
  textPrimary: "#111827",
  textSecondary: "#374151",
  success: "#10B981",
  error: "#EF4444",
  accent: "#6B7280",
};

/* ---------- Zod schemas ---------- */
const profileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  landline: z.string().min(1, "Landline number is required"),
  whatsapp: z
    .string()
    .min(7, "WhatsApp number must be at least 7 digits")
    .regex(/^[+\d\s-]+$/, "Invalid WhatsApp number format"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .url("Please enter a valid Facebook URL")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .url("Please enter a valid Instagram URL")
    .optional()
    .or(z.literal("")),
});

const operatingHourSchema = z.object({
  day: z.string(),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  closed: z.boolean(),
});

const locationSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
  deliveryRadius: z.coerce
    .number()
    .min(1, "Delivery radius must be at least 1 km")
    .max(50, "Delivery radius max 50 km"),
  landmark: z.string().optional().or(z.literal("")),
  operatingHours: z.array(operatingHourSchema).length(7),
});

const deliveryPersonSchema = z.object({
  id: z.number(),
  name: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  vehicleType: z.enum(["bike", "car", "scooter", "van"]),
  licenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters"),
});

const completeFormSchema = z.object({
  profile: profileSchema,
  location: locationSchema,
});

/* ----------------- default form values ----------------- */
const defaultValues = {
  profile: {
    companyName: "",
    landline: "",
    whatsapp: "",
    website: "",
    facebook: "",
    instagram: "",
  },
  location: {
    address: "",
    latitude: "",
    longitude: "",
    deliveryRadius: 15,
    landmark: "",
    operatingHours: Array(7)
      .fill()
      .map((_, index) => ({
        day: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ][index],
        open: "09:00",
        close: "18:00",
        closed: index === 6,
      })),
  },
  deliveryPersons: [
    {
      id: Date.now(),
      name: "",
      phone: "",
      vehicleType: "bike",
      licenseNumber: "",
    },
  ],
};

/* ----------------- UI Components ----------------- */
const SectionLayout = ({
  title,
  description,
  icon: Icon,
  children,
  onNext,
  onBack,
  isFirst = false,
  isLast = false,
}) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-6 h-6" style={{ color: colors.textPrimary }} />
      <div>
        <h2
          className="text-xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {description}
          </p>
        )}
      </div>
    </div>

    <div className="space-y-6">{children}</div>

    <div className="flex justify-between pt-6">
      {!isFirst && (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors hover:bg-gray-50 bg-white border-gray-400"
          style={{ color: colors.textPrimary }}
        >
          <ChevronLeftIcon className="w-4 h-4" /> Back
        </button>
      )}
      <div className="flex-1" />
      <button
        type="button"
        onClick={onNext}
        className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 border border-gray-400"
        style={{ backgroundColor: colors.accent, color: "#FFFFFF" }}
      >
        {isLast ? "Complete Setup" : "Next"}
      </button>
    </div>
  </div>
);

const InputField = ({
  label,
  name,
  register,
  errors,
  placeholder,
  type = "text",
  required = false,
  readOnly = false,
}) => {
  const error = name.split(".").reduce((obj, key) => obj?.[key], errors);
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: colors.textPrimary }}
      >
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        {...register(name, { valueAsNumber: type === "number" })}
        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:ring-2 focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
        } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
        style={{ backgroundColor: readOnly ? "#F3F4F6" : colors.card }}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  );
};

/* ----------------- Address Search Component (OpenStreetMap) ----------------- */
const AddressSearch = ({
  onAddressSelect,
  setValue,
  errors,
  isGettingAddress,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const searchAddress = useCallback(
    debounce(async (searchText) => {
      if (searchText.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        // OpenStreetMap Nominatim API (Free, no key required)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchText,
          )}&addressdetails=1&limit=5&countrycodes=ae`, // Restrict to UAE
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "BusinessSetupApp/1.0",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        const formattedSuggestions = data.map((item) => ({
          id: item.place_id,
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          address: item.address || {},
        }));

        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [],
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    searchAddress(value);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.displayName);
    setValue("location.address", suggestion.displayName, {
      shouldValidate: true,
    });
    setValue("location.latitude", suggestion.lat, { shouldValidate: true });
    setValue("location.longitude", suggestion.lon, { shouldValidate: true });
    setShowSuggestions(false);
    setSuggestions([]);

    if (onAddressSelect) {
      onAddressSelect(suggestion);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setValue("location.address", "", { shouldValidate: true });
    setValue("location.latitude", "", { shouldValidate: true });
    setValue("location.longitude", "", { shouldValidate: true });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700  mb-2">
        Full Address <span className="text-gry-500">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className={`w-full px-4 py-3 rounded-lg border pr-10 ${
            errors.location?.address
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          } placeholder-gray-400 focus:outline-none transition-colors`}
          placeholder="Building name, street, area, city"
          disabled={isGettingAddress}
        />

        {(query || isSearching) && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className="text-sm text-gray-900 font-medium">
                {suggestion.displayName}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                📍 Lat: {suggestion.lat.toFixed(6)}, Lng:{" "}
                {suggestion.lon.toFixed(6)}
              </div>
            </button>
          ))}
        </div>
      )}

      {errors.location?.address && (
        <p className="mt-2 text-sm text-red-600">
          {errors.location.address.message}
        </p>
      )}
    </div>
  );
};

/* ----------------- Main Component ----------------- */
export default function ProfessionalBusinessSetup() {
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } =
    useGetVendorProfileQuery();
  const [activeSection, setActiveSection] = useState("profile");
  const [completedSections, setCompletedSections] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [locationError, setLocationError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm({
    defaultValues,
    resolver: zodResolver(completeFormSchema),
    mode: "onChange",
  });

  const sections = [
    { id: "profile", title: "Profile Details", icon: UserCircleIcon },
    { id: "location", title: "Location & Hours", icon: MapPinIcon },
  ];

  const progress = Math.round((completedSections.size / sections.length) * 100);
  const isLastSection =
    sections.findIndex((s) => s.id === activeSection) === sections.length - 1;

  // Watch values
  const watchedLatitude = watch("location.latitude");
  const watchedLongitude = watch("location.longitude");
  const watchedAddress = watch("location.address");

  const markSectionComplete = (sectionId) => {
    setCompletedSections((prev) => new Set([...prev, sectionId]));
  };

  const validateCurrentSection = async () => {
    let sectionFields = [];
    switch (activeSection) {
      case "profile":
        sectionFields = [
          "profile.companyName",
          "profile.landline",
          "profile.whatsapp",
        ];
        break;
      case "location":
        sectionFields = [
          "location.address",
          "location.deliveryRadius",
          "location.latitude",
          "location.longitude",
        ];
        break;
      default:
        sectionFields = [];
    }
    const result = await trigger(sectionFields);
    if (result) markSectionComplete(activeSection);
    return result;
  };

  const goToNextSection = async () => {
    const ok = await validateCurrentSection();
    if (!ok) return;
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
    if (currentIndex < sections.length - 1)
      setActiveSection(sections[currentIndex + 1].id);
  };

  const goToPreviousSection = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
    if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "BusinessSetupApp/1.0",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch address");
      const data = await response.json();
      return data.display_name || "Address found";
    } catch (error) {
      console.error("Error getting address:", error);
      throw error;
    }
  };

  const useMyLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingAddress(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          setValue("location.latitude", Number(latitude).toFixed(6), {
            shouldValidate: true,
          });
          setValue("location.longitude", Number(longitude).toFixed(6), {
            shouldValidate: true,
          });

          try {
            const address = await getAddressFromCoordinates(
              latitude,
              longitude,
            );
            setValue("location.address", address, { shouldValidate: true });
          } catch (addressError) {
            setLocationError(
              "Got coordinates but couldn't fetch address. Please search manually.",
            );
          }
        } catch (error) {
          setLocationError("Error processing location. Please try again.");
        } finally {
          setIsGettingAddress(false);
        }
      },
      (err) => {
        setIsGettingAddress(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            "Location access denied. Please search for your address manually.",
          );
        } else {
          setLocationError(
            "Could not get your location. Please search manually.",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const addDeliveryPerson = () => {
    const persons = getValues("deliveryPersons") || [];
    const newPerson = {
      id: Date.now(),
      name: "",
      phone: "",
      vehicleType: "bike",
      licenseNumber: "",
    };
    setValue("deliveryPersons", [...persons, newPerson], {
      shouldValidate: true,
    });
  };

  const removeDeliveryPerson = (indexToRemove) => {
    const persons = getValues("deliveryPersons") || [];
    if (persons.length <= 1) return;
    const updated = persons.filter((_, idx) => idx !== indexToRemove);
    setValue("deliveryPersons", updated, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("accessToken");

      const formData = new FormData();

      // PROFILE
      formData.append("company_name", data.profile.companyName);
      formData.append("landline", data.profile.landline);
      formData.append("whatsapp_number", data.profile.whatsapp);
      formData.append("website", data.profile.website || "");
      formData.append("facebook", data.profile.facebook || "");
      formData.append("instagram", data.profile.instagram || "");

      // LOCATION
      formData.append("address", data.location.address);
      formData.append("latitude", data.location.latitude);
      formData.append("longitude", data.location.longitude);
      formData.append("delivery_radius_km", data.location.deliveryRadius);

      // EXTRA JSON DATA
      formData.append(
        "extra_fields",
        JSON.stringify({
          operatingHours: data.location.operatingHours,
          landmark: data.location.landmark,
          deliveryPersons: data.deliveryPersons,
        }),
      );

      const response = await fetch(
        "http://localhost:8000/api/vendor/upload-profile/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 NO Content-Type
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        alert("Something went wrong. Check console.");
        return;
      }

      const result = await response.json();
      console.log("Saved:", result);

      navigate("/dashboard");
    } catch (err) {
      console.error("Submission Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (!profileData?.profile) return;

    const profile = profileData.profile;

    // PROFILE
    setValue("profile.companyName", profile.company_name || "");
    setValue("profile.landline", profile.landline || "");
    setValue("profile.whatsapp", profile.whatsapp_number || "");
    setValue("profile.website", profile.website || "");
    setValue("profile.facebook", profile.facebook || "");
    setValue("profile.instagram", profile.instagram || "");

    // LOCATION
    setValue("location.address", profile.address || "");
    setValue("location.latitude", profile.latitude || "");
    setValue("location.longitude", profile.longitude || "");
    setValue("location.deliveryRadius", profile.delivery_radius_km || 15);
  }, [profileData, setValue]);
  // const handleFinalNext = () => {
  //   console.log("FINAL NEXT CLICK");
  //   localStorage.setItem("isLoggedIn", "true");

  //   navigate("/dashboard");
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.card,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Business Setup
            </h1>

            <div
              className="p-3 rounded-xl border border-gray-400"
              style={{ backgroundColor: colors.card }}
            >
              <div
                className="text-sm mb-1"
                style={{ color: colors.textSecondary }}
              >
                Setup Progress
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-32 rounded-full h-2"
                  style={{ backgroundColor: colors.border }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: colors.success,
                    }}
                  />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div
              className="rounded-lg border border-gray-400 p-4 sticky top-8"
              style={{ backgroundColor: colors.card }}
            >
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "border border-gray-400"
                        : "hover:opacity-80"
                    }`}
                    style={
                      activeSection === section.id
                        ? {
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          }
                        : { color: colors.textSecondary }
                    }
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{section.title}</span>
                    {completedSections.has(section.id) && (
                      <CheckCircleIcon
                        className="w-4 h-4"
                        style={{ color: colors.success }}
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div
                className="mt-6 p-3 rounded-lg border border-gray-400"
                style={{ backgroundColor: colors.background }}
              >
                <div className="text-xs" style={{ color: colors.textPrimary }}>
                  <div className="font-medium mb-2">📍 Quick Tips</div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Type address for auto-suggestions</li>
                    <li>• Coordinates fill automatically</li>
                    <li>• Set realistic delivery radius</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <SectionLayout
                title="Profile Details"
                icon={UserCircleIcon}
                onNext={goToNextSection}
                onBack={goToPreviousSection}
                isFirst
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                  <div className="pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Company Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Company Name"
                      name="profile.companyName"
                      register={register}
                      errors={errors}
                      placeholder="Enter company name"
                      required
                    />

                    <InputField
                      label="Landline"
                      name="profile.landline"
                      register={register}
                      errors={errors}
                      placeholder="+971 X XXX XXXX"
                      required
                    />

                    <InputField
                      label="WhatsApp Number"
                      name="profile.whatsapp"
                      register={register}
                      errors={errors}
                      placeholder="+971 XX XXX XXXX"
                      required
                    />

                    <InputField
                      label="Website"
                      name="profile.website"
                      register={register}
                      errors={errors}
                      placeholder="https://example.com"
                    />

                    <InputField
                      label="Facebook"
                      name="profile.facebook"
                      register={register}
                      errors={errors}
                      placeholder="https://facebook.com/yourpage"
                    />

                    <InputField
                      label="Instagram"
                      name="profile.instagram"
                      register={register}
                      errors={errors}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </SectionLayout>
            )}

            {/* Location Section */}
            {activeSection === "location" && (
              <SectionLayout
                title="Location & Service Area"
                icon={MapPinIcon}
                onNext={
                  isLastSection ? handleSubmit(onSubmit) : goToNextSection
                }
                onBack={goToPreviousSection}
                isLast={isLastSection}
              >
                <div className="space-y-6">
                  {/* Location Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                          <MapPinIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Business Location
                          </h3>
                          <p className="text-sm text-gray-500">
                            Search for your address or use current location
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Address Search */}
                      <AddressSearch
                        onAddressSelect={(suggestion) =>
                          console.log("Selected:", suggestion)
                        }
                        setValue={setValue}
                        errors={errors}
                        isGettingAddress={isGettingAddress}
                      />

                      {/* Coordinates Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Latitude"
                          name="location.latitude"
                          register={register}
                          errors={errors}
                          placeholder="Auto-filled from address"
                          required
                          readOnly
                        />

                        <InputField
                          label="Longitude"
                          name="location.longitude"
                          register={register}
                          errors={errors}
                          placeholder="Auto-filled from address"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Radius Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Delivery Service Zone
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Radius (km){" "}
                          <span className="text-red-500">*</span>
                        </label>

                        {/* Slider */}
                        <input
                          type="range"
                          min="1"
                          max="50"
                          step="1"
                          {...register("location.deliveryRadius")}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />

                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 km</span>
                          <span>25 km</span>
                          <span>50 km</span>
                        </div>

                        {/* Number Input */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Selected radius:
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {watch("location.deliveryRadius")} km
                            </span>
                          </div>

                          <input
                            type="number"
                            min="1"
                            max="50"
                            {...register("location.deliveryRadius", {
                              required: "Delivery radius is required",
                              min: {
                                value: 1,
                                message: "Minimum radius is 1 km",
                              },
                              max: {
                                value: 50,
                                message: "Maximum radius is 50 km",
                              },
                              valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 focus:outline-none"
                          />
                        </div>

                        {errors.location?.deliveryRadius && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.location.deliveryRadius.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionLayout>
            )}
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <p className="text-gray-900">Setting up your business...</p>
          </div>
        </div>
      )}
    </div>
  );
}
