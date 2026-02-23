import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import countriesData from "world-countries";

// RTK Query API
import { useRequestOtpMutation, useVerifyOtpMutation } from "@/api/authApi";

// Helpers
import { useDispatch } from "react-redux";
import { setAuthState } from "@/features/auth/authSlice";
import { setAuthData } from "@/utils/localStorageMethods";

/* -----------------------------------
   COUNTRY LIST GENERATION
----------------------------------- */
const generateCountriesList = () => {
  return countriesData
    .map((country) => {
      const root = country?.idd?.root ?? "";
      const suffix = Array.isArray(country?.idd?.suffixes)
        ? country.idd.suffixes[0] ?? ""
        : "";
      const dialCode = root ? `${root}${suffix}` : "";

      return {
        code: country.cca2,
        name: country.name?.common,
        dialCode,
      };
    })
    .filter((c) => c.dialCode && c.dialCode !== "+")
    .sort((a, b) => a.name.localeCompare(b.name));
};

const popular = ["AE", "IN", "PK", "BD", "PH", "EG", "US", "GB"];

const getSortedCountries = () => {
  const all = generateCountriesList();
  const pop = all.filter((c) => popular.includes(c.code));
  const others = all.filter((c) => !popular.includes(c.code));
  return [...pop, ...others];
};

/* -----------------------------------
   VALIDATION SCHEMAS
----------------------------------- */
const phoneSchema = z.object({
  identifier: z
    .string()
    .min(7, "Enter valid phone number")
    .regex(/^\d+$/, "Only digits allowed"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "Only digits allowed"),
});

const createSchema = (otpSent) => (otpSent ? otpSchema : phoneSchema);

