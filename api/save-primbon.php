
<?php
/**
 * File: api/save-primbon.php
 * Menyimpan hasil ramalan Primbon Jawa (Weton) ke DB.
 */
require_once 'db.php';

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->dob) || !isset($data->content)) {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
    exit;
}

try {
    $dob = $data->dob;
    $weton = $data->weton;
    $neptu = $data->neptu;
    $content = json_encode($data->content);

    $query = "INSERT INTO primbon_cache (dob, weton, neptu, content) 
              VALUES (:dob, :weton, :neptu, :content)
              ON DUPLICATE KEY UPDATE content = :content_upd, weton = :weton_upd, neptu = :neptu_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':dob' => $dob,
        ':weton' => $weton,
        ':neptu' => $neptu,
        ':content' => $content,
        ':content_upd' => $content,
        ':weton_upd' => $weton,
        ':neptu_upd' => $neptu
    ]);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Primbon data saved"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save data"]);
    }

} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
