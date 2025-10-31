"use client";

// Italy-styled template: left accent bar, two-column layout, elegant headings
export default function Italy({ resume, innerRef, highlightKeywords = [] }) {
  // Funcție pentru evidențierea cuvintelor cheie în text
  const highlightText = (text) => {
    if (!text || !highlightKeywords || highlightKeywords.length === 0) return text;
    
    // Convertim textul și cuvintele cheie la lowercase pentru comparație
    const lowerText = text.toLowerCase();
    const lowerKeywords = highlightKeywords.map(kw => kw.toLowerCase());
    
    // Verificăm dacă textul conține vreun cuvânt cheie
    const containsKeyword = lowerKeywords.some(kw => lowerText.includes(kw));
    if (!containsKeyword) return text;
    
    // Împărțim textul în fragmente pentru a evidenția cuvintele cheie
    let result = text;
    lowerKeywords.forEach(keyword => {
      // Folosim o expresie regulată pentru a găsi cuvântul cheie, ignorând majusculele/minusculele
      const regex = new RegExp(`(${keyword})`, 'gi');
      result = result.replace(regex, '<span class="bg-yellow-200 font-medium">$1</span>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };
  return (
    <div ref={innerRef} className="bg-white rounded-xl border shadow-soft max-w-3xl mx-auto overflow-hidden">
      <div className="flex">
        <div className="w-2 bg-rose-600" />
        <div className="flex-1 p-6">
          <header className="border-b pb-4">
            <h1 className="text-3xl font-bold tracking-wide text-rose-700">{resume.name}</h1>
            <div className="text-gray-700">{resume.role}</div>
          </header>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <section className="md:col-span-2">
              <Section title={label('summary', resume.cvLanguage)}>
                <p className="text-[0.95rem] leading-6">{highlightText(resume.professionalSummary)}</p>
              </Section>

              <Section title={label('work', resume.cvLanguage)}>
                {(resume.workExperience || []).map((w, idx) => (
                  <div key={`${w.company}-${idx}`} className="mb-4">
                    <div className="font-semibold text-[1.05rem]">{highlightText(w.role)} · {highlightText(w.company)}</div>
                    <div className="text-gray-600 text-xs">{w.startDate} – {w.endDate}</div>
                    <div className="mt-1 whitespace-pre-line text-[0.95rem] leading-6">{highlightText(w.description)}</div>
                  </div>
                ))}
              </Section>

              <Section title={label('academic', resume.cvLanguage)}>
                {(resume.academicHistory || []).map((a, idx) => (
                  <div key={`${a.institution}-${idx}`} className="mb-3">
                    <div className="font-medium">{highlightText(a.degree)} — {highlightText(a.institution)}</div>
                    <div className="text-gray-600 text-xs">{a.startDate} – {a.endDate}</div>
                    {a.details ? <div className="mt-1">{highlightText(a.details)}</div> : null}
                  </div>
                ))}
              </Section>
            </section>

            <aside className="md:col-span-1 space-y-4">
              <Box title={label('contact', resume.cvLanguage)}>
                <InfoRow value={resume?.contact?.email} />
                <InfoRow value={resume?.contact?.phone} />
                <InfoRow value={resume?.contact?.location} />
                <InfoRow value={resume?.contact?.linkedin} />
                <InfoRow value={resume?.contact?.website} />
                <InfoRow value={resume?.contact?.github} />
              </Box>

              {(resume.skills || []).length > 0 && (
                <Box title={label('skills', resume.cvLanguage)}>
                  <div className="flex flex-wrap gap-2">
                    {(resume.skills || []).map((s, i) => (
                      <span key={`${s}-${i}`} className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">{highlightText(s)}</span>
                    ))}
                  </div>
                </Box>
              )}

              {(resume.languages || []).length > 0 && (
                <Box title={label('languages', resume.cvLanguage)}>
                  <ul className="text-sm list-disc ml-5">
                    {(resume.languages || []).map((l, i) => (
                      <li key={`${l.name}-${i}`}>{highlightText(l.name)}: {highlightText(l.level)}</li>
                    ))}
                  </ul>
                </Box>
              )}

              {(resume.certifications || []).length > 0 && (
                <Box title={label('certs', resume.cvLanguage)}>
                  {(resume.certifications || []).map((c, i) => (
                    <div key={`${c.name}-${i}`} className="text-sm mb-1">{highlightText(c.name)} — {highlightText(c.issuer)} ({c.date})</div>
                  ))}
                </Box>
              )}

              {(resume.driverLicense || '').trim() && (
                <Box title={label('license', resume.cvLanguage)}>
                  <div className="text-sm">{highlightText(resume.driverLicense)}</div>
                </Box>
              )}

              {(resume.other || '').trim() && (
                <Box title={label('other', resume.cvLanguage)}>
                  <div className="text-sm whitespace-pre-line">{highlightText(resume.other)}</div>
                </Box>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-5">
      <h2 className="text-[0.95rem] font-semibold tracking-wide text-rose-700 uppercase/relaxed">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Box({ title, children }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-sm font-semibold text-rose-700 mb-1">{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ value }) {
  if (!value) return null;
  return <div className="text-sm text-gray-700">{value}</div>;
}

function label(kind, lang) {
  const dict = {
    ro: { summary: "Rezumat profesional", work: "Experiență", academic: "Studii", certs: "Certificări", skills: "Competențe", license: "Permis", languages: "Limbi", other: "Altele", contact: "Contact" },
    en: { summary: "Professional Summary", work: "Experience", academic: "Education", certs: "Certifications", skills: "Skills", license: "License", languages: "Languages", other: "Other", contact: "Contact" },
    it: { summary: "Sommario", work: "Esperienza", academic: "Formazione", certs: "Certificazioni", skills: "Competenze", license: "Patente", languages: "Lingue", other: "Altro", contact: "Contatti" },
  };
  return (dict[lang] || dict.en)[kind];
}



