
<?php
/**
 * File: api/save-zodiac.php
 * Menyimpan ramalan zodiak harian.
 */
require_once 'db.php';

if (!$conn) sendError("Koneksi gagal");

$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->nama) || !isset($data->content)) {
    sendError("Data tidak lengkap", 400);
}

try {
    $nama = $data->nama;
    $content = json_encode($data->content);
    $hari_ini = date('Y-m-d');

    // Kita asumsikan ada tabel 'zodiak_cache'
    // Struktur: id (INT PK), nama (VARCHAR 20), content (TEXT/JSON), tanggal (DATE)
    // Pastikan ada UNIQUE index pada (nama, tanggal)
    
    $query = "INSERT INTO zodiak_cache (nama, content, tanggal) 
              VALUES (:nama, :content, :tanggal)
              ON DUPLICATE KEY UPDATE content = :content_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':nama' => $nama,
        ':content' => $content,
        ':tanggal' => $hari_ini,
        ':content_upd' => $content
    ]);

    echo json_encode(["status" => "success", "message" => "Zodiac saved"]);

} catch(Exception $e) {
    sendError($e->getMessage());
}
?>
