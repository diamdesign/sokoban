<?php
require("db.php");

header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: GET"); // Adjust allowed methods as needed
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Origin: *");

$response = array(); // Initialize the response array

try {
    if (isset($_GET['id']) || isset($_POST['id'])) {
        if (isset($_GET['id'])) {
            $level = $_GET['id'];
        } else {
            $level = $_POST['id'];
        }

        // Prepare SQL query to select maps for a specific level
        $stmt = $pdo->prepare("SELECT * FROM maps WHERE id = :id ORDER BY id ASC");
        $stmt->bindParam(':id', $level, PDO::PARAM_INT);
        $stmt->execute();
        $maps = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Iterate through each map and decode the mapdata field
        foreach ($maps as &$map) {
            $map['mapdata'] = json_decode($map['mapdata'], true);
        }

        $response['success'] = true;
        $response['maps'] = $maps;
    } else {
        // Prepare SQL query to select all maps
        $stmt = $pdo->prepare("SELECT * FROM maps ORDER BY id ASC");
        $stmt->execute();
        $maps = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Iterate through each map and decode the mapdata field
        foreach ($maps as &$map) {
            $map['mapdata'] = json_decode($map['mapdata'], true);
        }

        $response['success'] = true;
        $response['maps'] = $maps;
    }
} catch (PDOException $e) {
    $response['success'] = false;
    $response['error'] = "Database error: " . $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>
