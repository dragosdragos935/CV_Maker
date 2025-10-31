export async function adaptResumeToJob(baseResume, options) {
  const { targetLanguage, apiKey, jobTitle, jobDescription, companyName } = options;

  if (apiKey && typeof fetch !== "undefined") {
    try {
      const prompt = buildEnhancedPrompt(baseResume, targetLanguage, jobTitle, jobDescription, companyName);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are an expert ATS optimization specialist and resume writer with deep knowledge of recruitment processes. Your goal is to perfectly tailor resumes to specific job descriptions to maximize interview chances." 
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        }),
      });
      const json = await response.json();
      const content = json?.choices?.[0]?.message?.content ?? "";
      const adapted = parseAdaptedResume(content, baseResume);
      
      // Adaugă informații despre job și companie în CV-ul adaptat
      const enhancedResume = {
        ...adapted,
        cvLanguage: targetLanguage,
        jobTitle: jobTitle || baseResume.jobTitle,
        company: companyName || baseResume.company,
        jobDescription: jobDescription || baseResume.jobDescription,
        updatedAt: new Date().toISOString()
      };
      
      return enhancedResume;
    } catch (error) {
      console.error("Error adapting resume:", error);
      return enhancedHeuristicAdapt(baseResume, targetLanguage, jobTitle, jobDescription, companyName);
    }
  }
  return enhancedHeuristicAdapt(baseResume, targetLanguage, jobTitle, jobDescription, companyName);
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

