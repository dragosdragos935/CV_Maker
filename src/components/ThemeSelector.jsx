"use client";

export default function ThemeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm text-gray-700">Tema CV:</label>
      <select className="border rounded px-3 py-2" value={value} onChange={(e) => onChange?.(e.target.value)}>
        <option value="classic">Classic</option>
        <option value="italy">Italy</option>
      </select>
    </div>
  );
}



