<?php
require("db.php");

$response = array();

// Set appropriate CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Fetch-Request"); // Allow X-Fetch-Request header

if(isset($_GET['level']) || isset($_POST['level'])) {
    if(isset($_GET['level'])) {
        $level = $_GET['level'];
    } else {
        $level = $_POST['level'];
    }

    try {
        // Prepare SQL query to select the 10 best high scores
        $stmt = $pdo->prepare("
            SELECT h.*
            FROM highscore h
            INNER JOIN (
                SELECT alias, MIN(steps) AS min_steps, MIN(time) AS min_time
                FROM highscore
                WHERE level = :sub_level
                GROUP BY alias
            ) AS t ON h.alias = t.alias AND h.steps = t.min_steps AND h.time = t.min_time
            WHERE h.level = :main_level
            GROUP BY h.alias, h.steps, h.time
            ORDER BY h.steps ASC, h.time ASC
            LIMIT 10
        ");

        // Bind the level parameter
        $stmt->bindParam(':main_level', $level, PDO::PARAM_INT);
        $stmt->bindParam(':sub_level', $level, PDO::PARAM_INT);

        // Execute the query
        $stmt->execute();

        // Fetch the results
        $highscores = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response['success'] = true;
        $response['highscores'] = $highscores;
    } catch (PDOException $e) {
        // If an error occurs, set error message in response
        $response['success'] = false;
        $response['message'] = "Error: " . $e->getMessage();
    }
} else {
    // If no level specified, set error message in response
    $response['success'] = false;
    $response['message'] = "Error: No level specified";
}

header('Content-Type: application/json');
// Encode the response array as JSON and output it
echo json_encode($response);
?>
