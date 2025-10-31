"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import ResumeForm from "@/components/ResumeForm";
import CVPreviewThemed from "@/components/CVPreviewThemed";
import ThemeSelector from "@/components/ThemeSelector";
import { useResumeStore } from "@/store/useResumeStore";
import { adaptResumeToJob, computeMatchScore } from "@/utils/ai";
import { exportResumeAsDOCX, exportResumeAsPDF } from "@/utils/export";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({ name: "", position: "", phone: "", email: "", linkedin: "", other: "" });
  const [address, setAddress] = useState({ country: "", region: "", county: "", city: "", street: "" });
  const [application, setApplication] = useState({ 
    position: "", 
    date: new Date().toISOString().split('T')[0], 
    time: new Date().toTimeString().slice(0, 5),
    status: "applied",
    notes: "" 
  });
  const [activeTab, setActiveTab] = useState("overview");
  const previewRef = useRef(null);
  const [score, setScore] = useState(0);
  const [live, setLive] = useState(true);
  const [theme, setTheme] = useState("italy");
  const { resume, setField } = useResumeStore();

  const load = async () => {
    try {
      const res = await fetch("/api/companies");
      const json = await res.json();
      const found = (json || []).find((c) => c.id === companyId);
      setCompany(found || null);
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [companyId]);

  useEffect(() => {
    setScore(computeMatchScore(resume));
  }, [resume.jobTitle, resume.jobDescription, resume.professionalSummary, resume.skills, resume.workExperience]);

  useEffect(() => {
    if (!live) return;
    let active = true;
    const t = setTimeout(async () => {
      if (!active) return;
      await handleAdapt();
    }, 600);
    return () => { active = false; clearTimeout(t); };
  }, [live, resume.jobTitle, resume.jobDescription, resume.cvLanguage, resume.professionalSummary, resume.skills]);

  useEffect(() => {
    if (company) {
      setField("company", company.name);
      setAddress({
        country: company?.address?.country || "",
        region: company?.address?.region || "",
        county: company?.address?.county || "",
        city: company?.address?.city || "",
        street: company?.address?.street || "",
      });
    }
  }, [company]);

  const saveCompany = async (next) => {
    await fetch("/api/companies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    await load();
  };

  const addContact = async () => {
    if (!contact.name.trim()) return;
    const next = {
      ...company,
      contacts: [...(company.contacts || []), { id: uuidv4(), ...contact }],
    };
    await saveCompany(next);
    setContact({ name: "", position: "", phone: "", email: "", linkedin: "", other: "" });
  };

  const addApplication = async () => {
    if (!application.position.trim()) return;
    const applicationData = {
      id: uuidv4(),
      ...application,
      createdAt: new Date().toISOString(),
      resumeData: resume
    };
    
    const next = {
      ...company,
      applications: [...(company.applications || []), applicationData],
    };
    await saveCompany(next);
    setApplication({ 
      position: "", 
      date: new Date().toISOString().split('T')[0], 
      time: new Date().toTimeString().slice(0, 5),
      status: "applied",
      notes: "" 
    });
  };

  const saveAddress = async () => {
    const next = { ...company, address: { ...address } };
    await saveCompany(next);
  };

  const handleAdapt = async () => {
    const adapted = await adaptResumeToJob(resume, {
      targetLanguage: resume.cvLanguage,
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    setField("professionalSummary", adapted.professionalSummary);
    setField("workExperience", adapted.workExperience || []);
    setField("skills", adapted.skills || []);
    setField("cvLanguage", adapted.cvLanguage);
    setField("other", adapted.other || "");
  };

  const sendResumeToContact = async (targetContact) => {
    const resumeRecord = { id: uuidv4(), createdAt: new Date().toISOString(), data: resume, to: targetContact };
    const next = { ...company, resumes: [resumeRecord, ...(company.resumes || [])] };
    await saveCompany(next);
    alert("CV salvat pentru acest contact.");
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    await exportResumeAsPDF(previewRef.current, `${resume.name}-${company?.name || "company"}.pdf`);
  };

  const downloadDOCX = async () => {
    await exportResumeAsDOCX(resume, `${resume.name}-${company?.name || "company"}.docx`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "applied": return "bg-blue-100 text-blue-800";
      case "interview": return "bg-purple-100 text-purple-800";
      case "offer": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "applied": return "Aplicat";
      case "interview": return "Interviu";
      case "offer": return "Ofertă";
      case "rejected": return "Respins";
      default: return "Necunoscut";
    }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (!company) return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Compania nu a fost găsită</h2>
        <p className="text-gray-600 mb-4">Nu am putut găsi compania cu ID-ul specificat.</p>
        <button 
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all"
          onClick={() => router.push("/companies")}
        >
          Înapoi la lista de companii
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            onClick={() => router.push("/companies")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Înapoi la lista de companii
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="h-3 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{company.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {(company.address?.country || company.address?.city) ? (
                <span>
                  {[
                    company.address?.street,
                    company.address?.city,
                    company.address?.county,
                    company.address?.region,
                    company.address?.country
                  ].filter(Boolean).join(', ')}
                </span>
              ) : (
                <span className="italic">Adresă necompletată</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contacte</div>
                  <div className="font-medium">{company.contacts?.length || 0}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">CV-uri trimise</div>
                  <div className="font-medium">{company.resumes?.length || 0}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Aplicări</div>
                  <div className="font-medium">{company.applications?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Prezentare generală
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'contacts' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('contacts')}
            >
              Contacte
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'applications' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('applications')}
            >
              Aplicări
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'cv' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('cv')}
            >
              CV-uri trimise
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Adresă companie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Țară</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder="ex: România, Italia, etc." 
                      value={address.country} 
                      onChange={(e) => setAddress({ ...address, country: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regiune</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder="ex: Transilvania, Lombardia, etc." 
                      value={address.region} 
                      onChange={(e) => setAddress({ ...address, region: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Județ/Provincie</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder="ex: Cluj, Milano, etc." 
                      value={address.county} 
                      onChange={(e) => setAddress({ ...address, county: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oraș</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder="ex: Cluj-Napoca, Milano, etc." 
                      value={address.city} 
                      onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresă</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder="ex: Strada Exemplu, nr. 123" 
                      value={address.street} 
                      onChange={(e) => setAddress({ ...address, street: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                    onClick={saveAddress}
                  >
                    Salvează adresa
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistici aplicări</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 mb-1">Total aplicări</div>
                    <div className="text-2xl font-bold text-blue-800">{company.applications?.length || 0}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 mb-1">Interviuri</div>
                    <div className="text-2xl font-bold text-green-800">
                      {company.applications?.filter(a => a.status === 'interview').length || 0}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Ultimele aplicări:
                </div>
                <ul className="mt-2 space-y-2">
                  {(company.applications || []).slice(0, 3).map(app => (
                    <li key={app.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{app.position}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(app.date + 'T' + app.time).toLocaleString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                {(company.applications || []).length > 3 && (
                  <div className="mt-3 text-center">
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      onClick={() => setActiveTab('applications')}
                    >
                      Vezi toate aplicările
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">CV pentru {company.name}</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadPDF} 
                    className="px-3 py-2 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:opacity-90 transition flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF
                  </button>
                  <button 
                    onClick={downloadDOCX} 
                    className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    DOCX
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-700">Scor potrivire: </div>
                  <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                    score >= 75 ? 'bg-green-100 text-green-800' : 
                    score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {score}/100
                  </div>
                </div>
                <ThemeSelector value={theme} onChange={setTheme} />
              </div>
              
              <div className="flex items-center mb-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                    checked={live} 
                    onChange={(e) => setLive(e.target.checked)} 
                  /> 
                  Adaptare live
                </label>
                <button 
                  className="ml-4 text-sm text-indigo-600 hover:text-indigo-800"
                  onClick={handleAdapt}
                >
                  Adaptează manual
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '60vh' }} ref={previewRef}>
                <CVPreviewThemed resume={resume} theme={theme} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Persoane de contact</h2>
                {(company.contacts || []).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Nu există contacte</h3>
                    <p className="text-gray-600">Adaugă primul contact pentru această companie.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(company.contacts || []).map((p) => (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">{p.name}</div>
                            {p.position && <div className="text-sm text-gray-600 mb-2">{p.position}</div>}
                          </div>
                          <button 
                            onClick={() => sendResumeToContact(p)} 
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition"
                          >
                            Trimite CV
                          </button>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          {p.phone && (
                            <div className="flex items-center text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${p.phone}`} className="text-gray-700 hover:text-indigo-600">{p.phone}</a>
                            </div>
                          )}
                          
                          {p.email && (
                            <div className="flex items-center text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${p.email}`} className="text-gray-700 hover:text-indigo-600">{p.email}</a>
                            </div>
                          )}
                          
                          {p.linkedin && (
                            <div className="flex items-center text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                              <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-indigo-600">
                                Profil LinkedIn
                              </a>
                            </div>
                          )}
                          
                          {p.other && (
                            <div className="text-sm text-gray-600 mt-2">{p.other}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Adaugă contact nou</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nume și prenume</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: John Doe" 
                    value={contact.name} 
                    onChange={(e) => setContact({ ...contact, name: e.target.value })} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poziție / Rol</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: HR Manager" 
                    value={contact.position} 
                    onChange={(e) => setContact({ ...contact, position: e.target.value })} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: +40 712 345 678" 
                    value={contact.phone} 
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: john.doe@company.com" 
                    value={contact.email} 
                    onChange={(e) => setContact({ ...contact, email: e.target.value })} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: https://linkedin.com/in/johndoe" 
                    value={contact.linkedin} 
                    onChange={(e) => setContact({ ...contact, linkedin: e.target.value })} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alte detalii</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: Întâlnit la târgul de cariere..." 
                    rows={3}
                    value={contact.other} 
                    onChange={(e) => setContact({ ...contact, other: e.target.value })} 
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                    onClick={addContact}
                  >
                    Adaugă contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Istoricul aplicărilor</h2>
                {(company.applications || []).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Nu există aplicări</h3>
                    <p className="text-gray-600">Adaugă prima aplicare pentru această companie.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(company.applications || []).map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">{app.position}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(app.date + 'T' + app.time).toLocaleString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                            {getStatusText(app.status)}
                          </span>
                        </div>
                        
                        {app.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                            {app.notes}
                          </div>
                        )}
                        
                        <div className="mt-3 flex justify-end">
                          <button 
                            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 transition"
                            onClick={() => {
                              // Implementare pentru vizualizarea CV-ului trimis
                              if (app.resumeData) {
                                setField("name", app.resumeData.name || "");
                                setField("email", app.resumeData.email || "");
                                setField("phone", app.resumeData.phone || "");
                                setField("address", app.resumeData.address || "");
                                setField("professionalSummary", app.resumeData.professionalSummary || "");
                                setField("skills", app.resumeData.skills || []);
                                setField("workExperience", app.resumeData.workExperience || []);
                                setField("education", app.resumeData.education || []);
                                setField("languages", app.resumeData.languages || []);
                                setField("projects", app.resumeData.projects || []);
                                setField("certifications", app.resumeData.certifications || []);
                                setField("interests", app.resumeData.interests || []);
                                setField("references", app.resumeData.references || []);
                                setActiveTab('cv');
                              }
                            }}
                          >
                            Vezi CV-ul trimis
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Adaugă aplicare nouă</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poziție</label>
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: Frontend Developer" 
                    value={application.position} 
                    onChange={(e) => setApplication({ ...application, position: e.target.value })} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input 
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      value={application.date} 
                      onChange={(e) => setApplication({ ...application, date: e.target.value })} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
                    <input 
                      type="time"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      value={application.time} 
                      onChange={(e) => setApplication({ ...application, time: e.target.value })} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    value={application.status} 
                    onChange={(e) => setApplication({ ...application, status: e.target.value })} 
                  >
                    <option value="applied">Aplicat</option>
                    <option value="interview">Interviu</option>
                    <option value="offer">Ofertă</option>
                    <option value="rejected">Respins</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="ex: Am aplicat prin platforma LinkedIn..." 
                    rows={4}
                    value={application.notes} 
                    onChange={(e) => setApplication({ ...application, notes: e.target.value })} 
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                    onClick={addApplication}
                  >
                    Salvează aplicarea
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'cv' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">CV-uri trimise</h2>
                {(company.resumes || []).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Nu există CV-uri</h3>
                    <p className="text-gray-600">Trimite un CV către un contact pentru a-l vedea aici.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(company.resumes || []).map((r) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">
                              {r?.data?.name || 'CV fără nume'}
                            </div>
                            <div className="text-xs text-gray-600">
                              Către: {r?.to?.name || 'Necunoscut'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(r.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <button 
                            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 transition"
                            onClick={() => {
                              // Implementare pentru vizualizarea CV-ului
                              if (r.data) {
                                setField("name", r.data.name || "");
                                setField("email", r.data.email || "");
                                setField("phone", r.data.phone || "");
                                setField("address", r.data.address || "");
                                setField("professionalSummary", r.data.professionalSummary || "");
                                setField("skills", r.data.skills || []);
                                setField("workExperience", r.data.workExperience || []);
                                setField("education", r.data.education || []);
                                setField("languages", r.data.languages || []);
                                setField("projects", r.data.projects || []);
                                setField("certifications", r.data.certifications || []);
                                setField("interests", r.data.interests || []);
                                setField("references", r.data.references || []);
                              }
                            }}
                          >
                            Vizualizează
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Previzualizare CV</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={downloadPDF} 
                      className="px-3 py-2 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:opacity-90 transition flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </button>
                    <button 
                      onClick={downloadDOCX} 
                      className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      DOCX
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end mb-3">
                  <ThemeSelector value={theme} onChange={setTheme} />
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '70vh' }} ref={previewRef}>
                  <CVPreviewThemed resume={resume} theme={theme} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



