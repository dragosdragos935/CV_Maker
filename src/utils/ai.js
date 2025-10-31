export async function adaptResumeToJob(baseResume, options) {
  const { targetLanguage, apiKey } = options;

  if (apiKey && typeof fetch !== "undefined") {
    try {
      const prompt = buildPrompt(baseResume, targetLanguage);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert resume writer." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });
      const json = await response.json();
      const content = json?.choices?.[0]?.message?.content ?? "";
      const adapted = parseAdaptedResume(content, baseResume);
      return { ...adapted, cvLanguage: targetLanguage, updatedAt: new Date().toISOString() };
    } catch {
      return heuristicAdapt(baseResume, targetLanguage);
    }
  }
  return heuristicAdapt(baseResume, targetLanguage);
}

export async function generateCoverLetter(baseResume, options) {
  const { targetLanguage, recipientName, companyName, jobTitle, apiKey } = options;
  const langLabel = { ro: "Română", en: "English", it: "Italiano" }[targetLanguage] || "English";
  const fallback = heuristicLetter(baseResume, { targetLanguage, recipientName, companyName, jobTitle });
  if (!apiKey || typeof fetch === "undefined") return fallback;
  try {
    const prompt = [
      `Write a concise, compelling cover letter in ${langLabel}.`,
      `Use the resume data and target job details below. 180-280 words.`,
      `Tone: professional, confident, specific to the role.`,
      `--- Resume JSON ---`,
      JSON.stringify(baseResume),
      `--- Job ---`,
      `Company: ${companyName || baseResume.company}`,
      `Title: ${jobTitle || baseResume.jobTitle}`,
      `Recipient: ${recipientName || ''}`,
    ].join("\n");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.4 }),
    });
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim();
    return content || fallback;
  } catch {
    return fallback;
  }
}

function heuristicLetter(resume, { targetLanguage, recipientName, companyName, jobTitle }) {
  const name = resume.name || "";
  const role = jobTitle || resume.jobTitle || "rolul menționat";
  const comp = companyName || resume.company || "compania dvs";
  const greeting = recipientName ? `Stimate ${recipientName},` : "Bună ziua,";
  const bodyRo = `${greeting}\n\nSunt ${name} și doresc să aplic pentru poziția ${role} la ${comp}. Experiența mea include ${
    (resume.skills || []).slice(0, 5).join(", ")
  }, iar în rolurile anterioare am livrat rezultate prin ${
    (resume.workExperience?.[0]?.description || "impact măsurabil")
  }. Consider că abilitățile mele se potrivesc cerințelor și pot contribui rapid.\n\nVă mulțumesc pentru timpul acordat.\n\nCu stimă,\n${name}`;
  const bodyEn = `${recipientName ? `Dear ${recipientName},` : "Hello,"}\n\nMy name is ${name} and I am applying for the ${role} role at ${comp}. My background includes ${
    (resume.skills || []).slice(0, 5).join(", ")
  }, and in prior roles I delivered impact through ${
    (resume.workExperience?.[0]?.description || "measurable outcomes")
  }. I believe my skills match the requirements and I can contribute quickly.\n\nThank you for your time.\n\nBest regards,\n${name}`;
  const bodyIt = `${recipientName ? `Gentile ${recipientName},` : "Buongiorno,"}\n\nMi chiamo ${name} e vorrei candidarmi per la posizione di ${role} presso ${comp}. La mia esperienza include ${
    (resume.skills || []).slice(0, 5).join(", ")
  } e in ruoli precedenti ho ottenuto risultati tramite ${
    (resume.workExperience?.[0]?.description || "risultati misurabili")
  }. Ritengo che le mie competenze siano allineate ai requisiti.\n\nGrazie per l'attenzione.\n\nCordiali saluti,\n${name}`;
  return targetLanguage === "en" ? bodyEn : targetLanguage === "it" ? bodyIt : bodyRo;
}

function buildPrompt(resume, lang) {
  const label = { ro: "Romanian", en: "English", it: "Italian" }[lang] || "English";
  return [
    `Transform the following resume to be targeted for the job below, in ${label}.`,
    `Preserve structure: name, role, summary, contact, work experience (with bullets), academic, certifications, skills, driver license, languages, other.`,
    `Return ONLY JSON with same keys as the input resume object.`,
    `--- Resume JSON ---`,
    JSON.stringify(resume),
    `--- End Resume JSON ---`,
  ].join("\n");
}

function parseAdaptedResume(content, fallback) {
  try {
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
      return { ...fallback, ...parsed };
    }
  } catch {}
  return fallback;
}

