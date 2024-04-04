import { useContext, useEffect, useState, useRef } from 'react';

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
    const [isSaving, setIsSaving] = useState(false);
    const saveHighScoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const saveHighScore = () => {
            if (!isSaving) {
                setIsSaving(true);
                const url = 'https://diam.se/sokoban/src/php/savehighscore.php';
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            console.log('High score saved successfully');
                        } else {
                            console.error('Error saving high score:', xhr.status);
                        }
                        setIsSaving(false);
                    }
                };
                const data = {
                    level: level + 1,
                    alias: alias,
                    time: formatElapsedTime(highestScores[level]?.elapsedTime || 0),
                    steps: highestScores[level]?.score || 0,
                };
                const jsonData = JSON.stringify(data);
                xhr.send(jsonData);
            }
        };

        // Clear previous timeout when level, alias, or highestScores change
        if (saveHighScoreTimeoutRef.current !== null) {
            clearTimeout(saveHighScoreTimeoutRef.current);
        }

        // Set new timeout to save high score
        saveHighScoreTimeoutRef.current = setTimeout(() => {
            saveHighScore();
        }, 250);

        // Clear the timeout when component unmounts
        return () => {
            if (saveHighScoreTimeoutRef.current !== null) {
                clearTimeout(saveHighScoreTimeoutRef.current);
            }
        };
    }, [level, alias, highestScores, isSaving]);

    useEffect(() => {
        // Fetch high score when component mounts
        const getHighScore = () => {
            const getHighScoreUrl = `https://diam.se/sokoban/src/php/gethighscore.php?level=${
                level + 1
            }`;
            const xhr = new XMLHttpRequest();
            xhr.open('POST', getHighScoreUrl);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            const result = JSON.parse(xhr.responseText);
                            setHighscoreDB(result.highscores || []);
                        } catch (error) {
                            console.error('Error parsing high score response:', error);
                        }
                    } else {
                        console.error('Error fetching high score:', xhr.status);
                    }
                }
            };
            xhr.send();
        };

        getHighScore();

        // Fetch high score again every 250 milliseconds
        const interval = setInterval(getHighScore, 250);

        // Clear the interval when component unmounts
        return () => clearInterval(interval);
    }, [level, setHighscoreDB]);

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
        setShowGameContainer(true);
        setShowGameContainer(true);
        setDisableControls(false);
        setGameReady(true);
        resetGame();
        resetGame();
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
