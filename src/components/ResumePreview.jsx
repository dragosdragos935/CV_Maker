"use client";

export default function ResumePreview({ resume, innerRef }) {
  const l = (kind) => label(kind, resume.cvLanguage);
  return (
    <div ref={innerRef} className="bg-white p-6 rounded-xl border shadow-soft max-w-3xl mx-auto text-sm leading-relaxed">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">{resume.name}</h1>
          <div className="text-gray-700">{resume.role}</div>
        </div>
        <div className="text-right text-gray-600">
          <div>{resume?.contact?.email}</div>
          <div>{resume?.contact?.phone}</div>
          <div>{resume?.contact?.location}</div>
          {resume?.contact?.linkedin ? <div>{resume.contact.linkedin}</div> : null}
          {resume?.contact?.website ? <div>{resume.contact.website}</div> : null}
          {resume?.contact?.github ? <div>{resume.contact.github}</div> : null}
        </div>
      </div>

      <Section title={l("summary")}>
        <p>{resume.professionalSummary}</p>
      </Section>

      <Section title={l("work")}>
        {(resume.workExperience || []).map((w, idx) => (
          <div key={`${w.company}-${idx}`} className="mb-3">
            <div className="font-semibold">{w.role} — {w.company}</div>
            <div className="text-gray-600 text-xs">{w.startDate} – {w.endDate}</div>
            <div className="mt-1 whitespace-pre-line">{w.description}</div>
          </div>
        ))}
      </Section>

      <Section title={l("academic")}>
        {(resume.academicHistory || []).map((a, idx) => (
          <div key={`${a.institution}-${idx}`} className="mb-3">
            <div className="font-semibold">{a.degree} — {a.institution}</div>
            <div className="text-gray-600 text-xs">{a.startDate} – {a.endDate}</div>
            {a.details ? <div className="mt-1">{a.details}</div> : null}
          </div>
        ))}
      </Section>

      {(resume.certifications || []).length > 0 && (
        <Section title={l("certs")}>
          {resume.certifications.map((c, idx) => (
            <div key={`${c.name}-${idx}`} className="mb-1">
              <span className="font-medium">{c.name}</span> — {c.issuer} ({c.date})
            </div>
          ))}
        </Section>
      )}

      {(resume.skills || []).length > 0 && (
        <Section title={l("skills")}>
          <div>{(resume.skills || []).join(', ')}</div>
        </Section>
      )}

      {(resume.driverLicense || '').trim() && (
        <Section title={l("license")}>
          <div>{resume.driverLicense}</div>
        </Section>
      )}

      {(resume.languages || []).length > 0 && (
        <Section title={l("languages")}>
          <ul className="list-disc ml-5">
            {(resume.languages || []).map((l, idx) => (
              <li key={`${l.name}-${idx}`}>{l.name}: {l.level}</li>
            ))}
          </ul>
        </Section>
      )}

      {(resume.other || '').trim() && (
        <Section title={l("other")}>
          <div>{resume.other}</div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold border-b pb-1 mb-2">{title}</h2>
      {children}
    </section>
  );
}

function label(kind, lang) {
  const dict = {
    ro: {
      summary: "Rezumat profesional",
      work: "Experiență profesională",
      academic: "Studii",
      certs: "Certificări",
      skills: "Competențe",
      license: "Permis de conducere",
      languages: "Limbi",
      other: "Altele",
    },
    en: {
      summary: "Professional Summary",
      work: "Work Experience",
      academic: "Academic History",
      certs: "Certifications",
      skills: "Skills",
      license: "Driver License",
      languages: "Languages",
      other: "Other",
    },
    it: {
      summary: "Sommario professionale",
      work: "Esperienza lavorativa",
      academic: "Formazione accademica",
      certs: "Certificazioni",
      skills: "Competenze",
      license: "Patente di guida",
      languages: "Lingue",
      other: "Altro",
    },
  };
  return (dict[lang] || dict.en)[kind];
}