function heuristicAdapt(resume, lang) {
  const jd = `${resume.jobTitle} ${resume.jobDescription}`.toLowerCase();
  const emphasize = (text) => {
    if (!text) return text;
    let t = text;
    const keywords = extractKeywords(jd);
    for (const kw of keywords) {
      const re = new RegExp(`(\\\b${escapeRegExp(kw)}\\\b)`, "ig");
      t = t.replace(re, (m) => m.toUpperCase());
    }
    return t;
  };

  return {
    ...resume,
    cvLanguage: lang,
    professionalSummary: emphasize(resume.professionalSummary),
    workExperience: (resume.workExperience || []).map((w) => ({ ...w, description: emphasize(w.description) })),
    skills: mergeWithJobKeywords(resume.skills || [], jd),
    updatedAt: new Date().toISOString(),
  };
}

function extractKeywords(text) {
  const words = (text.match(/[a-zA-Z][a-zA-Z+.#-]{2,}/g) || []).map((w) => w.toLowerCase());
  const stop = new Set(["and", "the", "with", "for", "using", "from", "this", "that", "you"]);
  const freq = {};
  for (const w of words) {
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

function mergeWithJobKeywords(skills, jd) {
  const kws = extractKeywords(jd);
  const set = new Set(skills.map((s) => s.toLowerCase()));
  for (const k of kws) {
    if (!set.has(k)) skills = [...skills, capitalize(k)];
  }
  return Array.from(new Set(skills));
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function computeMatchScore(resume) {
  try {
    const jd = `${resume.jobTitle || ""} ${resume.jobDescription || ""}`.toLowerCase();
    const jdKws = new Set(extractKeywords(jd));
    const text = [
      resume.professionalSummary || "",
      (resume.skills || []).join(" "),
      ...(resume.workExperience || []).map((w) => `${w.role} ${w.company} ${w.description || ""}`),
    ].join(" ").toLowerCase();
    const cvKws = new Set(extractKeywords(text));
    
    // Calculează suprapunerea cuvintelor cheie
    let overlap = 0;
    const matchedKeywords = [];
    const missingKeywords = [];
    jdKws.forEach((k) => { 
      if (cvKws.has(k)) {
        overlap += 1;
        matchedKeywords.push(k);
      } else {
        missingKeywords.push(k);
      }
    });
    const keywordCoverage = jdKws.size ? overlap / jdKws.size : 0;
    
    // Verifică completitudinea CV-ului
    const requiredFields = [
      { name: 'nume', value: resume.name },
      { name: 'rol', value: resume.role },
      { name: 'sumar profesional', value: resume.professionalSummary },
      { name: 'email', value: resume.contact?.email },
      { name: 'telefon', value: resume.contact?.phone }
    ];
    const missingFields = requiredFields.filter(field => !field.value).map(field => field.name);
    const completeness = requiredFields.filter(field => field.value).length / requiredFields.length;
    
    // Evaluează experiența de muncă
    const workExpQuality = Math.min(
      ((resume.workExperience || []).filter(w => w.description && w.description.length > 50).length / 
      Math.max(1, (resume.workExperience || []).length)) * 
      Math.min((resume.workExperience || []).length / 3, 1),
      1
    );
    
    // Evaluează abilitățile
    const skillBoost = Math.min((resume.skills || []).length / 12, 1);
    const skillRelevance = calculateSkillRelevance(resume.skills || [], jd);
    
    // Calculează scorurile individuale
    const keywordScore = Math.round(keywordCoverage * 100);
    const completenessScore = Math.round(completeness * 100);
    const workExpScore = Math.round(workExpQuality * 100);
    const skillScore = Math.round((skillBoost * 0.5 + skillRelevance * 0.5) * 100);
    
    // Calculează scorul final
    const finalScore = Math.round(
      keywordScore * 0.4 + 
      completenessScore * 0.2 + 
      workExpScore * 0.25 + 
      skillScore * 0.15
    );
    
    return {
      total: Math.max(0, Math.min(100, finalScore)),
      details: {
        keywordMatch: {
          score: keywordScore,
          matched: matchedKeywords,
          missing: missingKeywords
        },
        completeness: {
          score: completenessScore,
          missingFields: missingFields
        },
        workExperience: {
          score: workExpScore
        },
        skills: {
          score: skillScore,
          count: (resume.skills || []).length
        }
      }
    };
  } catch (error) {
    console.error("Error computing match score:", error);
    return {
      total: 0,
      details: {
        keywordMatch: { score: 0, matched: [], missing: [] },
        completeness: { score: 0, missingFields: [] },
        workExperience: { score: 0 },
        skills: { score: 0, count: 0 }
      }
    };
  }
}

function calculateSkillRelevance(skills, jobDescription) {
  if (!skills.length || !jobDescription) return 0;
  
  const jdLower = jobDescription.toLowerCase();
  let relevantSkills = 0;
  
  for (const skill of skills) {
    if (jdLower.includes(skill.toLowerCase())) {
      relevantSkills++;
    }
  }
  
  return Math.min(relevantSkills / skills.length, 1);
}


