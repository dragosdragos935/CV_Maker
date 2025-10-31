"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    country: "", 
    region: "", 
    county: "", 
    city: "", 
    street: "" 
  });
  const fileInputRef = useRef(null);
  const router = useRouter();

  const load = async () => {
    try {
      const res = await fetch("/api/companies");
      const json = await res.json();
      setCompanies(Array.isArray(json) ? json : []);
    } catch {
      setCompanies([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: "", country: "", region: "", county: "", city: "", street: "" });
    setAdding(false);
    setEditing(null);
  };

  const addCompany = async () => {
    if (!form.name.trim()) return;
    const newCompany = { 
      id: uuidv4(), 
      name: form.name.trim(), 
      address: { ...form, name: undefined }, 
      contacts: [], 
      resumes: [],
      applications: [] 
    };
    try {
      await fetch("/api/companies", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(newCompany) 
      });
      resetForm();
      await load();
    } catch {}
  };
  
  const editCompany = async () => {
    if (!form.name.trim() || !editing) return;
    const updatedCompany = {
      ...editing,
      name: form.name.trim(),
      address: { ...form, name: undefined }
    };
    try {
      await fetch(`/api/companies/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCompany)
      });
      resetForm();
      await load();
    } catch {}
  };
  
  const deleteCompany = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Ești sigur că vrei să ștergi această companie?")) return;
    
    try {
      await fetch(`/api/companies/${id}`, {
        method: "DELETE"
      });
      await load();
    } catch {}
  };
  
  const startEdit = (company, e) => {
    e.stopPropagation();
    setEditing(company);
    setForm({
      name: company.name,
      country: company.address?.country || "",
      region: company.address?.region || "",
      county: company.address?.county || "",
      city: company.address?.city || "",
      street: company.address?.street || ""
    });
    setAdding(true);
  };
  
  const exportCompanies = () => {
    const dataStr = JSON.stringify(companies, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `companies-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const importCompanies = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importedCompanies = JSON.parse(text);
      
      if (!Array.isArray(importedCompanies)) {
        alert("Formatul fișierului nu este valid. Trebuie să fie un array de companii.");
        return;
      }
      
      for (const company of importedCompanies) {
        if (!company.id) company.id = uuidv4();
        await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(company)
        });
      }
      
      await load();
      alert(`${importedCompanies.length} companii au fost importate cu succes.`);
    } catch (error) {
      alert("Eroare la importarea companiilor: " + error.message);
    }
    
    e.target.value = null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 md:mb-0 text-center md:text-left bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Companiile mele
          </h1>
          <div className="flex flex-wrap gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={importCompanies}
              accept=".json"
              className="hidden"
            />
            <button 
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
              onClick={() => fileInputRef.current.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import
            </button>
            <button 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
              onClick={exportCompanies}
              disabled={companies.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v8a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Export
            </button>
            <button 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
              onClick={() => setAdding((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Adaugă companie
            </button>
          </div>
        </div>

        {adding && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 transition-all">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editing ? `Editează compania: ${editing.name}` : "Adaugă o companie nouă"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nume companie</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="ex: Google, Microsoft, etc." 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Țară</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="ex: România, Italia, etc." 
                  value={form.country} 
                  onChange={(e) => setForm({ ...form, country: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regiune</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="ex: Transilvania, Lombardia, etc." 
                  value={form.region} 
                  onChange={(e) => setForm({ ...form, region: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Județ/Provincie</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="ex: Cluj, Milano, etc." 
                  value={form.county} 
                  onChange={(e) => setForm({ ...form, county: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oraș</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="ex: Cluj-Napoca, Milano, etc." 
                  value={form.city} 
                  onChange={(e) => setForm({ ...form, city: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresă</label>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="ex: Strada Exemplu, nr. 123" 
                  value={form.street} 
                  onChange={(e) => setForm({ ...form, street: e.target.value })} 
                />
              </div>
              <div className="col-span-3 mt-4 flex justify-end gap-3">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  onClick={resetForm}
                >
                  Anulează
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                  onClick={editing ? editCompany : addCompany}
                >
                  {editing ? "Actualizează compania" : "Salvează compania"}
                </button>
              </div>
            </div>
          </div>
        )}

        {companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nu există companii</h2>
            <p className="text-gray-600 mb-4">Adaugă prima companie pentru a începe să-ți organizezi aplicațiile.</p>
            <button 
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all"
              onClick={() => setAdding(true)}
            >
              Adaugă prima companie
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all relative"
              >
                <div className="h-3 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{company.name}</h3>
                    <div className="flex gap-2">
                      <button 
                        className="p-1.5 bg-amber-100 text-amber-600 rounded-md hover:bg-amber-200 transition-all"
                        onClick={(e) => startEdit(company, e)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-all"
                        onClick={(e) => deleteCompany(company.id, e)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {(company.address?.country || company.address?.city) ? (
                      <span className="text-sm">
                        {[
                          company.address?.city,
                          company.address?.county,
                          company.address?.region,
                          company.address?.country
                        ].filter(Boolean).join(', ')}
                      </span>
                    ) : (
                      <span className="text-sm italic">Adresă necompletată</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Contacte</div>
                        <div className="font-medium">{company.contacts?.length || 0}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CV-uri</div>
                        <div className="font-medium">{company.resumes?.length || 0}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Aplicări</div>
                        <div className="font-medium">{company.applications?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                    onClick={() => router.push(`/company/${company.id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Vezi detalii
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