/* -----------------------------------
   COMPONENT
----------------------------------- */
const VendorAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // UI States
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Countries
  const countries = useMemo(() => getSortedCountries(), []);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // RTK Query hooks
  const [requestOtp, { isLoading: sendingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();

  /* -----------------------------------
     FORM SETUP
  ----------------------------------- */
  const resolver = useMemo(() => zodResolver(createSchema(otpSent)), [otpSent]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver,
    mode: "onChange",
    defaultValues: { identifier: "", otp: "" },
  });

  const phoneValue = watch("identifier");
  const otpValue = watch("otp");

  /* -----------------------------------
     TIMER
  ----------------------------------- */
  useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((sec) => sec - 1), 1000);
      return () => clearTimeout(t);
    }
    if (otpSent && timeLeft === 0) {
      setCanResend(true);
    }
  }, [otpSent, timeLeft]);

  /* -----------------------------------
     OUTSIDE CLICK FOR DROPDOWN
  ----------------------------------- */
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dialCode.includes(searchTerm)
    );
  }, [searchTerm, countries]);

  /* -----------------------------------
     SEND OTP
  ----------------------------------- */
  const handleSendOtp = async (data) => {
    try {
      let phone = data.identifier;
      if (phone.startsWith("0")) phone = phone.slice(1);

      const fullPhone = selectedCountry.dialCode.replace("+", "") + phone;

      const res = await requestOtp({ phone: fullPhone }).unwrap();
      localStorage.setItem("tempVendorId", res.vendor_id);

      setOtpSent(true);
      setTimeLeft(60);
      setCanResend(false);
    } catch (err) {
      alert("OTP sending failed");
    }
  };

  /* -----------------------------------
     VERIFY OTP
  ----------------------------------- */
  const handleVerifyOtp = async (data) => {
    try {
      let phone = phoneValue.startsWith("0") ? phoneValue.slice(1) : phoneValue;

      const fullPhone = selectedCountry.dialCode.replace("+", "") + phone;

      const res = await verifyOtp({
        phone: fullPhone,
        otp: data.otp,
      }).unwrap();

      // Save tokens
      setAuthData({
        access: res.access,
        refresh: res.refresh,
        vendor_id: res.vendor_id,
        role: res.role,
      });

      dispatch(setAuthState({ vendorId: res.vendor_id, role: res.role }));

      navigate("/upload-document");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  /* -----------------------------------
     FORM SUBMIT
  ----------------------------------- */
  const onSubmit = async (data) =>
    otpSent ? handleVerifyOtp(data) : handleSendOtp(data);

  /* -----------------------------------
     UI
  ----------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 rounded-3xl border border-slate-200 shadow-2xl px-8 py-10">
          {/* Logo & Heading */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-inner">
              <span className="text-lg font-bold text-slate-800">V</span>
            </div>
            <span className="text-3xl font-semibold text-slate-900">
              Vendor Login
            </span>
          </div>

          <h1 className="text-xl font-semibold text-slate-900 mb-4">
            {otpSent ? "OTP Verification" : "Sign in or create account"}
          </h1>

          {/* ---------------- PHONE FORM ---------------- */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!otpSent && (
              <>
                <label className="text-sm font-medium text-slate-800">
                  Mobile Number
                </label>

                <div className="flex gap-2 relative" ref={dropdownRef}>
                  {/* Country Code */}
                  <button
                    type="button"
                    className="w-28 h-full border border-slate-300 rounded-lg bg-white px-3 py-2 flex items-center justify-between shadow-sm"
                    onClick={() => setShowDropdown((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <ReactCountryFlag
                        countryCode={selectedCountry.code}
                        svg
                        style={{ width: "20px", height: "15px" }}
                      />
                      {selectedCountry.dialCode}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute top-14 left-0 w-64 bg-white border rounded-lg shadow-xl max-h-72 overflow-auto z-20">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border-b w-full text-sm"
                      />

                      {filtered.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setShowDropdown(false);
                            setSearchTerm("");
                          }}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-slate-50 border-b"
                        >
                          <ReactCountryFlag
                            countryCode={c.code}
                            svg
                            style={{ width: 18 }}
                          />
                          <span className="ml-2">{c.name}</span>
                          <span className="ml-auto">{c.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Phone field */}
                  <input
                    type="tel"
                    {...register("identifier")}
                    maxLength={12}
                    onChange={(e) =>
                      setValue("identifier", e.target.value.replace(/\D/g, ""))
                    }
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/60"
                    placeholder="Enter phone"
                  />
                </div>

                {errors.identifier && (
                  <p className="text-xs text-red-600">
                    {errors.identifier.message}
                  </p>
                )}

                {/* Silver Button */}
                <button
                  type="submit"
                  disabled={!phoneValue || sendingOtp}
                  className="w-full py-2.5 text-white font-medium rounded-lg
                  bg-gradient-to-br from-[#808A93] to-[#95A1AC] border border-[#AAB4BC] shadow-lg
                  disabled:opacity-50 transition"
                >
                  {sendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {/* ---------------- OTP FORM ---------------- */}
            {otpSent && (
              <>
                <label className="text-sm font-medium text-slate-800">
                  Enter OTP
                </label>

                <input
                  type="text"
                  {...register("otp")}
                  maxLength={6}
                  className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-[0.4em] bg-slate-50/60"
                  placeholder="••••••"
                />
                {errors.otp && (
                  <p className="text-xs text-red-600">{errors.otp.message}</p>
                )}

                {/* Timer */}
                <div className="text-center text-sm text-slate-600">
                  {timeLeft > 0
                    ? `Time remaining: ${Math.floor(timeLeft / 60)}:${String(
                        timeLeft % 60
                      ).padStart(2, "0")}`
                    : "OTP expired"}
                </div>

                {/* Silver Button */}
                <button
                  type="submit"
                  disabled={otpValue?.length !== 6 || verifyingOtp}
                  className="w-full py-2.5 text-white font-medium rounded-lg
                  bg-gradient-to-br from-[#808A93] to-[#95A1AC] border border-[#AAB4BC] shadow-lg
                  disabled:opacity-50 transition"
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="w-full text-sky-600 text-sm mt-2"
                  disabled={!canResend}
                  onClick={() => {
                    reset();
                    setOtpSent(false);
                    setCanResend(false);
                    setTimeLeft(0);
                  }}
                >
                  Change Number
                </button>
              </>
            )}
          </form>

          {/* Footer */}
          <p className="text-slate-600 text-xs font-medium mt-4 text-center">
            By continuing, you agree to Vendor's{" "}
            <span className="text-sky-600 font-semibold">Terms</span> &
            <span className="text-sky-600 font-semibold ml-1">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorAuth;
