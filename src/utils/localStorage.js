// Funcții pentru gestionarea datelor din localStorage

// Salvează CV-ul în localStorage
export const saveResumeToLocalStorage = (resume) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userResume', JSON.stringify(resume));
  }
};

// Obține CV-ul din localStorage
export const getResumeFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const savedResume = localStorage.getItem('userResume');
    return savedResume ? JSON.parse(savedResume) : null;
  }
  return null;
};

// Șterge CV-ul din localStorage
export const removeResumeFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userResume');
  }
};