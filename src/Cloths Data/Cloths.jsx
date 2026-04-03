import { useState, useMemo } from "react";
import {
  useGetServicesQuery,
  useGetItemsQuery,
  useGetAttributeTypesQuery,
  useGetAttributeOptionsQuery,
  useGetAddOnsQuery,
  useGetFoldingOptionsQuery,
  useGetCustomisationOptionsQuery,
} from "../api/catalogApi";
import {
  useGetPricingQuery,
  useCreatePricingMutation,
  useGetItemAddOnsQuery,
  useGetItemFoldingsQuery,
  useGetItemCustomisationsQuery,
  useCreateItemAddOnMutation,
  useCreateItemFoldingMutation,
  useCreateItemCustomisationMutation,
} from "../api/vendorApi";

const STEPS = ["Service", "Item", "Attributes & Price", "Add-ons", "Review"];
const CURRENCIES = ["AED", "USD", "EUR"];

export default function VendorPricingBuilder() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("AED");

  // Step 4 — add-on selections (store ids in sets)
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [selectedFolding, setSelectedFolding] = useState(null); // single
  const [selectedCustomisations, setSelectedCustomisations] = useState([]);

  // ── catalog queries ───────────────────────────────────────────────────
  const { data: services = [] } = useGetServicesQuery();
  const { data: items = [] } = useGetItemsQuery();
  const { data: attributeTypes = [] } = useGetAttributeTypesQuery();
  const { data: attributeOptions = [] } = useGetAttributeOptionsQuery();
  const { data: addOns = [] } = useGetAddOnsQuery();
  const { data: foldingOptions = [] } = useGetFoldingOptionsQuery();
  const { data: customisationOptions = [] } = useGetCustomisationOptionsQuery();

  // ── vendor queries ────────────────────────────────────────────────────
  const { data: pricings = [], refetch } = useGetPricingQuery();
  const { data: vendorItemAddOns = [] } = useGetItemAddOnsQuery(
    selectedItem || undefined,
  );
  const { data: vendorItemFoldings = [] } = useGetItemFoldingsQuery(
    selectedItem || undefined,
  );
  const { data: vendorItemCustomisations = [] } = useGetItemCustomisationsQuery(
    selectedItem || undefined,
  );

  // ── mutations ─────────────────────────────────────────────────────────
  const [createPricing, { isLoading }] = useCreatePricingMutation();
  const [createItemAddOn] = useCreateItemAddOnMutation();
  const [createItemFolding] = useCreateItemFoldingMutation();
  const [createItemCustomisation] = useCreateItemCustomisationMutation();

  // ── derived ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(
    () => items.filter((i) => i.services?.includes(Number(selectedService))),
    [items, selectedService],
  );

  const relevantAttrTypes = useMemo(
    () =>
      attributeTypes.filter((at) =>
        at.applicable_items?.includes(Number(selectedItem)),
      ),
    [attributeTypes, selectedItem],
  );

  const optionsForType = (typeId) =>
    attributeOptions.filter((o) => o.attribute_type === typeId);

  // Already linked ids — so vendor doesn't re-add duplicates
  const linkedAddOnIds = vendorItemAddOns.map((x) => x.addon);
  const linkedFoldingIds = vendorItemFoldings.map((x) => x.folding_option);
  const linkedCustomisationIds = vendorItemCustomisations.map(
    (x) => x.customisation_option,
  );

  // ── helpers ───────────────────────────────────────────────────────────
  const toggleOption = (typeId, optId) => {
    setSelectedOptions((prev) => {
      if (prev[typeId] === optId) {
        const next = { ...prev };
        delete next[typeId];
        return next;
      }
      return { ...prev, [typeId]: optId };
    });
  };

  const toggleAddOn = (id) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleCustomisation = (id) =>
    setSelectedCustomisations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const resetForm = () => {
    setStep(1);
    setSelectedService("");
    setSelectedItem("");
    setSelectedOptions({});
    setPrice("");
    setCurrency("AED");
    setSelectedAddOns([]);
    setSelectedFolding(null);
    setSelectedCustomisations([]);
  };

  // ── submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("service", selectedService);
      formData.append("item", selectedItem);
      formData.append("price", price);

      // attributes
      Object.values(selectedOptions).forEach((optId) =>
        formData.append("attribute_options", optId),
      );

      // add-ons
      selectedAddOns.forEach((id) => formData.append("addons", id));

      // folding (single)
      if (selectedFolding) {
        formData.append("folding_option", selectedFolding);
      }

      // customisations
      selectedCustomisations.forEach((id) =>
        formData.append("customisation_options", id),
      );

      await createPricing(formData).unwrap();
      refetch();
      resetForm();
    } catch (err) {
      console.error("Pricing error:", err);
      alert(err?.data?.non_field_errors?.[0] || "Failed to add pricing");
    }
  };

  // ── review helpers ────────────────────────────────────────────────────
  const reviewService = services.find((s) => s.id == selectedService);
  const reviewItem = items.find((i) => i.id == selectedItem);
  const reviewAttrs = Object.entries(selectedOptions).map(([typeId, optId]) => {
    const at = attributeTypes.find((a) => a.id === Number(typeId));
    const opt = attributeOptions.find((o) => o.id === optId);
    return { type: at?.name, option: opt?.name };
  });
  const reviewAddOns = addOns.filter((a) => selectedAddOns.includes(a.id));
  const reviewFolding = foldingOptions.find((f) => f.id === selectedFolding);
  const reviewCustomisations = customisationOptions.filter((c) =>
    selectedCustomisations.includes(c.id),
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Add Service Pricing
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Build a pricing combination for a service, item, and attribute options
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 flex-wrap gap-y-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} className="flex items-center">
              {i > 0 && <div className="h-px w-8 bg-gray-200 flex-shrink-0" />}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all
                    ${
                      done
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : active
                          ? "bg-gray-800 text-white"
                          : "border border-gray-200 text-gray-400"
                    }`}
                >
                  {done ? "✓" : n}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${active ? "text-gray-800 font-medium" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Step 1 — Service ── */}
      {step === 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Choose a service
          </p>
          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedService(String(s.id));
                  setSelectedItem("");
                  setSelectedOptions({});
                }}
                className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all
                  ${selectedService == s.id ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2 — Item ── */}
      {step === 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Choose an item
          </p>
          {filteredItems.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">
              No items available for this service.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(String(item.id));
                    setSelectedOptions({});
                  }}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all
                    ${selectedItem == item.id ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              disabled={!selectedItem}
              onClick={() => setStep(3)}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Attributes + Price ── */}
      {step === 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {relevantAttrTypes.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">
              No attributes for this item — just set a price.
            </p>
          ) : (
            relevantAttrTypes.map((at) => (
              <div key={at.id} className="mb-5">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  {at.name}{" "}
                  <span className="font-normal text-gray-400">(pick one)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {optionsForType(at.id).map((opt) => {
                    const isSel = selectedOptions[at.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleOption(at.id, opt.id)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all
                          ${isSel ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
                      >
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Set price
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              disabled={!price}
              onClick={() => setStep(4)}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4 — Add-ons, Folding, Customisation ── */}
      {step === 4 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* Add-ons */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Add-ons{" "}
              <span className="normal-case font-normal text-gray-400">
                (optional — pick multiple)
              </span>
            </p>
            {addOns.length === 0 ? (
              <p className="text-sm text-gray-400">No add-ons available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {addOns.map((a) => {
                  const isSel = selectedAddOns.includes(a.id);
                  const isLinked = linkedAddOnIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => !isLinked && toggleAddOn(a.id)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all
                        ${
                          isLinked
                            ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                            : isSel
                              ? "bg-gray-800 text-white border-gray-800"
                              : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                    >
                      {a.name}
                      {isLinked && (
                        <span className="ml-1 text-xs">(already added)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Folding */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Folding{" "}
              <span className="normal-case font-normal text-gray-400">
                (optional — pick one)
              </span>
            </p>
            {foldingOptions.length === 0 ? (
              <p className="text-sm text-gray-400">
                No folding options available.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {foldingOptions.map((f) => {
                  const isSel = selectedFolding === f.id;
                  const isLinked = linkedFoldingIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() =>
                        !isLinked && setSelectedFolding(isSel ? null : f.id)
                      }
                      className={`px-4 py-2 rounded-lg border text-sm transition-all
                        ${
                          isLinked
                            ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                            : isSel
                              ? "bg-gray-800 text-white border-gray-800"
                              : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                    >
                      {f.name}
                      {isLinked && (
                        <span className="ml-1 text-xs">(already added)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customisation */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Customisation{" "}
              <span className="normal-case font-normal text-gray-400">
                (optional — pick multiple)
              </span>
            </p>
            {customisationOptions.length === 0 ? (
              <p className="text-sm text-gray-400">
                No customisation options available.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {customisationOptions.map((c) => {
                  const isSel = selectedCustomisations.includes(c.id);
                  const isLinked = linkedCustomisationIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => !isLinked && toggleCustomisation(c.id)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all
                        ${
                          isLinked
                            ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                            : isSel
                              ? "bg-gray-800 text-white border-gray-800"
                              : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                    >
                      {c.name}
                      {isLinked && (
                        <span className="ml-1 text-xs">(already added)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5 — Review ── */}
      {step === 5 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
            Review combination
          </p>
          <div className="space-y-0 divide-y divide-gray-100">
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-800">
                {reviewService?.name}
              </span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Item</span>
              <span className="font-medium text-gray-800">
                {reviewItem?.name}
              </span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Attributes</span>
              <div className="text-right">
                {reviewAttrs.length === 0 ? (
                  <span className="text-gray-400">None</span>
                ) : (
                  reviewAttrs.map((a, i) => (
                    <div key={i} className="font-medium text-gray-800">
                      {a.type}: {a.option}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Price</span>
              <span className="font-semibold text-gray-900">
                {currency} {parseFloat(price).toFixed(2)}
              </span>
            </div>

            {/* Add-ons review */}
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Add-ons</span>
              <div className="text-right">
                {reviewAddOns.length === 0 ? (
                  <span className="text-gray-400">None</span>
                ) : (
                  reviewAddOns.map((a) => (
                    <div key={a.id} className="font-medium text-gray-800">
                      {a.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Folding review */}
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Folding</span>
              <span className="font-medium text-gray-800">
                {reviewFolding?.name || (
                  <span className="text-gray-400">None</span>
                )}
              </span>
            </div>

            {/* Customisation review */}
            <div className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">Customisation</span>
              <div className="text-right">
                {reviewCustomisations.length === 0 ? (
                  <span className="text-gray-400">None</span>
                ) : (
                  reviewCustomisations.map((c) => (
                    <div key={c.id} className="font-medium text-gray-800">
                      {c.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              disabled={isLoading}
              onClick={handleSubmit}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              {isLoading ? "Submitting…" : "Confirm & Add ✓"}
            </button>
          </div>
        </div>
      )}

      {/* ── Existing pricings list ── */}
      {pricings.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Your pricing combinations
          </p>
          <div className="space-y-2">
            {pricings.map((p) => {
              const svc = services.find((s) => s.id === p.service);
              const itm = items.find((i) => i.id === p.item);
              const opts =
                p.attribute_options?.map((oid) => {
                  const opt = attributeOptions.find((o) => o.id === oid);
                  const at = attributeTypes.find(
                    (a) => a.id === opt?.attribute_type,
                  );
                  return `${at?.name}: ${opt?.name}`;
                }) || [];

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {svc?.name}
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-700">{itm?.name}</span>
                    {opts.length > 0 && (
                      <span className="text-gray-400 ml-2">
                        · {opts.join(", ")}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    AED {parseFloat(p.price).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
