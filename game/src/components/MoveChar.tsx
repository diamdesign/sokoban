import { useCallback, useContext, useEffect, useState } from 'react';

import HighScore from './highscore';
import { MyContext } from '../ContextProvider/ContextProvider';
import { playSound } from '../components/playSound';

interface MoveCharProps {
    mapData: string[][];
    setMapData: (mapData: string[][]) => void;
    setPlayerDirection: (direction: string) => void;
    playerPosition: { x: number; y: number };
    setPlayerPosition: (position: { x: number; y: number }) => void;
    indicatorPositions: { x: number; y: number }[];
    setIndicatorPositions: (positions: { x: number; y: number }[]) => void;
    boxPositions: { x: number; y: number }[];
    setBoxPositions: (positions: { x: number; y: number }[]) => void;
    specialBox: { x: number; y: number }[];
    setSpecialBox: (positions: { x: number; y: number }[]) => void;
    specialBoxIndicator: { x: number; y: number }[];
    setSpecialBoxIndicator: (positions: { x: number; y: number }[]) => void;
    specialDoor: { x: number; y: number }[];
    setSpecialDoor: (positions: { x: number; y: number }[]) => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const directionMap: Record<Direction, { x: number; y: number }> = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

export function MoveChar({
    mapData,
    setMapData,
    setPlayerDirection,
    playerPosition,
    setPlayerPosition,
    indicatorPositions,
    boxPositions,
    setBoxPositions,
    specialBox,
    setSpecialBox,
    specialBoxIndicator,
    setSpecialBoxIndicator,
    specialDoor,
    setSpecialDoor,
}: MoveCharProps) {
    const [currentLevel, setCurrentLevel] = useState<string>('1');

    const [direction, setDirection] = useState<string>('');
    const [levelCompleted, setLevelCompleted] = useState(false);

    //Reduce the number of useContext calls by destructuring the values from the context
    const {
        disableControls,
        setDisableControls,
        counter,
        setCounter,
        elapsedTime,
        setElapsedTime,
        wonGame,
        setWonGame,
        gameRunning,
        setGameRunning,
        startTime,
        setStartTime,
        level,
        setHighestScores,
        handleHistory,
        setHandleHistory,
        resetGame,
        history,
        setHistory,
        solution,
        setSolution,
        youAreDead,
        youLost,
        setYouAreDead,
        setYouLost,
        setPlayerGroundFloor,
        mapGeneratorRendering,
    } = useContext(MyContext);

    function handleDeath(string?: string | null) {
        if (string === undefined || string === null || string === '') {
            /* empty */
        } else if (string === 'mine') {
            playSound('mine', 0.8);
        }
        setDisableControls(true);
        setYouAreDead(true);
        playSound('lost', 0.4);
        playSound('gameover', 0.4);

        setTimeout(() => {
            setYouAreDead(false);
            setDisableControls(false);
            resetGame();
        }, 3000);
    }

    function handleLost(string?: string | null) {
        if (string === undefined || string === null || string === '') {
            /* empty */
        } else if (string === 'boxexplode') {
            playSound('boxexplode', 0.8);
        }
        setDisableControls(true);
        setYouLost(true);
        playSound('lost', 0.4);
        playSound('gameover', 0.4);

        setTimeout(() => {
            setYouLost(false);
            setDisableControls(false);
            resetGame();
        }, 3000);
    }

    /**
     * Adds the current state of the game to the history.
     */
    const addToHistory = () => {
        setHistory((prevHistory) => {
            const newHistoryState = {
                mapData,
                playerPosition,
                boxPositions,
                counter,
                direction,
            };

            return [...prevHistory, newHistoryState];
        });
    };
    const addToSolution = (mapData: string[][], direction: string) => {
        const newSolution = {
            mapData: mapData,
            direction: direction.toLowerCase(),
        };
        setSolution([...solution, newSolution]);
    };

    useEffect(() => {}, [solution]);

    const saveSolutionToJson = () => {
        const Solution = solution.map((obj) => ({
            mapdata: obj.mapData,
            direction: obj.direction,
        }));
        const jsonSolution = JSON.stringify(Solution);
        const blob = new Blob([jsonSolution], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `map${level + 1}.json`;
        // TODO: Uncomment this line to automatically download the solution filename
        // a.click();
        a.remove();
        window.URL.revokeObjectURL(a.href);
    };

    const handleHistoryUndo = useCallback(() => {
        if (history.length > 1) {
            const prevState = history[history.length - 1];
            const { mapData, playerPosition, direction, boxPositions, counter } = prevState;

            setMapData(mapData);
            setPlayerPosition(playerPosition);
            setPlayerDirection(direction);
            setBoxPositions(boxPositions);
            setCounter(counter);
            setHistory((prev) => prev.slice(0, -1));
            setSolution((prev) => prev.slice(0, -1));
            playSound('reverse', 0.3);
            if (counter === 0) {
                if (setGameRunning) {
                    setElapsedTime(0);
                    setGameRunning(false);
                    setPlayerDirection('down');
                }
            }
        } else {
            playSound('reverse', 0.3);
            resetGame();
        }
    }, [history, setMapData, setPlayerPosition, setBoxPositions, setCounter, setPlayerDirection]);

    useEffect(() => {
        setHistory([]);
        setHandleHistory(false);
    }, [level]);

    useEffect(() => {
        // console.log(handleHistory);
        if (handleHistory) {
            handleHistoryUndo();
            setHandleHistory(false);
        }
    }, [handleHistory]);

    useEffect(() => {
        if (startTime && gameRunning) {
            const intervalId = setInterval(() => {
                const elapsed = Math.floor(Date.now() - startTime.getTime());
                setElapsedTime(elapsed);
            }, 100);

            return () => clearInterval(intervalId);
        }
    }, [startTime, gameRunning, currentLevel]);

    const startGame = useCallback(() => {
        setStartTime(new Date());
        setGameRunning?.(true);
        setWonGame(false);
        setDisableControls(false);
    }, []);

    const stopGame = useCallback(() => {
        setStartTime(null);
        setGameRunning?.(false);
        setWonGame(true);
    }, []);

    function setDivClass(positionX: number, positionY: number, classname: string) {
        const gridContainer = document.querySelector('.grid-container');

        if (gridContainer) {
            const gridItems = gridContainer.querySelectorAll('[class^="grid-item"]');

            const x = positionY;
            const y = positionX;

            gridItems.forEach((gridItem, index) => {
                const gridX = Math.floor(index / 10);
                const gridY = index % 10;

                if (gridX === x && gridY === y) {
                    gridItem.classList.add(classname);
                } else {
                    gridItem.classList.remove(classname);
                }
            });
        }
    }

    const isWithinBoundaries = (position: { x: number; y: number }) => {
        return (
            position.x >= 0 &&
            position.x < mapData[0].length &&
            position.y >= 0 &&
            position.y < mapData.length
        );
    };

    const isNotWall = (newMapData: string[][], position: { x: number; y: number }) => {
        return (
            newMapData[position.y][position.x] !== '#' &&
            newMapData[position.y][position.x].startsWith('D') === false &&
            newMapData[position.y][position.x].startsWith('S') === false
        );
    };

    const isEmptySpace = (newMapData: string[][], position: { x: number; y: number }) => {
        return newMapData[position.y][position.x] === '-';
    };

    const isMine = (newMapData: string[][], position: { x: number; y: number }) => {
        return newMapData[position.y][position.x] === 'M';
    };

    const isCrackedWall = (newMapData: string[][], position: { x: number; y: number }) => {
        return newMapData[position.y][position.x] === 'W';
    };

    const movePlayer = (newMapData: string[][], newPosition: { x: number; y: number }) => {
        // Check if the new player position has a token
        if (newMapData[newPosition.y][newPosition.x] === 'T') {
            // If it does, remove the token
            newMapData[newPosition.y][newPosition.x] = ',';
        }

        if (newMapData[newPosition.y][newPosition.x] === 'D') {
            return;
        }

        if (
            indicatorPositions.some(
                (pos) => pos.x === playerPosition.x && pos.y === playerPosition.y
            )
        ) {
            newMapData[playerPosition.y][playerPosition.x] = 'I';
        } else if (
            specialBoxIndicator.some(
                (pos) => pos.x === playerPosition.x && pos.y === playerPosition.y
            )
        ) {
            newMapData[playerPosition.y][playerPosition.x] = 'S';
        } else {
            newMapData[playerPosition.y][playerPosition.x] = ',';
        }

        newMapData[newPosition.y][newPosition.x] = 'P';
        setCounter(counter + 1);
        setMapData(newMapData);
        playSound('walk', 0.3);
        setPlayerPosition(newPosition);
    };

    const moveBox = (
        newMapData: string[][],
        newPosition: { x: number; y: number },
        beyondBoxPosition: { x: number; y: number },
        boxIndex: number
    ) => {
        newMapData[beyondBoxPosition.y][beyondBoxPosition.x] = 'B';
        playSound('pushbox', 0.4);
        playSound('walk', 0.3);

        if (
            indicatorPositions.some(
                (pos) => pos.x === beyondBoxPosition.x && pos.y === beyondBoxPosition.y
            )
        ) {
            playSound('boxindication', 0.4);
        }
        if (
            indicatorPositions.some(
                (pos) => pos.x === playerPosition.x && pos.y === playerPosition.y
            )
        ) {
            newMapData[playerPosition.y][playerPosition.x] = 'I';
        } else {
            newMapData[playerPosition.y][playerPosition.x] = ',';
        }

        newMapData[newPosition.y][newPosition.x] = 'P';
        setCounter(counter + 1);
        setMapData(newMapData);
        const newBoxPositions = [...boxPositions];
        newBoxPositions[boxIndex] = beyondBoxPosition;
        setBoxPositions(newBoxPositions);
        setPlayerPosition(newPosition);
    };

    //Just to trigger the door when the box is on the special indicator changes to ground
    const triggerDoor = (doorPosition: { x: number; y: number }, newMapData: string[][]) => {
        const getRandomBoolean = () => Math.random() < 0.5;

        const shouldPlayWallDoor = getRandomBoolean();

        if (shouldPlayWallDoor) {
            playSound('walldoor', 0.7);
        } else {
            setTimeout(() => {
                playSound('wallexplode', 0.3);
                setDivClass(doorPosition.x, doorPosition.y, 'explode');
            }, 1);
        }

        // Update newMapData
        newMapData[doorPosition.y][doorPosition.x] = ',';

        setMapData(newMapData);
    };

    const moveSpecialBox = (
        newMapData: string[][],
        newPosition: { x: number; y: number },
        beyondBoxPosition: { x: number; y: number },
        boxIndex: number
    ) => {
        // Check if the new position of the special box is a special indicator
        const specialIndicator = newMapData[beyondBoxPosition.y][beyondBoxPosition.x];
        let doorPosition = null;
        if (
            specialBoxIndicator.some(
                (pos) => pos.x === beyondBoxPosition.x && pos.y === beyondBoxPosition.y
            )
        ) {
            // If it is, find the corresponding door
            const doorNumber = specialIndicator.slice(1);
            const correspondingDoor = 'D' + doorNumber;

            // Find the position of the corresponding door
            for (let y = 0; y < mapData.length; y++) {
                for (let x = 0; x < mapData[y].length; x++) {
                    if (mapData[y][x] === correspondingDoor) {
                        doorPosition = { x, y };
                        break;
                    }
                }
                if (doorPosition) break;
            }

            // Update the map data to reflect the box moving onto the special indicator "Should"
            newMapData[beyondBoxPosition.y][beyondBoxPosition.x] = 'O';
        } else {
            newMapData[beyondBoxPosition.y][beyondBoxPosition.x] = 'O';
        }

        playSound('pushbox', 0.4);
        playSound('walk', 0.3);

        if (
            indicatorPositions.some(
                (pos) => pos.x === playerPosition.x && pos.y === playerPosition.y
            )
        ) {
            newMapData[playerPosition.y][playerPosition.x] = 'I';
        } else {
            newMapData[playerPosition.y][playerPosition.x] = ',';
        }
        newMapData[newPosition.y][newPosition.x] = 'P';
        setCounter(counter + 1);
        setMapData(newMapData);
        const newSpecialBoxPositions = [...specialBox];
        newSpecialBoxPositions[boxIndex] = beyondBoxPosition;
        setSpecialBox(newSpecialBoxPositions);
        setPlayerPosition(newPosition);
        // If a door needs to be triggered, do it after updating the mapData state
        if (doorPosition) {
            triggerDoor(doorPosition, newMapData);
        }
    };

    // console.log(mapData);
    const handlePlayerMove = useCallback(
        (direction: string) => {
            setPlayerDirection(direction.toLowerCase());
            setDirection(direction.toLowerCase());

            if (youAreDead || youLost) {
                return;
            }

            const newPosition = {
                x: playerPosition.x + directionMap[direction as Direction].x,
                y: playerPosition.y + directionMap[direction as Direction].y,
            };

            if (mapData.length > 0 && mapData[0] && isWithinBoundaries(newPosition)) {
                const newMapData = mapData.map((row: string[]) => [...row]);

                if (isNotWall(newMapData, newPosition)) {
                    const checkEmptySpace = isEmptySpace(newMapData, newPosition);
                    const checkMine = isMine(newMapData, newPosition);
                    const checkCrackedWall = isCrackedWall(newMapData, newPosition);

                    // Check if the new position is a door
                    if (newMapData[newPosition.y][newPosition.x] === 'D') {
                        console.log('Door');
                        return;
                    }

                    if (checkEmptySpace) {
                        handleDeath();
                        setPlayerGroundFloor('falling');
                    }

                    if (checkMine) {
                        handleDeath('mine');
                        setTimeout(() => {
                            setDivClass(newPosition.x, newPosition.y, 'explode');
                        }, 1);
                        // setPlayerGroundFloor('explode');
                    }

                    const boxIndex = boxPositions.findIndex(
                        (pos) => pos.x === newPosition.x && pos.y === newPosition.y
                    );

                    // console.log('Box:', boxPositions);
                    // console.log('Box Index:', boxIndex);

                    const specialBoxIndex = specialBox.findIndex(
                        (pos) => pos.x === newPosition.x && pos.y === newPosition.y
                    );

                    if (specialBoxIndex !== -1) {
                        const isSpecialBoxOnIndicator = specialBoxIndicator.some(
                            (pos) => pos.x === newPosition.x && pos.y === newPosition.y
                        );

                        if (isSpecialBoxOnIndicator) {
                            // If the special box is on the indicator, don't allow the player to move it
                            return;
                        }
                    }

                    // console.log('Special Box:', specialBox);
                    // console.log('Special Box Index:', specialBoxIndex);

                    if (boxIndex !== -1 || specialBoxIndex !== -1) {
                        const beyondBoxPosition = {
                            x: newPosition.x + directionMap[direction as Direction].x,
                            y: newPosition.y + directionMap[direction as Direction].y,
                        };
                        if (
                            isWithinBoundaries(beyondBoxPosition) &&
                            (newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === ',' ||
                                newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === 'I' ||
                                newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === 'T' ||
                                (newMapData[beyondBoxPosition.y][beyondBoxPosition.x].startsWith(
                                    'S'
                                ) &&
                                    newMapData[newPosition.y][newPosition.x] === 'O')) &&
                            !newMapData[beyondBoxPosition.y][beyondBoxPosition.x].startsWith('D')
                        ) {
                            if (specialBoxIndex !== -1) {
                                //Move the special box
                                moveSpecialBox(
                                    newMapData,
                                    newPosition,
                                    beyondBoxPosition,
                                    specialBoxIndex
                                );
                                // console.log('move special box');
                            } else {
                                //Move the normal box
                                moveBox(newMapData, newPosition, beyondBoxPosition, boxIndex);
                                // console.log('move normal box');
                            }
                        }
                        if (
                            isWithinBoundaries(beyondBoxPosition) &&
                            (newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === ',' ||
                                newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === 'I')
                        ) {
                            moveBox(newMapData, newPosition, beyondBoxPosition, boxIndex);
                        } else if (isEmptySpace(newMapData, beyondBoxPosition)) {
                            moveBox(newMapData, newPosition, beyondBoxPosition, boxIndex);
                            // setBoxGroundFloor('falling');
                            setTimeout(() => {
                                setDivClass(beyondBoxPosition.x, beyondBoxPosition.y, 'falling');
                            }, 1);
                            handleLost();
                            return;
                        } else if (isMine(newMapData, beyondBoxPosition)) {
                            moveBox(newMapData, newPosition, beyondBoxPosition, boxIndex);
                            // setBoxGroundFloor('explode');
                            setTimeout(() => {
                                setDivClass(beyondBoxPosition.x, beyondBoxPosition.y, 'explode');
                            }, 1);
                            handleLost('boxexplode');
                            return;
                        }
                    } else {
                        if (checkCrackedWall) {
                            setDisableControls(true);
                            playSound('drill');
                            const gridContainer = document.querySelector('.grid-container');

                            setDivClass(newPosition.x, newPosition.y, 'drill');

                            gridContainer?.classList.add('gameshaker');
                            setTimeout(() => {
                                gridContainer?.classList.remove('gameshaker');
                                movePlayer(newMapData, newPosition);
                                setDisableControls(false);
                            }, 1050);
                        } else {
                            movePlayer(newMapData, newPosition);
                        }
                    }

                    if (!gameRunning && counter === 0) {
                        startGame();
                    }
                    addToHistory();
                    addToSolution(newMapData, direction);
                }
            }
        },
        [
            youAreDead,
            mapData,
            playerPosition,
            setPlayerDirection,
            indicatorPositions,
            setMapData,
            setPlayerPosition,
            setBoxPositions,
            boxPositions,
            gameRunning,
            counter,
            startGame,
            specialBox,
            setSpecialBox,
            specialBoxIndicator,
            setSpecialBoxIndicator,
            specialDoor,
            setSpecialDoor,
        ]
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!disableControls) {
                switch (event.key.toUpperCase()) {
                    case 'ARROWUP':
                    case 'W':
                        handlePlayerMove('UP');
                        break;
                    case 'ARROWDOWN':
                    case 'S':
                        handlePlayerMove('DOWN');
                        break;
                    case 'ARROWLEFT':
                    case 'A':
                        handlePlayerMove('LEFT');
                        break;
                    case 'ARROWRIGHT':
                    case 'D':
                        handlePlayerMove('RIGHT');
                        break;
                    case ' ':
                        handleHistoryUndo();
                        setHandleHistory(false);
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePlayerMove, handleHistoryUndo]);

    useEffect(() => {
        let startTouchX: number | null = null;
        let startTouchY: number | null = null;
        const threshold = 10; // Threshold value for touch movement

        const handleTouchStart = (event: TouchEvent) => {
            const touch = event.touches[0];
            startTouchX = touch.clientX;
            startTouchY = touch.clientY;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!disableControls) {
                if (startTouchX === null || startTouchY === null) return; // Touch didn't start properly

                const touch = event.touches[0];
                const distX = touch.clientX - startTouchX;
                const distY = touch.clientY - startTouchY;

                // Check if the touch movement exceeds the threshold
                if (Math.abs(distX) < threshold && Math.abs(distY) < threshold) return;

                let direction: Direction | null = null;

                // Determine the swipe direction
                if (Math.abs(distX) > Math.abs(distY)) {
                    direction = distX > 0 ? 'RIGHT' : 'LEFT';
                } else {
                    direction = distY > 0 ? 'DOWN' : 'UP';
                }

                if (direction) {
                    handlePlayerMove(direction);
                    // Reset the initial touch position after each successful move
                    startTouchX = touch.clientX;
                    startTouchY = touch.clientY;
                }
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [handlePlayerMove]);

    useEffect(() => {
        let allIndicatorsCovered = true;
        for (const position of indicatorPositions) {
            const { x, y } = position;
            if (mapData[y][x] !== 'B') {
                allIndicatorsCovered = false;
                break;
            }
        }
        // If all indicators are covered and the game is running, declare victory
        if (allIndicatorsCovered && gameRunning) {
            stopGame();
            setWonGame(true);
            addToSolution(mapData, direction);
            // !mapGeneratorRendering && saveSolutionToJson();
            setLevelCompleted(true);
            setCurrentLevel(level.toString());
        }
    }, [mapData, counter, elapsedTime, currentLevel, gameRunning]);

    useEffect(() => {
        if (levelCompleted && counter > 0 && elapsedTime > 0) {
            const updateHighScores = () => {
                setHighestScores((prevHighestScores) => {
                    const levelData = prevHighestScores[currentLevel] || {
                        score: Infinity,
                        elapsedTime: 0,
                    };
                    if (
                        counter < levelData.score ||
                        (counter === levelData.score && elapsedTime < levelData.elapsedTime)
                    ) {
                        const updatedScores = {
                            ...prevHighestScores,
                            [currentLevel]: { score: counter, elapsedTime },
                        };
                        localStorage.setItem('highestScores', JSON.stringify(updatedScores));
                        return updatedScores;
                    }
                    return prevHighestScores;
                });
            };

            // Delay the execution of updateHighScores by 2 seconds
            setTimeout(updateHighScores, 1);
            setLevelCompleted(false);
        }
    }, [levelCompleted, currentLevel]);

    return (
        <>
            {wonGame && counter > 0 && elapsedTime > 0 && (
                <HighScore
                    currentLevel={currentLevel}
                    counter={counter}
                    elapsedTime={elapsedTime}
                />
            )}
        </>
    );
}
