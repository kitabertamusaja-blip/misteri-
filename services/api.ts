
// GANTI URL DI BAWAH INI dengan domain asli Anda (misal: https://misteriplus.com/api)
// Agar meskipun dijalankan dari preview, ia tetap bisa mengakses PHP di hosting Anda.
const PROD_API_URL = 'https://misteri.fachrudin.web.id/api'; 

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost/misteri-api' 
  : PROD_API_URL; 

export const fetchMimpiFromDB = async (query: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Database connectivity issue:", error);
    return [];
  }
};

export const saveMimpiToDB = async (dreamData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-mimpi.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dreamData)
    });
    const result = await response.json();
    console.log("DB Sync Result:", result);
  } catch (error) {
    console.error("Database save failed:", error);
  }
};
