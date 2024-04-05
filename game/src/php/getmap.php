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
        // Define pagination parameters
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1; // Get current page number from query parameter, default to page 1 if not provided
        $perPage = 20; // Number of maps per page

        // Calculate offset
        $offset = ($page - 1) * $perPage;

        // Prepare SQL query to select maps with pagination
        $stmt = $pdo->prepare("SELECT * FROM maps ORDER BY id ASC LIMIT :offset, :perPage");
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':perPage', $perPage, PDO::PARAM_INT);
        $stmt->execute();
        $maps = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($maps as &$map) {
            // Decode the "mapdata" field
            $decodedMapdata = json_decode($map['mapdata'], true);

            // Check if "solution" field exists inside "mapdata"
            if (isset($decodedMapdata['mapdata']['solution'])) {
                // Decode the "solution" field
                $decodedSolution = json_decode($decodedMapdata['mapdata']['solution'], true);
                // Replace the "solution" field with the decoded version inside "mapdata"
                $decodedMapdata['solution'] = $decodedSolution;
            }

            // Replace the original "mapdata" field with the decoded "mapdata" array
            $map['mapdata'] = $decodedMapdata;
        }

        $response = $maps;
    }
} catch (PDOException $e) {
    $response['success'] = false;
    $response['error'] = "Database error: " . $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>