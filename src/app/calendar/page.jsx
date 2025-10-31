"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const [companies, setCompanies] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
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

  useEffect(() => { load(); }, []);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();

  // Extrage toate aplicările din toate companiile
  const getAllApplications = () => {
    const applications = [];
    companies.forEach(company => {
      if (Array.isArray(company.applications)) {
        company.applications.forEach(app => {
          applications.push({
            ...app,
            companyId: company.id,
            companyName: company.name
          });
        });
      }
    });
    return applications;
  };

  // Filtrează aplicările în funcție de compania selectată
  const getFilteredApplications = () => {
    const allApplications = getAllApplications();
    if (selectedCompany === "all") {
      return allApplications;
    }
    return allApplications.filter(app => app.companyId === selectedCompany);
  };

  // Grupează aplicările pe zile pentru luna și anul curent
  const applicationsByDay = () => {
    const map = new Map();
    const applications = getFilteredApplications();
    
    applications.forEach(app => {
      const d = new Date(app.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        const list = map.get(key) || [];
        list.push(app);
        map.set(key, list);
      }
    });
    
    return map;
  };

  const byDay = applicationsByDay();
  const totalDays = daysInMonth(year, month);
  const offset = (firstWeekday(year, month) + 6) % 7; // make Monday=0

  const prevMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };
  
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() + 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };

  const goToToday = () => {
    setMonth(new Date().getMonth());
    setYear(new Date().getFullYear());
  };

  const goToCompany = (companyId) => {
    router.push(`/company/${companyId}`);
  };

  // Obține culoarea în funcție de status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'în așteptare':
        return 'bg-yellow-100 text-yellow-800';
      case 'acceptat':
        return 'bg-green-100 text-green-800';
      case 'respins':
        return 'bg-red-100 text-red-800';
      case 'interviu':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 md:mb-0 text-center md:text-left bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Calendar aplicări
          </h1>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="all">Toate companiile</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                onClick={prevMonth}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all"
                onClick={goToToday}
              >
                Astăzi
              </button>
              
              <button 
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                onClick={nextMonth}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center text-xl font-semibold">
            {new Date(year, month).toLocaleString('ro-RO', { month: 'long', year: 'numeric' })}
          </div>
          
          <div className="grid grid-cols-7 bg-indigo-50">
            {["Lu","Ma","Mi","Jo","Vi","Sâ","Du"].map((d, index) => (
              <div key={index} className="p-2 text-center font-medium text-indigo-800">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[100px] bg-gray-50 border border-gray-100" />
            ))}
            
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const items = byDay.get(day) || [];
              return (
                <div 
                  key={day} 
                  className={`min-h-[100px] border border-gray-100 p-2 ${items.length ? 'bg-indigo-50' : 'bg-white'}`}
                >
                  <div className={`text-right font-medium ${
                    items.length ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                    {day}
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((app, idx) => (
                      <div 
                        key={idx}
                        className={`p-1 rounded text-xs cursor-pointer hover:bg-opacity-80 transition-all ${getStatusColor(app.status)}`}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <div className="font-medium truncate">{app.companyName}</div>
                        <div className="text-xs opacity-75">{new Date(app.date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-xs text-indigo-600 font-medium">
                        +{items.length - 3} altele
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {selectedApplication && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Detalii aplicare</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedApplication(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Companie</div>
                  <div className="font-medium text-lg">{selectedApplication.companyName}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Data și ora</div>
                  <div className="font-medium">
                    {new Date(selectedApplication.date).toLocaleDateString('ro-RO')} la {new Date(selectedApplication.date).toLocaleTimeString('ro-RO')}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status || 'Nedefinit'}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Țară</div>
                  <div className="font-medium">{selectedApplication.country || '-'}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Regiune</div>
                  <div className="font-medium">{selectedApplication.region || '-'}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Note</div>
                  <div className="font-medium">{selectedApplication.notes || '-'}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                onClick={() => goToCompany(selectedApplication.companyId)}
              >
                Vezi detalii companie
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Toate aplicările</h2>
          </div>
          
          {getFilteredApplications().length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nu există aplicări</h3>
              <p className="text-gray-600">Adaugă aplicări din paginile companiilor pentru a le vedea aici.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Companie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Țară</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regiune</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredApplications()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((app, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(app.date).toLocaleDateString('ro-RO')}</div>
                          <div className="text-sm text-gray-500">{new Date(app.date).toLocaleTimeString('ro-RO')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.companyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                            {app.status || 'Nedefinit'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.country || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.region || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 font-medium mr-3"
                            onClick={() => setSelectedApplication(app)}
                          >
                            Detalii
                          </button>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                            onClick={() => goToCompany(app.companyId)}
                          >
                            Companie
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}