"use client";

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <select className="border rounded px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="ro">Română</option>
        <option value="en">English</option>
        <option value="it">Italiano</option>
      </select>
    </div>
  );
}


