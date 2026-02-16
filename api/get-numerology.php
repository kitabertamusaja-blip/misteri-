
<?php
/**
 * File: api/get-numerology.php
 * Mengambil ramalan numerologi dari cache DB berdasarkan tanggal lahir (DOB).
 */
require_once 'db.php';

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$dob = isset($_GET['dob']) ? $_GET['dob'] : '';

if (empty($dob)) {
    echo json_encode(["status" => "error", "message" => "Date of birth is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT content FROM numerology_cache WHERE dob = :dob LIMIT 1");
    $stmt->execute([':dob' => $dob]);
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
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
