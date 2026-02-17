<?php
/**
 * File: api/gemini-proxy.php
 * Deskripsi: Proxy untuk memanggil Gemini API secara aman dari server-side.
 */

// 1. Header untuk Keamanan & CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Konfigurasi API KEY (GANTI DENGAN KEY BARU ANDA)
// Jangan biarkan kosong. Dapatkan di https://aistudio.google.com/
$API_KEY = "AIzaSyCyu75E5KZvWtG4LFwrHGRKDEesryy0a4s"; // <-- GANTI DENGAN KEY BARU!

// 3. Tangkap Request dari Frontend
$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data || !isset($data['model']) || !isset($data['contents'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid Request Payload"]);
    exit();
}

$model = $data['model'];
$contents = $data['contents'];
$generationConfig = isset($data['config']) ? $data['config'] : [];

// 4. Bangun Payload untuk Google Gemini API
// Gemini API mengharapkan format tertentu
$geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$API_KEY}";

$payload = [
    "contents" => is_string($contents) ? [["parts" => [["text" => $contents]]]] : $contents,
    "generationConfig" => [
        "responseMimeType" => $generationConfig['responseMimeType'] ?? "text/plain",
        "temperature" => $generationConfig['temperature'] ?? 1.0,
        "topP" => $generationConfig['topP'] ?? 0.95,
        "topK" => $generationConfig['topK'] ?? 64,
        "maxOutputTokens" => $generationConfig['maxOutputTokens'] ?? 8192,
    ]
];

// Jika ada schema, masukkan ke payload
if (isset($generationConfig['responseSchema'])) {
    $payload['generationConfig']['responseSchema'] = $generationConfig['responseSchema'];
}

// 5. Eksekusi menggunakan CURL
$ch = curl_init($geminiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// 6. Kembalikan Hasil ke Frontend
if ($curlError) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "CURL Error: " . $curlError]);
} else if ($httpCode !== 200) {
    http_response_code($httpCode);
    $errData = json_decode($response, true);
    echo json_encode([
        "status" => "error", 
        "message" => "Gemini API Error (Code $httpCode)", 
        "details" => $errData
    ]);
} else {
    // Sukses
    $resData = json_decode($response, true);
    // Kita ekstrak teksnya agar frontend lebih mudah
    $textResult = "";
    if (isset($resData['candidates'][0]['content']['parts'][0]['text'])) {
        $textResult = $resData['candidates'][0]['content']['parts'][0]['text'];
    }
    
    echo json_encode([
        "status" => "success",
        "text" => $textResult,
        "raw" => $resData
    ]);
}
?>