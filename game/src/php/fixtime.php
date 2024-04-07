<?php
require("db.php"); // Assuming this file contains your database connection

try {
    // Select all records from the highscore table
    $stmt = $pdo->query("SELECT * FROM highscore");
    
    // Loop through each record
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Extract the time value from the time column
        $time = $row['time'];
        
        // Initialize variables for all components
        $days = 0;
        $hours = 0;
        $minutes = 0;
        $seconds = 0;
        $milliseconds = 0;
        
        // Use regular expressions to extract the components
        if (preg_match('/^(\d+):(\d+):(\d+):(\d+):(\d+)$/', $time, $matches)) {
            $days = $matches[1];
            $hours = $matches[2];
            $minutes = $matches[3];
            $seconds = $matches[4];
            $milliseconds = $matches[5];
        } elseif (preg_match('/^(\d+):(\d+):(\d+):(\d+)$/', $time, $matches)) {
            $hours = $matches[1];
            $minutes = $matches[2];
            $seconds = $matches[3];
            $milliseconds = $matches[4];
        } elseif (preg_match('/^(\d+):(\d+):(\d+)$/', $time, $matches)) {
            $minutes = $matches[1];
            $seconds = $matches[2];
            $milliseconds = $matches[3];
        } elseif (preg_match('/^(\d+):(\d+)$/', $time, $matches)) {
            $seconds = $matches[1];
            $milliseconds = $matches[2];
        } elseif (preg_match('/^(\d+)$/', $time, $matches)) {
            $milliseconds = $matches[1];
        }
        
        // Update the record with the distributed values
        $updateStmt = $pdo->prepare("
            UPDATE highscore
            SET days = :days, hours = :hours, minutes = :minutes, seconds = :seconds, milliseconds = :milliseconds
            WHERE id = :id
        ");
        $updateStmt->execute([
            'days' => $days,
            'hours' => $hours,
            'minutes' => $minutes,
            'seconds' => $seconds,
            'milliseconds' => $milliseconds,
            'id' => $row['id']
        ]);
    }

    echo "Time distribution completed successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
