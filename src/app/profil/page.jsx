"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveResumeToLocalStorage, getResumeFromLocalStorage } from '@/utils/localStorage';

export default function ProfilePage() {
  const router = useRouter();
  const [resume, setResume] = useState({
    name: '',
    role: '',
    professionalSummary: '',
    contact: {
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      github: ''
    },
    workExperience: [{ 
      role: '', 
      company: '', 
      startDate: '', 
      endDate: '', 
      description: '' 
    }],
    academicHistory: [{ 
      degree: '', 
      institution: '', 
      startDate: '', 
      endDate: '', 
      details: '' 
    }],
    certifications: [{ 
      name: '', 
      issuer: '', 
      date: '' 
    }],
    skills: [],
    languages: [{ 
      name: '', 
      level: '' 
    }],
    driverLicense: '',
    other: '',
    cvLanguage: 'ro'
  });

  // Încarcă datele din localStorage la încărcarea paginii
  useEffect(() => {
    const savedResume = getResumeFromLocalStorage();
    if (savedResume) {
      setResume(savedResume);
    }
  }, []);

  // Funcții pentru actualizarea câmpurilor
  const handleChange = (e, section, index, field) => {
    if (section) {
      if (Array.isArray(resume[section])) {
        const newArray = [...resume[section]];
        if (field) {
          newArray[index] = { ...newArray[index], [field]: e.target.value };
        } else {
          newArray[index] = e.target.value;
        }
        setResume({ ...resume, [section]: newArray });
      } else if (typeof resume[section] === 'object') {
        setResume({ 
          ...resume, 
          [section]: { 
            ...resume[section], 
            [field]: e.target.value 
          } 
        });
      }
    } else {
      setResume({ ...resume, [e.target.name]: e.target.value });
    }
  };

  // Adaugă un element nou într-un array
  const addItem = (section) => {
    const newItem = section === 'workExperience' 
      ? { role: '', company: '', startDate: '', endDate: '', description: '' }
      : section === 'academicHistory'
      ? { degree: '', institution: '', startDate: '', endDate: '', details: '' }
      : section === 'certifications'
      ? { name: '', issuer: '', date: '' }
      : section === 'languages'
      ? { name: '', level: '' }
      : '';

    setResume({
      ...resume,
      [section]: [...resume[section], newItem]
    });
  };

  // Șterge un element dintr-un array
  const removeItem = (section, index) => {
    const newArray = [...resume[section]];
    newArray.splice(index, 1);
    setResume({ ...resume, [section]: newArray });
  };

  // Gestionează skills (array de string-uri)
  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setResume({ ...resume, skills: skillsArray });
  };

  // Salvează profilul
  const saveProfile = () => {
    saveResumeToLocalStorage(resume);
    alert('Profilul a fost salvat cu succes!');
  };

  // Exportă profilul ca JSON
  const exportProfile = () => {
    const dataStr = JSON.stringify(resume, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'profil-cv.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Importă profilul din JSON
  const importProfile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedResume = JSON.parse(e.target.result);
        setResume(importedResume);
        saveResumeToLocalStorage(importedResume);
        alert('Profilul a fost importat cu succes!');
      } catch (error) {
        alert('Eroare la importarea profilului. Verificați formatul fișierului.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Profilul meu</h1>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-600">Date personale</h2>
            <div className="space-x-2">
              <button 
                onClick={saveProfile}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Salvează profil
              </button>
              <button 
                onClick={exportProfile}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Exportă JSON
              </button>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer">
                Importă JSON
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importProfile} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nume complet</label>
              <input
                type="text"
                name="name"
                value={resume.name}
                onChange={(e) => handleChange(e)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol profesional</label>
              <input
                type="text"
                name="role"
                value={resume.role}
                onChange={(e) => handleChange(e)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sumar profesional</label>
            <textarea
              name="professionalSummary"
              value={resume.professionalSummary}
              onChange={(e) => handleChange(e)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Limba CV-ului</label>
            <select
              name="cvLanguage"
              value={resume.cvLanguage}
              onChange={(e) => handleChange(e)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="ro">Română</option>
              <option value="en">Engleză</option>
              <option value="it">Italiană</option>
            </select>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Informații de contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={resume.contact.email}
                onChange={(e) => handleChange(e, 'contact', null, 'email')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="text"
                value={resume.contact.phone}
                onChange={(e) => handleChange(e, 'contact', null, 'phone')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locație</label>
              <input
                type="text"
                value={resume.contact.location}
                onChange={(e) => handleChange(e, 'contact', null, 'location')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                value={resume.contact.linkedin}
                onChange={(e) => handleChange(e, 'contact', null, 'linkedin')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={resume.contact.website}
                onChange={(e) => handleChange(e, 'contact', null, 'website')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              <input
                type="text"
                value={resume.contact.github}
                onChange={(e) => handleChange(e, 'contact', null, 'github')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Experiență profesională */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-600">Experiență profesională</h2>
            <button 
              onClick={() => addItem('workExperience')}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              + Adaugă experiență
            </button>
          </div>
          
          {resume.workExperience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Experiență #{index + 1}</h3>
                <button 
                  onClick={() => removeItem('workExperience', index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={resume.workExperience.length === 1}
                >
                  Șterge
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => handleChange(e, 'workExperience', index, 'role')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Companie</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleChange(e, 'workExperience', index, 'company')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data început</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => handleChange(e, 'workExperience', index, 'startDate')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ex: Ian 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data sfârșit</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => handleChange(e, 'workExperience', index, 'endDate')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ex: Prezent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleChange(e, 'workExperience', index, 'description')}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
          ))}
        </div>

        {/* Educație */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-600">Educație</h2>
            <button 
              onClick={() => addItem('academicHistory')}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              + Adaugă educație
            </button>
          </div>
          
          {resume.academicHistory.map((edu, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Educație #{index + 1}</h3>
                <button 
                  onClick={() => removeItem('academicHistory', index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={resume.academicHistory.length === 1}
                >
                  Șterge
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diplomă/Specializare</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleChange(e, 'academicHistory', index, 'degree')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instituție</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleChange(e, 'academicHistory', index, 'institution')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data început</label>
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => handleChange(e, 'academicHistory', index, 'startDate')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ex: 2016"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data absolvire</label>
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => handleChange(e, 'academicHistory', index, 'endDate')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ex: 2020"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalii</label>
                <textarea
                  value={edu.details}
                  onChange={(e) => handleChange(e, 'academicHistory', index, 'details')}
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
          ))}
        </div>

        {/* Certificări */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-600">Certificări</h2>
            <button 
              onClick={() => addItem('certifications')}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              + Adaugă certificare
            </button>
          </div>
          
          {resume.certifications.map((cert, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Certificare #{index + 1}</h3>
                <button 
                  onClick={() => removeItem('certifications', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Șterge
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nume certificare</label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleChange(e, 'certifications', index, 'name')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emitent</label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleChange(e, 'certifications', index, 'issuer')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleChange(e, 'certifications', index, 'date')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ex: 2022"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Abilități */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Abilități</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Abilități (separate prin virgulă)
            </label>
            <textarea
              value={resume.skills.join(', ')}
              onChange={handleSkillsChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="ex: JavaScript, React, Node.js, HTML, CSS"
            ></textarea>
          </div>
        </div>

        {/* Limbi străine */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-600">Limbi străine</h2>
            <button 
              onClick={() => addItem('languages')}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              + Adaugă limbă
            </button>
          </div>
          
          {resume.languages.map((lang, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Limbă #{index + 1}</h3>
                <button 
                  onClick={() => removeItem('languages', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Șterge
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limba</label>
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => handleChange(e, 'languages', index, 'name')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                  <input
                    type="text"
                    value={lang.level}
                    onChange={(e) => handleChange(e, 'languages', index, 'level')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ex: Avansat, B2, C1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permis de conducere */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Permis de conducere</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detalii permis</label>
            <input
              type="text"
              name="driverLicense"
              value={resume.driverLicense}
              onChange={(e) => handleChange(e)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="ex: Categoria B"
            />
          </div>
        </div>

        {/* Alte informații */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Alte informații</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Informații adiționale</label>
            <textarea
              name="other"
              value={resume.other}
              onChange={(e) => handleChange(e)}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Înapoi la Dashboard
          </button>
          <div>
            <button 
              onClick={saveProfile}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition mr-2"
            >
              Salvează profil
            </button>
            <button 
              onClick={() => router.push('/tailor')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Mergi la Adaptare CV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}