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
    SELECT h.*, 
           (h.days * 24 * 60 * 60 * 1000) + 
           (h.hours * 60 * 60 * 1000) + 
           (h.minutes * 60 * 1000) + 
           (h.seconds * 1000) + 
           h.milliseconds AS total_milliseconds
    FROM highscore h
    WHERE h.level = :level
    ORDER BY total_milliseconds ASC
    LIMIT 50
");

$stmt->bindParam(':level', $level, PDO::PARAM_INT);
$stmt->execute();

$highscores = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Format the time and milliseconds
foreach ($highscores as &$highscore) {
    $time = '';

    // Check if both seconds and preceding time components are zero
    $allZero = ($highscore['days'] == 0 && $highscore['hours'] == 0 && $highscore['minutes'] == 0 && $highscore['seconds'] == 0);

    if ($highscore['days'] > 0) {
        $time .= $highscore['days'] . ':';
    }
    if ($highscore['hours'] > 0 || $time !== '') {
        $time .= sprintf('%02d:', $highscore['hours']);
    }
    if ($highscore['minutes'] > 0 || $time !== '') {
        $time .= sprintf('%02d:', $highscore['minutes']);
    }
    if ($highscore['seconds'] > 0 || $time !== '' || $allZero) {
        $time .= sprintf('%02d:', $highscore['seconds']);
    }
     if ($allZero) {
        $time .= "0:";
    }

    $time .= sprintf('%03d', $highscore['milliseconds']);


    

    // Remove days, hours, minutes, and seconds if they are 0
    if ($highscore['days'] == 0 && $highscore['hours'] == 0 && $highscore['minutes'] == 0) {
        $time = ltrim($time, '0:');
         if ($highscore['seconds'] == 0) {
                $time = '0:' . $time;
         }

    }

    // Assign the formatted time back to the highscore
    $highscore['time'] = $time;
    // Remove unnecessary columns
    unset($highscore['days'], $highscore['hours'], $highscore['minutes'], $highscore['seconds'], $highscore['milliseconds'], $highscore['total_milliseconds']);
}


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
