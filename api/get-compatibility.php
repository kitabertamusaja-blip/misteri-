<?php
require_once 'db.php';

if (!$conn) sendError("Koneksi gagal");

$n1 = isset($_GET['n1']) ? $_GET['n1'] : '';
$d1 = isset($_GET['d1']) ? $_GET['d1'] : '';
$n2 = isset($_GET['n2']) ? $_GET['n2'] : '';
$d2 = isset($_GET['d2']) ? $_GET['d2'] : '';

if (empty($n1) || empty($d1) || empty($n2) || empty($d2)) sendError("Parameter tidak lengkap", 400);

try {
    $stmt = $conn->prepare("SELECT content FROM compatibility_cache WHERE dob1 = :d1 AND dob2 = :d2 AND name1 = :n1 AND name2 = :n2 LIMIT 1");
    $stmt->execute([':n1' => $n1, ':d1' => $d1, ':n2' => $n2, ':d2' => $d2]);
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