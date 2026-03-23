import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { X, ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react";

const MAX_IMAGES = 5;

const EditModal = ({ item, title, fields, onClose, onSave }) => {
  const [form, setForm] = useState(item);

  const imageField = fields.find((f) => f.type === "image");
  const otherFields = fields.filter((f) => f.type !== "image");

  const images = Array.isArray(form[imageField?.key])
    ? form[imageField.key]
    : [];

  const [activeIndex, setActiveIndex] = useState(0);

  // ---------- CROP STATE ----------
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const fileRef = useRef();

  const update = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ---------- FILE SELECT ----------
  const onSelectFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
    });

    const url = URL.createObjectURL(compressed);
    setCropSrc(url);
  };

  // ---------- CROP COMPLETE ----------
  const onCropComplete = useCallback((_, area) => {
    setCroppedArea(area);
  }, []);

  // ---------- APPLY CROP ----------
  const applyCrop = async () => {
    const croppedBlob = await getCroppedImg(cropSrc, croppedArea);
    const url = URL.createObjectURL(croppedBlob);

    let updated;

    if (images.length < MAX_IMAGES) {
      updated = [...images, url];
    } else {
      updated = [...images];
      updated[activeIndex] = url;
    }

    update(imageField.key, updated);
    setCropSrc(null);
  };

  // ---------- REMOVE ----------
  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    update(imageField.key, updated);
    setActiveIndex(0);
  };

  // ---------- DRAG REORDER ----------
  const onDragStart = (i) => (e) => {
    e.dataTransfer.setData("index", i);
  };

  const onDrop = (i) => (e) => {
    const from = e.dataTransfer.getData("index");
    const arr = [...images];
    const item = arr.splice(from, 1)[0];
    arr.splice(i, 0, item);
    update(imageField.key, arr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* IMAGE GALLERY */}
        {imageField && (
          <div className="mb-8 flex flex-col items-center">

            {images.length > 0 && (
              <div className="relative w-72 h-72 border rounded-xl overflow-hidden">
                <img
                  src={images[activeIndex]}
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={() => removeImage(activeIndex)}
                  className="absolute bottom-2 right-2 bg-white p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* THUMBNAILS + DRAG */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  draggable
                  onDragStart={onDragStart(i)}
                  onDrop={onDrop(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setActiveIndex(i)}
                  className={`w-14 h-14 rounded-lg object-cover cursor-pointer border ${
                    i === activeIndex
                      ? "border-black"
                      : "opacity-70"
                  }`}
                />
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileRef.current.click()}
                  className="w-14 h-14 border-dashed border flex items-center justify-center rounded"
                >
                  <Upload size={16} />
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={onSelectFile}
              className="hidden"
            />
          </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {otherFields.map((f) => (
            <Field key={f.key} label={f.label}>
              {renderInput(f, form, update)}
            </Field>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="bg-black text-white px-5 py-2 rounded"
          >
            Save
          </button>
        </div>

        {/* CROP MODAL */}
        {cropSrc && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-xl w-[400px]">
              <div className="relative w-full h-64">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setCropSrc(null)}>
                  Cancel
                </button>
                <button
                  onClick={applyCrop}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* FIELD */
const Field = ({ label, children }) => (
  <div>
    <label className="text-sm text-gray-500 mb-1 block">
      {label}
    </label>
    {children}
  </div>
);

/* INPUT */
const renderInput = (field, form, update) => {
  const value = form[field.key] ?? "";

  switch (field.type) {
    case "select":
      return (
        <select
          value={value}
          onChange={(e) => update(field.key, e.target.value)}
          className="input"
        >
          {field.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );

    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => update(field.key, e.target.value)}
          className="input"
        />
      );

    default:
      return (
        <input
          value={value}
          onChange={(e) => update(field.key, e.target.value)}
          className="input"
        />
      );
  }
};

export default EditModal;

/* ---------- CROP UTILITY ---------- */
async function getCroppedImg(imageSrc, crop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg");
  });
}

function createImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
  });
} 