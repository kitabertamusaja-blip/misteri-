<?php
/**
 * File: api/get-tarot.php
 */
require_once 'db.php';

if (!$conn) sendError("Koneksi gagal");

$q = isset($_GET['q']) ? $_GET['q'] : '';
$card = isset($_GET['card']) ? $_GET['card'] : '';
$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

if (empty($card)) sendError("Nama kartu kosong", 400);

try {
    $stmt = $conn->prepare("SELECT content FROM tarot_cache WHERE question = :q AND card_name = :card AND date = :date LIMIT 1");
    $stmt->execute([':q' => $q, ':card' => $card, ':date' => $date]);
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