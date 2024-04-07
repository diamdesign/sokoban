<?php
require("db.php");

$response = array();

// Set appropriate CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Fetch-Request"); // Allow X-Fetch-Request header

// Get the JSON data from the request body
$requestBody = file_get_contents('php://input');



if(empty($requestBody)) {
    // If the request body is empty, send a forbidden response
    $response['success'] = false;
    $response['message'] = "Forbidden: Empty request body";
    echo json_encode($response);
    exit;
}

    // Decode the JSON data
    $data = json_decode($requestBody, true);

    // Extract data from the JSON
    $level = (int)$data['level'];
    $alias = $data['alias'];

    $steps = (int)$data['steps'];

    $time = $data['time'];
    $days = $data['time']['days'];
    $hours = $data['time']['hours'];
    $minutes = $data['time']['minutes'];
    $seconds = $data['time']['seconds'];
    $milliseconds = $data['time']['milliseconds'];
    


function compareTimes($newTime, $existingTime) {
    $newDays = (int)$newTime['days'];
    $newHours = (int)$newTime['hours'];
    $newMinutes = (int)$newTime['minutes'];
    $newSeconds = (int)$newTime['seconds'];
    $newMilliseconds = (int)$newTime['milliseconds'];

    $existingDays = (int)$existingTime['days'];
    $existingHours = (int)$existingTime['hours'];
    $existingMinutes = (int)$existingTime['minutes'];
    $existingSeconds = (int)$existingTime['seconds'];
    $existingMilliseconds = (int)$existingTime['milliseconds'];

    // Convert all time components to milliseconds for comparison
    $newTotalMilliseconds = $newDays * 24 * 60 * 60 * 1000 +
                             $newHours * 60 * 60 * 1000 +
                             $newMinutes * 60 * 1000 +
                             $newSeconds * 1000 +
                             $newMilliseconds;

    $existingTotalMilliseconds = $existingDays * 24 * 60 * 60 * 1000 +
                                 $existingHours * 60 * 60 * 1000 +
                                 $existingMinutes * 60 * 1000 +
                                 $existingSeconds * 1000 +
                                 $existingMilliseconds;

    return $newTotalMilliseconds < $existingTotalMilliseconds;
}


    try {
// Check if a record exists for the provided alias on the specified level
$existingStmt = $pdo->prepare("SELECT steps, days, hours, minutes, seconds, milliseconds FROM highscore WHERE BINARY alias = :alias AND level = :level");
$existingStmt->bindParam(':level', $level, PDO::PARAM_INT);
$existingStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
$existingStmt->execute();
$existingScore = $existingStmt->fetch(PDO::FETCH_ASSOC);

if (!$existingScore) {
    // If no existing record, insert the new score

    // Insert the new high score
    $insertStmt = $pdo->prepare("INSERT INTO highscore (level, alias, steps, days, hours, minutes, seconds, milliseconds) VALUES (:level, :alias, :steps, :days, :hours, :minutes, :seconds, :milliseconds)");
    $insertStmt->bindParam(':level', $level, PDO::PARAM_INT);
    $insertStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
    $insertStmt->bindParam(':steps', $steps, PDO::PARAM_INT);
    $insertStmt->bindParam(':days', $days, PDO::PARAM_INT);
    $insertStmt->bindParam(':hours', $hours, PDO::PARAM_INT);
    $insertStmt->bindParam(':minutes', $minutes, PDO::PARAM_INT);
    $insertStmt->bindParam(':seconds', $seconds, PDO::PARAM_INT);
    $insertStmt->bindParam(':milliseconds', $milliseconds, PDO::PARAM_INT);
    $insertStmt->execute();

    $response['success'] = true;
    $response['message'] = "High score added successfully";
} else {
    // If existing record, check if new score is better

    if ($steps < $existingScore['steps'] || ($steps == $existingScore['steps'] && compareTimes($time, $existingScore))) {
        // If new score is better, update the existing record

        // Update the existing high score
        $updateStmt = $pdo->prepare("UPDATE highscore SET steps = :steps, days = :days, hours = :hours, minutes = :minutes, seconds = :seconds, milliseconds = :milliseconds WHERE level = :level AND alias = :alias");
        $updateStmt->bindParam(':level', $level, PDO::PARAM_INT);
        $updateStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
        $updateStmt->bindParam(':steps', $steps, PDO::PARAM_INT);
        $updateStmt->bindParam(':days', $days, PDO::PARAM_INT);
        $updateStmt->bindParam(':hours', $hours, PDO::PARAM_INT);
        $updateStmt->bindParam(':minutes', $minutes, PDO::PARAM_INT);
        $updateStmt->bindParam(':seconds', $seconds, PDO::PARAM_INT);
        $updateStmt->bindParam(':milliseconds', $milliseconds, PDO::PARAM_INT);
        $updateStmt->execute();

        $response['success'] = true;
        $response['message'] = "High score updated successfully";
    } else {
        // If new score is not better, do nothing

        $response['success'] = true;
        $response['message'] = "No high score added or updated";
    }
}

    // Delete records where all time components are 0 or steps are 0
    $stmt = $pdo->prepare("
        DELETE FROM highscore 
        WHERE (days = 0 AND hours = 0 AND minutes = 0 AND seconds = 0 AND milliseconds = 0) 
        OR steps = 0
    ");
    $stmt->execute();


} catch (PDOException $e) {
    $response['success'] = false;
    $response['message'] = "Error: " . $e->getMessage();
}


// Return a response
$response['success'] = true;
$response['message'] = "Data received successfully";
echo json_encode($response);
?>