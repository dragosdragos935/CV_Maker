"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";

export default function ProfilePage() {
  const router = useRouter();
  const { resume, setField, setResume } = useResumeStore();
  const [profile, setProfile] = useState({
    name: resume.name || "",
    email: resume.contact?.email || "",
    phone: resume.contact?.phone || "",
    location: resume.contact?.location || "",
    professionalSummary: resume.professionalSummary || "",
    skills: Array.isArray(resume.skills) ? resume.skills : [],
    languages: Array.isArray(resume.languages) ? resume.languages : [],
    driverLicense: resume.driverLicense || "",
    socialLinks: {
      linkedin: resume.contact?.linkedin || "",
      github: resume.contact?.github || "",
      website: resume.contact?.website || "",
    },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({ ...prev, ...parsed }));
        if (setResume) setResume({ ...resume, ...parsed });
        else {
          Object.keys(parsed).forEach((key) => setField(key, parsed[key]));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  const handleSkillsChange = (e) => {
    const next = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
    setProfile((p) => ({ ...p, skills: next }));
  };
  const handleLanguagesChange = (e) => {
    const next = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
    setProfile((p) => ({ ...p, languages: next }));
  };

  const saveProfile = () => {
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));
      // Map fields to store
      setField("name", profile.name);
      setField("professionalSummary", profile.professionalSummary);
      setField("skills", profile.skills);
      setField("languages", profile.languages);
      setField("driverLicense", profile.driverLicense);
      setField("contact", {
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.socialLinks.linkedin,
        website: profile.socialLinks.website,
        github: profile.socialLinks.github,
      });
      alert("Profil salvat!");
    } catch (e) {
      console.error(e);
      alert("Eroare la salvare.");
    }
  };

  const goToTailor = () => {
    saveProfile();
    router.push("/tailor");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 bg-linear-to-r from-indigo-700 to-pink-600 bg-clip-text text-transparent">Profil</h1>
        <div className="card p-4 mb-6">
          <h2 className="font-semibold mb-2 text-indigo-700">Informații personale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" name="name" placeholder="Nume complet" value={profile.name} onChange={handleChange} />
            <input className="input" name="email" placeholder="Email" value={profile.email} onChange={handleChange} />
            <input className="input" name="phone" placeholder="Telefon" value={profile.phone} onChange={handleChange} />
            <input className="input" name="location" placeholder="Locație" value={profile.location} onChange={handleChange} />
          </div>
        </div>
        <div className="card p-4 mb-6">
          <h2 className="font-semibold mb-2 text-indigo-700">Sumar profesional</h2>
          <textarea className="textarea" name="professionalSummary" value={profile.professionalSummary} onChange={handleChange} placeholder="Scrie un rezumat..." />
        </div>
        <div className="card p-4 mb-6">
          <h2 className="font-semibold mb-2 text-indigo-700">Abilități</h2>
          <textarea className="textarea" value={profile.skills.join(", ")} onChange={handleSkillsChange} placeholder="Abilități separate prin virgulă" />
        </div>
        <div className="card p-4 mb-6">
          <h2 className="font-semibold mb-2 text-indigo-700">Limbi străine</h2>
          <div className="flex flex-col gap-3">
            <textarea className="textarea" value={profile.languages.join(", ")} onChange={handleLanguagesChange} placeholder="Ex: Engleză - Avansat, Franceză - Mediu" />
            <button type="button" className="btn-primary w-fit" onClick={() => {
              const val = prompt("Introduceți o nouă limbă (ex: Engleză - Avansat)");
              if (val && val.trim()) setProfile((p) => ({ ...p, languages: [...p.languages, val.trim()] }));
            }}>+ Adaugă limbă</button>
          </div>
        </div>
        <div className="card p-4 mb-6">
          <h2 className="font-semibold mb-2 text-indigo-700">Permis de conducere</h2>
          <div className="flex gap-2">
            <input className="input flex-1" name="driverLicense" placeholder="Categoria B, C, etc." value={profile.driverLicense} onChange={handleChange} />
            <button type="button" className="btn-primary" onClick={() => {
              const val = prompt("Introduceți categoria permisului");
              if (val && val.trim()) setProfile((p) => ({ ...p, driverLicense: p.driverLicense ? `${p.driverLicense}, ${val.trim()}` : val.trim() }));
            }}>+ Adaugă permis</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-success" onClick={saveProfile}>Salvează</button>
          <button className="btn-primary" onClick={goToTailor}>Continuă la adaptare CV</button>
        </div>
      </div>
    </div>
  );
}