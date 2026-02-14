
// Gunakan URL absolut untuk memastikan konsistensi
const PROD_API_URL = 'https://www.misteri.faciltrix.com/api'; 

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost/misteri-api' 
  : PROD_API_URL; 

export const fetchMimpiFromDB = async (query: string) => {
  try {
    const url = `${API_BASE_URL}/search.php?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        console.warn(`DB Search returned status: ${response.status}`);
        return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Database search network error:", error);
    return [];
  }
};

export const saveMimpiToDB = async (dreamData: any) => {
  const url = `${API_BASE_URL}/save-mimpi.php`;
  try {
    console.log("Syncing with DB:", url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dreamData)
    });
    
    // Gunakan response.json() langsung jika yakin formatnya JSON
    const result = await response.json();
    if (result.status === "success") {
        console.log("✅ DB Sync Success:", result.message);
    } else {
        console.error("❌ DB Sync API Error:", result.message || result);
    }
  } catch (error) {
    console.error("❌ Network error during DB save (Failed to Fetch):", error);
    console.log("Tips: Jika error berlanjut, cek apakah domain faciltrix.com memblokir request dari domain luar via firewall/ModSecurity.");
  }
};
