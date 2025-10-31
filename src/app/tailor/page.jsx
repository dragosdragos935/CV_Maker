"use client";

import { useState, useEffect } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import CVPreviewThemed from '../../components/CVPreviewThemed';
import { getResumeFromLocalStorage } from '../../utils/localStorage';
import { useRouter } from 'next/navigation';

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const { resume, setResume } = useResumeStore();
  const router = useRouter();
  
  // Încarcă profilul utilizatorului din localStorage
  useEffect(() => {
    const userResume = getResumeFromLocalStorage();
    if (userResume) {
      setResume(userResume);
    }
  }, [setResume]);

  // Funcție pentru a extrage cuvinte cheie din descrierea jobului
  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulăm procesul de analiză AI
    setTimeout(() => {
      // Extrage cuvinte cheie din descrierea jobului
      const extractedKeywords = jobDescription
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(word => word.length > 4)
        .filter((word, index, self) => self.indexOf(word) === index)
        .slice(0, 15);
      
      setKeywords(extractedKeywords);
      
      // Importăm funcția computeMatchScore pentru a calcula scorul ATS detaliat
      import('../../utils/ai').then(({ computeMatchScore }) => {
        // Pregătim datele pentru calculul scorului
        const resumeWithJobDetails = {
          ...resume,
          jobTitle: jobTitle,
          jobDescription: jobDescription,
          company: company
        };
        
        // Calculăm scorul ATS detaliat
        const scoreDetails = computeMatchScore(resumeWithJobDetails);
        setMatchScore(scoreDetails);
        
        // Generează sugestii AI pentru îmbunătățirea CV-ului bazate pe scorul detaliat
        generateAiSuggestions(extractedKeywords, scoreDetails);
        
        // Creează o versiune optimizată a CV-ului
        optimizeResume(extractedKeywords);
        
        setIsAnalyzing(false);
      });
    }, 1000);
  };

  // Generează sugestii AI pentru îmbunătățirea CV-ului
  const generateAiSuggestions = (allKeywords, scoreDetails) => {
    const suggestions = [];
    
    // Sugestii bazate pe cuvinte cheie lipsă
    if (scoreDetails.details.keywordMatch.missing.length > 0) {
      suggestions.push(`Adaugă aceste cuvinte cheie importante: ${scoreDetails.details.keywordMatch.missing.slice(0, 5).join(', ')}`);
    }
    
    // Sugestii bazate pe câmpuri lipsă
    if (scoreDetails.details.completeness.missingFields.length > 0) {
      suggestions.push(`Completează câmpurile lipsă: ${scoreDetails.details.completeness.missingFields.join(', ')}`);
    }
    
    // Sugestii generale
    if (scoreDetails.details.workExperience.score < 70) {
      suggestions.push("Îmbunătățește descrierile experienței de muncă cu mai multe detalii și realizări cuantificabile");
    }
    
    if (scoreDetails.details.skills.score < 70) {
      suggestions.push("Adaugă mai multe abilități relevante pentru acest job");
    }
    
    // Adaugă sugestii generale dacă nu avem suficiente sugestii specifice
    if (suggestions.length < 3) {
      suggestions.push(
        "Personalizează sumarul profesional pentru a reflecta cerințele specifice ale jobului",
        "Evidențiază realizările care se aliniază cu responsabilitățile din descrierea jobului",
        "Folosește terminologia specifică industriei în tot CV-ul"
      );
    }
    
    setAiSuggestions(suggestions);
  };

  // Optimizează CV-ul pentru a se potrivi mai bine cu descrierea jobului
  const optimizeResume = (keywords) => {
    if (!resume) return;
    
    // Creăm o copie a CV-ului pentru a o optimiza
    const optimized = JSON.parse(JSON.stringify(resume));
    
    // Optimizăm sumarul profesional
    if (optimized.professionalSummary) {
      optimized.professionalSummary = `Profesionist cu experiență în ${keywords.slice(0, 3).join(', ')}. ${optimized.professionalSummary}`;
    }
    
    // Setăm CV-ul optimizat
    setOptimizedResume(optimized);
  };

  // Analizează automat descrierea jobului când se modifică
  useEffect(() => {
    const timer = setTimeout(() => {
      if (jobDescription.trim().length > 20) {
        analyzeJobDescription();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [jobDescription]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Optimizează CV-ul pentru ATS
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Sistemele ATS (Applicant Tracking System) folosite de recrutori filtrează CV-urile înainte ca acestea să ajungă la ochii umani. 
          Optimizează-ți CV-ul pentru a trece de aceste sisteme și a obține un interviu.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Secțiunea de input */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="mb-4">
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Titlul jobului
              </label>
              <input
                id="jobTitle"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ex: Frontend Developer, Project Manager, etc."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Compania
              </label>
              <input
                id="company"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ex: Google, Microsoft, etc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Descrierea jobului
              </label>
              <textarea
                id="jobDescription"
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Copiază descrierea jobului de pe LinkedIn sau alte platforme..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                CV-ul tău va fi adaptat automat în funcție de cerințele jobului.
              </p>
            </div>
            
            {/* Scor de potrivire */}
            {matchScore && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Scor ATS detaliat</h3>
                
                {/* Scor total */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Scor total</span>
                    <span className="font-bold">{matchScore.total}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        matchScore.total > 70 ? 'bg-green-500' : 
                        matchScore.total > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${matchScore.total}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-2">
                    {matchScore.total > 70 ? 'Excelent! CV-ul tău are șanse mari să treacă de sistemele ATS.' :
                     matchScore.total > 40 ? 'Potrivire medie. Urmează sugestiile pentru a îmbunătăți scorul.' :
                     'Potrivire slabă. CV-ul tău are nevoie de optimizări semnificative.'}
                  </p>
                </div>
                
                {/* Scoruri detaliate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {/* Potrivire cuvinte cheie */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Potrivire cuvinte cheie</span>
                      <span className="text-sm font-bold">{matchScore.details.keywordMatch.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          matchScore.details.keywordMatch.score > 70 ? 'bg-green-500' : 
                          matchScore.details.keywordMatch.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${matchScore.details.keywordMatch.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Completitudine */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Completitudine CV</span>
                      <span className="text-sm font-bold">{matchScore.details.completeness.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          matchScore.details.completeness.score > 70 ? 'bg-green-500' : 
                          matchScore.details.completeness.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${matchScore.details.completeness.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Experiență de muncă */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Calitate experiență</span>
                      <span className="text-sm font-bold">{matchScore.details.workExperience.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          matchScore.details.workExperience.score > 70 ? 'bg-green-500' : 
                          matchScore.details.workExperience.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${matchScore.details.workExperience.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Abilități */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Relevanță abilități</span>
                      <span className="text-sm font-bold">{matchScore.details.skills.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          matchScore.details.skills.score > 70 ? 'bg-green-500' : 
                          matchScore.details.skills.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${matchScore.details.skills.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Cuvinte cheie */}
            {keywords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Cuvinte cheie identificate</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => {
                    const isInResume = JSON.stringify(resume).toLowerCase().includes(keyword);
                    return (
                      <span 
                        key={index} 
                        className={`px-3 py-1 text-sm rounded-full ${
                          isInResume 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {keyword}
                        {isInResume && (
                          <span className="ml-1 text-green-600">✓</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Sugestii AI */}
            {aiSuggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sugestii de optimizare</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Butoane de acțiune */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Înapoi la Dashboard
              </button>
              <button
                onClick={() => router.push('/profil')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Editează Profilul
              </button>
            </div>
          </div>
          
          {/* Previzualizare CV */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Previzualizare CV optimizat pentru ATS</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
              <CVPreviewThemed 
                resume={optimizedResume || resume} 
                highlightKeywords={keywords}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


