"use client";
import { useState } from "react";
import { generateCoverLetter } from "@/utils/ai";
import { useResumeStore } from "@/store/useResumeStore";

export default function LetterBuilder({ company, onSave }) {
  const { resume } = useResumeStore();
  const [recipientName, setRecipientName] = useState("");
  const [jobTitle, setJobTitle] = useState(resume.jobTitle || "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const build = async () => {
    setLoading(true);
    try {
      const text = await generateCoverLetter(resume, {
        targetLanguage: resume.cvLanguage,
        recipientName,
        companyName: company?.name || resume.company,
        jobTitle: jobTitle || resume.jobTitle,
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      setContent(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur border rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-indigo-700 mb-2">Scrisoare de intenție</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <input className="border rounded px-3 py-2" placeholder="Destinatar (nume)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Rol/Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        <button onClick={build} className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded shadow">Generează cu AI</button>
      </div>
      <textarea rows={8} className="w-full border rounded px-3 py-2" placeholder="Conținut scrisoare" value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="mt-2 flex gap-2">
        <button
          className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 rounded shadow"
          onClick={() => onSave?.(content)}
          disabled={!content.trim()}
        >
          Salvează scrisoare
        </button>
        {loading && <span className="text-sm text-gray-600">Se generează...</span>}
      </div>
    </div>
  );
}


