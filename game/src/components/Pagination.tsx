import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../ContextProvider/ContextProvider';
import { formatElapsedTime } from '../utils/TimeUtils';
import { playSound } from './playSound';

interface PlayedMap {
    mapId: number;
    score: number;
    elapsedTime: number;
}

interface PaginationProps {
    initialPage?: number;
    perPage?: number;
    mapEndpoint?: string;
}

const Pagination: React.FC<PaginationProps> = ({ initialPage = 0, perPage = 20, mapEndpoint }) => {
    const [mapCount, setMapCount] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const {
        resetGame,
        setLevel,
        setGameReady,
        setDisableControls,
        playedMaps,
        setPlayedMaps,
        onPageChange,
        currentPage,
        mapFiles,
        setMapFiles,
        currentPagnation,
        setCurrentPagnation,
    } = useContext(MyContext);

    useEffect(() => {
        const highestScoresJSON = localStorage.getItem('highestScores');

        if (highestScoresJSON) {
            const highestScores = JSON.parse(highestScoresJSON);

            if (highestScores && Object.keys(highestScores).length > 0) {
                const mapKeys = Object.keys(highestScores);

                const updatedPlayedMaps: PlayedMap[] = [];
                mapKeys.forEach((key) => {
                    const highscoreEntry = highestScores[key];
                    updatedPlayedMaps.push({
                        mapId: parseInt(key),
                        score: highscoreEntry.score,
                        elapsedTime: highscoreEntry.elapsedTime,
                    });
                });

                // Update playedMaps using setPlayedMaps
                setPlayedMaps(updatedPlayedMaps);
            } else {
                // If highestScores is empty, set playedMaps to an empty array
                setPlayedMaps([]);
            }
        } else {
            // If highestScores is not found, set playedMaps to an empty array
            setPlayedMaps([]);
        }
    }, [setPlayedMaps]);

    useEffect(() => {
        fetch(`${mapEndpoint}?page=${currentPagnation + 1}`)
            .then((response) => response.json())
            .then((data) => {
                setMapFiles(data.maps);
                setMapCount(data.mapcount);
            })
            .catch((error) => console.error('Error fetching maps:', error));
    }, [currentPagnation, mapEndpoint, perPage]);

    // Update startIndex and endIndex when mapFiles or mapCount changes
    useEffect(() => {
        const calculatedEndIndex = Math.min((currentPagnation + 1) * perPage, mapCount);
        const calculatedStartIndex = currentPagnation * perPage;
        setStartIndex(calculatedStartIndex);
        setEndIndex(calculatedEndIndex);
    }, [mapFiles, mapCount, currentPagnation, perPage]);

    const handlePrevClick = () => {
        setCurrentPagnation((prevPage) => Math.max(prevPage - 1, 0));
        playSound('swoosh', 0.15);
    };

    const handleNextClick = () => {
        setCurrentPagnation((prevPage) =>
            Math.min(prevPage + 1, Math.ceil(mapCount / perPage) - 1)
        );
        playSound('swoosh', 0.15);
    };

    function handleMouseOver() {
        playSound('hover', 0.15);
    }

    function handleMapClick(e: React.MouseEvent<HTMLLIElement>) {
        const idString: string = e.currentTarget.getAttribute('data-mapid') ?? '';
        const id: number = parseInt(idString);

        // Check if the level is unlocked
        setLevel(-1);
        resetGame();
        setLevel(id);
        playSound('click', 0.25);
        playSound('levelstart', 0.5);
        onPageChange('play');
        setGameReady(true);
        setDisableControls(false);
        // console.log("Level: " ,id);
    }

    function handleWheel(event: React.WheelEvent) {
        if (event.deltaY < 0) {
            handlePrevClick();
        } else {
            handleNextClick();
        }
    }

    return (
        <div className="levels" onWheel={handleWheel}>
            <div className="levels">
                <ul>
                    {mapFiles.map((map, index) => {
                        // Find the corresponding highscore data for the current map
                        const highscoreData = playedMaps.find(
                            (entry) => entry.mapId === Number(map.id - 1)
                        );

                        const classNames = [''];

                        if (playedMaps.length < (map.id - 1 ? parseInt(map.id - 1) : 0)) {
                            classNames.push('notplayable');
                        }

                        if (highscoreData) {
                            classNames.push('done');
                        }
                        return (
                            <li
                                key={startIndex + index}
                                data-mapid={map.id - 1}
                                onMouseOver={
                                    playedMaps.length >= Number(map.id - 1)
                                        ? handleMouseOver
                                        : undefined
                                }
                                onClick={
                                    playedMaps.length >= Number(map.id - 1)
                                        ? handleMapClick
                                        : undefined
                                }
                                className={classNames.join(' ')}
                            >
                                {startIndex + index + 1}
                                <div className="highest">
                                    {highscoreData && (
                                        <>
                                            <span className="highmoves">{highscoreData.score}</span>
                                            <span className="hightime">
                                                {formatElapsedTime(highscoreData.elapsedTime)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="pagination">
                <span>{`Page ${currentPagnation + 1} of ${Math.ceil(mapCount / perPage)}`}</span>
            </div>
            <button
                className="arrow prev"
                onClick={handlePrevClick}
                onMouseOver={handleMouseOver}
                disabled={currentPagnation === 0}
            ></button>

            <button
                className="arrow next"
                onClick={handleNextClick}
                onMouseOver={handleMouseOver}
                disabled={currentPagnation === Math.ceil(mapCount / perPage) - 1}
            ></button>
        </div>
    );
};

export default Pagination;
