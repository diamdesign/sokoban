import { useContext, useEffect, useState } from 'react';

import { MyContext } from './../ContextProvider/ContextProvider';
import { formatElapsedTime } from '../utils/TimeUtils';
import { playSound } from './../components/playSound';

export function Highscore() {
    const {
        setShowGameContainer,
        setMapData,
        setMusic,
        setBoxPositions,
        setPlayerPosition,
        initialMapData,
        resetGame,
        initialPlayerPosition,
        initialBoxPositions,
        level,
        alias,
        setLevel,
        highestScores,
        setHighestScores,
        setGameReady,
        setDisableControls,
    } = useContext(MyContext);

    const [highscoreDB, setHighscoreDB] = useState<any[]>([]);

    useEffect(() => {
        const storedScores = localStorage.getItem('highestScores');
        if (storedScores) {
            setHighestScores(JSON.parse(storedScores));
        }
        // console.log("Stored Scores: ", storedScores || "No stored scores");

        playSound('leveldone', 0.3);
        setShowGameContainer(false);
        setMusic('ui');
        setGameReady(false);
        setDisableControls(true);
    }, []); // Add level to the dependency array

    useEffect(() => {
        // Define the function to run when Enter key is pressed
        const handleEnterPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleNextLevel();
            }
        };
        // Attach the event listener to the document body
        document.body.addEventListener('keydown', handleEnterPress);
        // Remove the event listener when the component unmounts
        return () => {
            document.body.removeEventListener('keydown', handleEnterPress);
        };
    }, []);

    useEffect(() => {
        setTimeout(() => {
            const xhr = new XMLHttpRequest();
            const url = 'https://diam.se/sokoban/src/php/savehighscore.php';

            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        console.log('Response:', response);
                    } else {
                        console.error('Error:', xhr.status);
                    }
                }
            };

            // Prepare the data to send
            const data = {
                level: level + 1,
                alias: alias,
                time: formatElapsedTime(highestScores[level]?.elapsedTime || 0),
                steps: highestScores[level]?.score || 0,
            };

            // Convert data to JSON string before sending
            const jsonData = JSON.stringify(data);

            xhr.send(jsonData);

            setTimeout(() => {
                try {
                    const getHighScoreUrl = `https://diam.se/sokoban/src/php/gethighscore.php?level=${
                        level + 1
                    }`;
                    const xhr2 = new XMLHttpRequest();
                    xhr2.open('POST', getHighScoreUrl);
                    xhr2.onreadystatechange = function () {
                        if (xhr2.readyState === XMLHttpRequest.DONE) {
                            if (xhr2.status === 200) {
                                try {
                                    const result = JSON.parse(xhr2.responseText);
                                    console.log(result.highscores);
                                    setHighscoreDB(result.highscores || []);
                                } catch (error) {
                                    console.error('Error parsing high score response:', error);
                                }
                            } else {
                                console.error('Error fetching high score:', xhr2.status);
                            }
                        }
                    };
                    xhr2.send();
                } catch (error) {
                    console.error('Error parsing save high score response:', error);
                }
            }, 250);
        }, 250);
    }, []);

    function handleMouseOver() {
        playSound('hover', 0.15);
    }

    function handleReplay() {
        playSound('click', 0.25);
        playSound('reverse', 0.5);
        playSound('levelstart', 0.5);
        setMapData(initialMapData);
        setPlayerPosition(initialPlayerPosition);
        setBoxPositions(initialBoxPositions);
        resetGame();
        setShowGameContainer(true);
        setDisableControls(false);
        setGameReady(true);
    }

    function handleNextLevel() {
        playSound('click', 0.25);
        playSound('levelstart', 0.5);

        // // Get the current highestScores from local storage
        // const highestScoresJSON = localStorage.getItem("highestScores");
        // const highestScores = highestScoresJSON ? JSON.parse(highestScoresJSON) : {};

        // // Add the current level to highestScores only if it doesn't exist yet
        // if (!highestScores[level]) {
        // 	highestScores[level] = { score: Infinity, elapsedTime: Infinity };
        // }

        // // Save highestScores back to local storage
        // localStorage.setItem("highestScores", JSON.stringify(highestScores));

        const nextLevel = level + 1;
        setLevel(nextLevel);
        setMapData(initialMapData);
        setPlayerPosition(initialPlayerPosition);
        setBoxPositions(initialBoxPositions);
        resetGame();
        setShowGameContainer(true);
        setShowGameContainer(true);
        setDisableControls(false);
        setGameReady(true);
    }

    return (
        <>
            <div id="highscore">
                <h1>Completed</h1>
                <h2>Level {level + 1}</h2>
                <div className="showhighscore">
                    <div className="result">
                        <div className="row thead">
                            <div>Alias</div>
                            <div>Steps</div>
                            <div>Time</div>
                        </div>
                    </div>
                </div>
                {/* Display highest scores for the current level */}
                {Object.keys(highestScores)
                    .map(Number)
                    .filter((levelNumber) => levelNumber === level)
                    .map((level) => (
                        <div key={level} className="showhighscore">
                            <div className="result">
                                <div className="row">
                                    <div>{alias}</div>
                                    <div>{highestScores[level].score}</div>
                                    <div>{formatElapsedTime(highestScores[level].elapsedTime)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                <div className="listhdb">
                    {/* Display high scores from the database */}
                    {highscoreDB &&
                        highscoreDB.map((row, index) => (
                            <div className="row" key={index}>
                                <div>{index + 1}</div>
                                <div>{row.alias}</div>
                                <div>{row.steps}</div>
                                <div>{row.time}</div>
                            </div>
                        ))}
                </div>
                <div className="content-container">
                    <button
                        id="btn-replay-again"
                        className="button"
                        onClick={handleReplay}
                        onMouseOver={handleMouseOver}
                    ></button>
                    <button
                        id="btn-nextlevel"
                        className="button"
                        onClick={handleNextLevel}
                        onMouseOver={handleMouseOver}
                    ></button>
                </div>
            </div>
            <div id="darkoverlay"></div>
        </>
    );
}
