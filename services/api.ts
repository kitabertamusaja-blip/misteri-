
// Gunakan URL absolut untuk memastikan konsistensi
const PROD_API_URL = 'https://www.misteri.faciltrix.com/api'; 

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost/misteri-api' 
  : PROD_API_URL; 

export const fetchMimpiFromDB = async (query: string) => {
  try {
    const url = `${API_BASE_URL}/search.php?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) return [];
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
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dreamData)
    });
    
    const text = await response.text();
    try {
        const result = JSON.parse(text);
        if (result.status === "success") {
            console.log("✅ DB Sync Success:", result.message);
        } else {
            console.error("❌ DB Sync API Error:", result.message);
        }
    } catch (e) {
        console.error("❌ DB Sync Response bukan JSON:", text);
    }
  } catch (error) {
    console.error("❌ Network error during DB save (Failed to Fetch):", error);
    console.log("Tips: Pastikan SSL di domain faciltrix.com aktif dan tidak ada blokir firewall di hosting.");
  }
};
