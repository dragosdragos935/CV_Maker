"use client";

export default function Classic({ resume, innerRef, highlightKeywords = [] }) {
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

      <Section title={label('summary', resume.cvLanguage)}>
        <p>{highlightText(resume.professionalSummary)}</p>
      </Section>

      <Section title={label('work', resume.cvLanguage)}>
        {(resume.workExperience || []).map((w, idx) => (
          <div key={`${w.company}-${idx}`} className="mb-3">
            <div className="font-semibold">{highlightText(w.role)} — {highlightText(w.company)}</div>
            <div className="text-gray-600 text-xs">{w.startDate} – {w.endDate}</div>
            <div className="mt-1 whitespace-pre-line">{highlightText(w.description)}</div>
          </div>
        ))}
      </Section>

      <Section title={label('academic', resume.cvLanguage)}>
        {(resume.academicHistory || []).map((a, idx) => (
          <div key={`${a.institution}-${idx}`} className="mb-3">
            <div className="font-semibold">{highlightText(a.degree)} — {highlightText(a.institution)}</div>
            <div className="text-gray-600 text-xs">{a.startDate} – {a.endDate}</div>
            {a.details ? <div className="mt-1">{highlightText(a.details)}</div> : null}
          </div>
        ))}
      </Section>

      {(resume.certifications || []).length > 0 && (
        <Section title={label('certs', resume.cvLanguage)}>
          {resume.certifications.map((c, idx) => (
            <div key={`${c.name}-${idx}`} className="mb-1">
              <span className="font-medium">{highlightText(c.name)}</span> — {highlightText(c.issuer)} ({c.date})
            </div>
          ))}
        </Section>
      )}

      {(resume.skills || []).length > 0 && (
        <Section title={label('skills', resume.cvLanguage)}>
          <div>{(resume.skills || []).map(skill => highlightText(skill)).join(', ')}</div>
        </Section>
      )}

      {(resume.driverLicense || '').trim() && (
        <Section title={label('license', resume.cvLanguage)}>
          <div>{highlightText(resume.driverLicense)}</div>
        </Section>
      )}

      {(resume.languages || []).length > 0 && (
        <Section title={label('languages', resume.cvLanguage)}>
          <ul className="list-disc ml-5">
            {(resume.languages || []).map((l, idx) => (
              <li key={`${l.name}-${idx}`}>{highlightText(l.name)}: {highlightText(l.level)}</li>
            ))}
          </ul>
        </Section>
      )}

      {(resume.other || '').trim() && (
        <Section title={label('other', resume.cvLanguage)}>
          <div>{highlightText(resume.other)}</div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-4">
      <h2 className="text-md font-bold text-indigo-700 border-b border-indigo-200 pb-1 mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function label(key, lang = 'en') {
  const labels = {
    summary: {
      en: 'Professional Summary',
      ro: 'Sumar Profesional',
      it: 'Sommario Professionale'
    },
    work: {
      en: 'Work Experience',
      ro: 'Experiență Profesională',
      it: 'Esperienza Lavorativa'
    },
    academic: {
      en: 'Education',
      ro: 'Educație',
      it: 'Istruzione'
    },
    certs: {
      en: 'Certifications',
      ro: 'Certificări',
      it: 'Certificazioni'
    },
    skills: {
      en: 'Skills',
      ro: 'Abilități',
      it: 'Competenze'
    },
    languages: {
      en: 'Languages',
      ro: 'Limbi Străine',
      it: 'Lingue'
    },
    license: {
      en: 'Driver License',
      ro: 'Permis de Conducere',
      it: 'Patente di Guida'
    },
    other: {
      en: 'Other Information',
      ro: 'Alte Informații',
      it: 'Altre Informazioni'
    }
  };

  return labels[key][lang] || labels[key]['en'];
}



