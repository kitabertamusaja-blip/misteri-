
// Path relatif '/api' bekerja karena folder 'api' berada di dalam 'public_html'
// bersamaan dengan file index.html hasil build.
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost/misteri-api' // Sesuaikan jika Anda test lokal pakai XAMPP
  : '/api'; 

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
    await fetch(`${API_BASE_URL}/save-mimpi.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dreamData)
    });
  } catch (error) {
    console.error("Database save failed:", error);
  }
};
