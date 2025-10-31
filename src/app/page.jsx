"use client";

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="py-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          Bun venit în CV Tailor
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Platforma inteligentă care îți adaptează CV-ul pentru a maximiza șansele de angajare
        </p>
        
        {/* Buton pentru profil */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => router.push('/profil')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Profilul Meu
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a href="/tailor" className="group block rounded-2xl p-8 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-100 text-indigo-600 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-indigo-700 mb-3">CV Personalizat</h2>
            <p className="text-gray-600 text-center mb-4">Adaptează-ți CV-ul în timp real folosind AI pentru a se potrivi perfect cu cerințele jobului.</p>
            <div className="flex justify-center">
              <span className="px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full group-hover:bg-indigo-200 transition-colors">
                Adaptare Live
              </span>
            </div>
          </a>
          
          <a href="/companies" className="group block rounded-2xl p-8 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-purple-100 text-purple-600 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-purple-700 mb-3">Companii</h2>
            <p className="text-gray-600 text-center mb-4">Gestionează eficient companiile, contactele și toate aplicațiile tale într-un singur loc.</p>
            <div className="flex justify-center">
              <span className="px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-full group-hover:bg-purple-200 transition-colors">
                CRM Aplicări
              </span>
            </div>
          </a>
          
          <a href="/calendar" className="group block rounded-2xl p-8 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 text-blue-600 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-blue-700 mb-3">Calendar</h2>
            <p className="text-gray-600 text-center mb-4">Vizualizează cronologic toate aplicațiile tale și monitorizează progresul candidaturilor.</p>
            <div className="flex justify-center">
              <span className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-full group-hover:bg-blue-200 transition-colors">
                Organizare
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}


