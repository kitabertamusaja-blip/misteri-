<?php
/**
 * File: api/save-tarot.php
 */
require_once 'db.php';

if (!$conn) sendError("Koneksi gagal");

$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->card_name) || !isset($data->content)) {
    sendError("Data tidak lengkap", 400);
}

try {
    $question = isset($data->question) ? $data->question : '';
    $card_name = $data->card_name;
    $content = json_encode($data->content);
    $date = isset($data->date) ? $data->date : date('Y-m-d');

    $query = "INSERT INTO tarot_cache (question, card_name, content, date) 
              VALUES (:q, :card, :content, :date)
              ON DUPLICATE KEY UPDATE content = :content_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':q' => $question,
        ':card' => $card_name,
        ':content' => $content,
        ':date' => $date,
        ':content_upd' => $content
    ]);

    echo json_encode(["status" => "success", "message" => "Tarot reading saved"]);

} catch(Exception $e) {
    sendError($e->getMessage());
}
?>