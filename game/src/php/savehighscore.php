<?php 
require("db.php");


$response = array();

// Set appropriate CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Fetch-Request"); // Allow X-Fetch-Request header

$requestBody = file_get_contents('php://input');
if(empty($requestBody)) {
    // If the request body is empty, send a forbidden response
    $response['success'] = false;
    $response['message'] = "Forbidden: Empty request body";
    echo json_encode($response);
    exit;
}

$data = json_decode($requestBody, true);

// Extract data from the JSON object
if(isset($data['level']) && isset($data['alias']) && isset($data['steps']) && isset($data['time'])) {
    $level = $data['level'];
    $alias = urldecode($data['alias']);
    $steps = $data['steps'];
    $time = urldecode($data['time']);

    try {
    // Check if a record exists for the provided alias on the specified level
    $existingStmt = $pdo->prepare("SELECT steps, time FROM highscore WHERE BINARY alias = :alias AND level = :level");
    $existingStmt->bindParam(':level', $level, PDO::PARAM_INT);
    $existingStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
    $existingStmt->execute();
    $existingScore = $existingStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingScore) {
        // If no existing record, insert the new score

        // Insert the new high score
        $insertStmt = $pdo->prepare("INSERT INTO highscore (level, alias, steps, time) VALUES (:level, :alias, :steps, :time)");
        $insertStmt->bindParam(':level', $level, PDO::PARAM_INT);
        $insertStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
        $insertStmt->bindParam(':steps', $steps, PDO::PARAM_INT);
        $insertStmt->bindParam(':time', $time, PDO::PARAM_STR);
        $insertStmt->execute();

        $response['success'] = true;
        $response['message'] = "High score added successfully";
    } else {
        // If existing record, check if new score is better

        if ($steps < $existingScore['steps'] || ($steps == $existingScore['steps'] && compareTimes($time, $existingScore['time']))) {
            // If new score is better, update the existing record

            // Update the existing high score
            $updateStmt = $pdo->prepare("UPDATE highscore SET steps = :steps, time = :time WHERE level = :level AND alias = :alias");
            $updateStmt->bindParam(':level', $level, PDO::PARAM_INT);
            $updateStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
            $updateStmt->bindParam(':steps', $steps, PDO::PARAM_INT);
            $updateStmt->bindParam(':time', $time, PDO::PARAM_STR);
            $updateStmt->execute();

            $response['success'] = true;
            $response['message'] = "High score updated successfully";
        } else {
            // If new score is not better, do nothing

            $response['success'] = true;
            $response['message'] = "No high score added or updated";
        }

 
    }


    // Function to compare times in the format '0:423'
     function compareTimes($newTime, $existingTime) {
        $newTimeParts = explode(':', $newTime);
        $existingTimeParts = explode(':', $existingTime);

        // Extract seconds and milliseconds
        $newSeconds = (int)$newTimeParts[0];
        $newMilliseconds = isset($newTimeParts[1]) ? (int)$newTimeParts[1] : 0;

        $existingSeconds = (int)$existingTimeParts[0];
        $existingMilliseconds = isset($existingTimeParts[1]) ? (int)$existingTimeParts[1] : 0;

        // Compare seconds
        if ($newSeconds < $existingSeconds) {
            return true;
        } elseif ($newSeconds > $existingSeconds) {
            return false;
        }

        // If seconds are equal, compare milliseconds
        return $newMilliseconds < $existingMilliseconds;
    }



    $stmt = $pdo->prepare("DELETE FROM highscore WHERE time = '' OR steps = 0");
    $stmt->execute();




} catch (PDOException $e) {
    $response['success'] = false;
    $response['message'] = "Error: " . $e->getMessage();
}


    } else {

    $response['success'] = false;
    $response['message'] = "Error: Not enough data specified";
}



// Encode the response array as JSON and output it
echo json_encode($response);
?>
