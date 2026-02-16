
<?php
/**
 * File: api/get-zodiac.php
 * Mengambil ramalan zodiak harian dari cache DB.
 */
require_once 'db.php';

if (!$conn) sendError("Koneksi gagal");

$nama = isset($_GET['nama']) ? $_GET['nama'] : '';
$hari_ini = date('Y-m-d');

if (empty($nama)) sendError("Nama zodiak kosong", 400);

try {
    $stmt = $conn->prepare("SELECT content FROM zodiak_cache WHERE nama = :nama AND tanggal = :tanggal LIMIT 1");
    $stmt->execute([':nama' => $nama, ':tanggal' => $hari_ini]);
    $row = $stmt->fetch();

    if ($row) {
        echo json_encode([
            "status" => "success",
            "data" => json_decode($row['content'])
        ]);
    } else {
        echo json_encode(["status" => "not_found"]);
    }

} catch(Exception $e) {
    sendError($e->getMessage());
}
?>
