"use client";
import { useEffect, useRef } from "react";

export default function AutoTextarea({ value, onChange, className = "", rows = 3, placeholder = "", name }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      name={name}
      rows={rows}
      className={`w-full border rounded px-3 py-2 resize-none ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}