function buildEnhancedPrompt(resume, lang, jobTitle, jobDescription, companyName) {
  const label = { ro: "Romanian", en: "English", it: "Italian" }[lang] || "English";
  
  return [
    `Transform the following resume to be perfectly tailored for the specific job described below, in ${label}.`,
    `Your goal is to maximize the candidate's chances of passing ATS systems and being called for an interview.`,
    `Follow these expert guidelines:`,
    `1. Identify and incorporate ALL key skills, technologies, and qualifications from the job description`,
    `2. Reorganize work experience to highlight the most relevant achievements for this specific role`,
    `3. Use industry-specific terminology that matches the job description exactly`,
    `4. Quantify achievements with metrics and numbers wherever possible`,
    `5. Ensure the professional summary directly addresses the job requirements`,
    `6. Maintain the same structure but optimize every section for ATS compatibility`,
    `7. Preserve all contact information and personal details`,
    `Return ONLY JSON with the same keys as the input resume object.`,
    `--- Resume JSON ---`,
    JSON.stringify(resume),
    `--- Job Details ---`,
    `Job Title: ${jobTitle || 'Not specified'}`,
    `Company: ${companyName || 'Not specified'}`,
    `Job Description: ${jobDescription || 'Not provided'}`,
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

function enhancedHeuristicAdapt(resume, lang, jobTitle, jobDescription, companyName) {
  const jd = `${jobTitle || resume.jobTitle || ""} ${jobDescription || resume.jobDescription || ""}`.toLowerCase();
  
  // Extrage cuvinte cheie îmbunătățite
  const keywords = extractEnhancedKeywords(jd, 20);
  
  // Funcție pentru evidențierea și adaptarea textului
  const enhanceText = (text) => {
    if (!text) return text;
    let t = text;
    
    // Evidențiază cuvintele cheie
    for (const kw of keywords) {
      const re = new RegExp(`(\\\b${escapeRegExp(kw)}\\\b)`, "ig");
      t = t.replace(re, (m) => m.toUpperCase());
    }
    
    // Adaugă termeni specifici jobului dacă nu există deja
    if (jobTitle && !t.toLowerCase().includes(jobTitle.toLowerCase())) {
      t = `${t} Experiență relevantă pentru poziția de ${jobTitle}.`;
    }
    
    return t;
  };

  // Reorganizează experiența de muncă în funcție de relevanță
  const reorganizeExperience = (experiences) => {
    if (!experiences || experiences.length <= 1) return experiences;
    
    return [...experiences].sort((a, b) => {
      const aRelevance = calculateRelevance(a, keywords);
      const bRelevance = calculateRelevance(b, keywords);
      return bRelevance - aRelevance;
    });
  };
  
  // Calculează relevanța unei experiențe pentru jobul curent
  const calculateRelevance = (exp, keywords) => {
    const expText = `${exp.role || ""} ${exp.company || ""} ${exp.description || ""}`.toLowerCase();
    return keywords.reduce((score, kw) => {
      return score + (expText.includes(kw.toLowerCase()) ? 1 : 0);
    }, 0);
  };

  return {
    ...resume,
    cvLanguage: lang,
    jobTitle: jobTitle || resume.jobTitle,
    company: companyName || resume.company,
    jobDescription: jobDescription || resume.jobDescription,
    professionalSummary: enhanceText(resume.professionalSummary),
    workExperience: reorganizeExperience((resume.workExperience || []).map(w => ({ 
      ...w, 
      description: enhanceText(w.description),
      bullets: (w.bullets || []).map(bullet => enhanceText(bullet))
    }))),
    skills: prioritizeSkillsByKeywords(resume.skills || [], keywords, jd),
    updatedAt: new Date().toISOString(),
  };
}

function extractEnhancedKeywords(text, limit = 15) {
  if (!text) return [];
  
  // Elimină cuvintele comune și simbolurile
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
  
  // Lista de cuvinte de oprit (stopwords)
  const stopWords = new Set([
    "and", "the", "with", "for", "using", "from", "this", "that", "you", "are", "your", "will", 
    "have", "been", "being", "our", "their", "them", "they", "about", "after", "all", "also", 
    "can", "com", "more", "most", "other", "some", "such", "than", "then", "there", "these", 
    "they", "this", "those", "what", "when", "where", "which", "who", "will", "would", "www"
  ]);
  
  // Extrage cuvintele și frazele
  const words = cleanText.match(/\b[a-z][a-z+.#0-9-]{2,}\b/g) || [];
  const phrases = extractPhrases(cleanText);
  
  // Calculează frecvența cuvintelor
  const wordFreq = {};
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  // Adaugă frazele importante
  for (const phrase of phrases) {
    if (phrase.length > 3) {
      wordFreq[phrase] = (wordFreq[phrase] || 0) + 3; // Prioritizează frazele
    }
  }
  
  // Sortează după frecvență și returnează cele mai importante cuvinte/fraze
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function extractPhrases(text) {
  const phrases = [];
  
  // Extrage fraze tehnice comune
  const technicalPhrases = [
    /\b(machine learning|deep learning|artificial intelligence|data science|big data|cloud computing|web development|full stack|front end|back end|devops|ci cd|test driven development|agile methodology|scrum master|product owner|user experience|user interface|responsive design|mobile first|cross platform|restful api|microservices|serverless architecture|blockchain technology|internet of things|augmented reality|virtual reality|software engineering|project management|business intelligence|data analytics|data visualization|natural language processing|computer vision|neural networks|version control|git workflow|database management|sql server|no sql|aws services|azure cloud|google cloud|docker containers|kubernetes orchestration|continuous integration|continuous deployment|test automation|quality assurance|security testing|penetration testing|performance optimization|scalable solutions|distributed systems|object oriented programming|functional programming|reactive programming|design patterns|software architecture|system design|api integration|third party integration|payment processing|authentication authorization|single sign on|oauth implementation|jwt tokens|real time processing|batch processing|data migration|legacy system integration|mobile development|progressive web apps|native applications|hybrid applications|cross browser compatibility|accessibility compliance|internationalization|localization|content management|digital marketing|search engine optimization|conversion rate optimization|a b testing|user research|customer journey|wireframing prototyping|information architecture|content strategy|brand identity|visual design|interaction design|motion design|voice user interface|chatbot development|robotic process automation|predictive analytics|prescriptive analytics|data mining|etl processes|data warehousing|business process management|enterprise resource planning|customer relationship management|supply chain management|human resources management|financial management|risk management|compliance management|change management|stakeholder management|portfolio management|program management)\b/gi
  ];
  
  for (const pattern of technicalPhrases) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      phrases.push(match[1].toLowerCase());
    }
  }
  
  return phrases;
}

function prioritizeSkillsByKeywords(skills, keywords, jobDescription) {
  if (!skills || skills.length === 0) return [];
  if (!keywords || keywords.length === 0) return skills;
  
  // Adaugă cuvinte cheie din descrierea jobului ca skills dacă nu există deja
  const skillsSet = new Set(skills.map(s => s.toLowerCase()));
  const enhancedSkills = [...skills];
  
  for (const kw of keywords) {
    if (!skillsSet.has(kw.toLowerCase())) {
      enhancedSkills.push(capitalize(kw));
    }
  }
  
  // Sortează skills în funcție de relevanța pentru job
  return enhancedSkills.sort((a, b) => {
    const aRelevance = keywords.some(kw => a.toLowerCase().includes(kw.toLowerCase())) ? 1 : 0;
    const bRelevance = keywords.some(kw => b.toLowerCase().includes(kw.toLowerCase())) ? 1 : 0;
    return bRelevance - aRelevance;
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function computeMatchScore(resume, jobTitle, jobDescription, companyName) {
  try {
    const jd = `${jobTitle || resume.jobTitle || ""} ${jobDescription || resume.jobDescription || ""} ${companyName || resume.company || ""}`.toLowerCase();
    const jdKws = new Set(extractEnhancedKeywords(jd, 20));
    
    // Extrage text din CV pentru analiză
    const text = [
      resume.professionalSummary || "",
      (resume.skills || []).join(" "),
      ...(resume.workExperience || []).map((w) => `${w.role} ${w.company} ${w.description || ""} ${(w.bullets || []).join(" ")}`),
    ].join(" ").toLowerCase();
    
    const cvKws = new Set(extractEnhancedKeywords(text, 20));
    
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
          missing: missingKeywords,
          weight: 40,
          label: "Potrivire cuvinte cheie"
        },
        completeness: {
          score: completenessScore,
          missingFields: missingFields,
          weight: 20,
          label: "Completitudine CV"
        },
        workExperience: {
          score: workExpScore,
          weight: 25,
          label: "Calitatea experienței"
        },
        skills: {
          score: skillScore,
          count: (resume.skills || []).length,
          weight: 15,
          label: "Relevanța competențelor"
        }
      }
    };
  } catch (error) {
    console.error("Error computing match score:", error);
    return {
      total: 0,
      details: {
        keywordMatch: { score: 0, matched: [], missing: [], weight: 40, label: "Potrivire cuvinte cheie" },
        completeness: { score: 0, missingFields: [], weight: 20, label: "Completitudine CV" },
        workExperience: { score: 0, weight: 25, label: "Calitatea experienței" },
        skills: { score: 0, count: 0, weight: 15, label: "Relevanța competențelor" }
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


