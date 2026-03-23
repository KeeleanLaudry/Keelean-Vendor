import React, { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ViewModal = ({ item, title, fields, onClose }) => {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageField = fields.find((f) => f.type === "image");
  const otherFields = fields.filter((f) => f.type !== "image");

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const pinchDist = useRef(null);

  const clampZoom = (z) => Math.min(Math.max(1, z), 4);

  // ---------- ZOOM WHEEL ----------
  const onWheel = (e) => {
    if (zoom === 1 && e.deltaY > 0) return;
    e.preventDefault();
    setZoom((z) => clampZoom(z + e.deltaY * -0.001));
  };

  // ---------- DOUBLE CLICK ----------
  const onDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPos({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  // ---------- DRAG ----------
  const onMouseDown = (e) => {
    if (zoom === 1) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    velocity.current = { x: dx, y: dy };

    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    setDragging(false);

    // inertia
    const decay = () => {
      velocity.current.x *= 0.9;
      velocity.current.y *= 0.9;

      if (
        Math.abs(velocity.current.x) < 0.1 &&
        Math.abs(velocity.current.y) < 0.1
      )
        return;

      setPos((p) => ({
        x: p.x + velocity.current.x,
        y: p.y + velocity.current.y,
      }));

      requestAnimationFrame(decay);
    };
    decay();
  };

  // ---------- TOUCH (PINCH + DRAG) ----------
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchDist.current = getDist(e.touches);
    } else if (e.touches.length === 1 && zoom > 1) {
      lastPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = getDist(e.touches);
      const diff = dist - pinchDist.current;
      pinchDist.current = dist;
      setZoom((z) => clampZoom(z + diff * 0.01));
    } else if (e.touches.length === 1 && zoom > 1) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;

      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const getDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // ---------- CAROUSEL ----------
  const next = () => {
    setActiveIndex((i) => (i + 1) % images.length);
    resetView();
  };

  const prev = () => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
    resetView();
  };

  const resetView = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const formatValue = (v) =>
    v === null || v === undefined || v === "" ? "N/A" : v;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* IMAGE VIEWER */}
        {imageField && images.length > 0 && (
          <div className="flex flex-col items-center mb-8">

            <div
              className={`relative w-72 h-72 rounded-2xl overflow-hidden
              bg-linear-to-br from-white/60 to-gray-100/40
              border border-white/50 shadow-lg
              ${zoom > 1 ? "cursor-grab" : "cursor-zoom-in"}`}
              onWheel={onWheel}
              onDoubleClick={onDoubleClick}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
            >
              <img
                src={images[activeIndex]}
                alt=""
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                }}
                className="w-full h-full object-cover transition-transform duration-200 select-none"
                draggable={false}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => {
                      setActiveIndex(i);
                      resetView();
                    }}
                    className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 ${
                      i === activeIndex
                        ? "border-gray-800"
                        : "border-transparent opacity-70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherFields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium text-gray-500">
                {field.label}
              </label>
              <p className="text-gray-800 font-medium">
                {formatValue(item[field.key])}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-white/60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;