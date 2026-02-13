
// Menggunakan domain baru sesuai link yang diberikan user
const PROD_API_URL = 'https://www.misteri.faciltrix.com/api'; 

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
    // Kita tidak perlu menunggu response untuk UX yang lebih cepat, 
    // tapi kita log untuk memantau keberhasilan sinkronisasi di background.
    const result = await response.json();
    console.log("DB Sync Result:", result);
  } catch (error) {
    console.error("Database save failed:", error);
  }
};
