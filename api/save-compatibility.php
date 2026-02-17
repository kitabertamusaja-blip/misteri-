<?php
require_once 'db.php';

if (!$conn) sendError("Koneksi gagal");

$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->name1) || !isset($data->content)) {
    sendError("Data tidak lengkap", 400);
}

try {
    $n1 = $data->name1;
    $d1 = $data->dob1;
    $n2 = $data->name2;
    $d2 = $data->dob2;
    $score = $data->score;
    $content = json_encode($data->content);

    $query = "INSERT INTO compatibility_cache (name1, dob1, name2, dob2, score, content) 
              VALUES (:n1, :d1, :n2, :d2, :score, :content)
              ON DUPLICATE KEY UPDATE content = :content_upd, score = :score_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':n1' => $n1,
        ':d1' => $d1,
        ':n2' => $n2,
        ':d2' => $d2,
        ':score' => $score,
        ':content' => $content,
        ':content_upd' => $content,
        ':score_upd' => $score
    ]);

    echo json_encode(["status" => "success", "message" => "Compatibility data saved"]);

} catch(Exception $e) {
    sendError($e->getMessage());
}
?>