import { useEffect, useState } from 'react';

import { MyContext } from '../ContextProvider/ContextProvider';
import { SelectPageProps } from './../components/InterfacePages';
import allMaps from '../maps/maps';
import { formatElapsedTime } from '../utils/TimeUtils';
import { playSound } from './../components/playSound';
import { useContext } from 'react';

interface SelectLevelProps extends SelectPageProps {
    mapCount: number;
    currentLevel?: number;
    onLevelChange: () => void;
}

interface PlayedMap {
    mapId: number;
    score: number;
    elapsedTime: number;
}

export function SelectLevel({ onPageChange, mapCount }: SelectLevelProps) {
    const [mapFiles, setMapFiles] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const { resetGame, setLevel, setMusic, setGameReady, setDisableControls, playedMaps, setPlayedMaps } = useContext(MyContext);

    // var { playedMaps, setPlayedMaps } = useContext(MyContext);

    useEffect(() => {
        setMusic('ui');
    }, []);

    const perPage = 20;
    const startIndex = currentPage * perPage;
    const endIndex = Math.min((currentPage + 1) * perPage, mapFiles.length);

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
        const mapFilesData: string[] = [];
        for (let i = 1; i <= allMaps.length; i++) {
            mapFilesData.push(`${i - 1}`);
        }
        // console.log("Map Files: ", mapFilesData);

        setMapFiles(mapFilesData);
    }, [mapCount]);

    const handlePrevClick = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
        playSound('swoosh', 0.15);
    };

    const handleNextClick = () => {
        setCurrentPage((prevPage) =>
            Math.min(prevPage + 1, Math.ceil(mapFiles.length / perPage) - 1)
        );
        playSound('swoosh', 0.15);
    };

    const handleStartClick = () => {
        onPageChange('start');
        playSound('click', 0.25);
    };

    const handlePlayClick = () => {
        const id = playedMaps.length;
        setLevel(id);
        resetGame();
        onPageChange('play');
        playSound('click', 0.25);
        playSound('levelstart', 0.5);
    };

    const handleCreditsClick = () => {
        onPageChange('credits');
        playSound('click', 0.25);
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
        <>
            <div id="selectlevel">
                <h1>Select Level</h1>
                <div className="levels" onWheel={handleWheel}>
                    <div className="levels">
                        <ul>
                            {mapFiles.slice(startIndex, endIndex).map((map, index) => {
                                // Find the corresponding highscore data for the current map
                                const highscoreData = playedMaps.find(
                                    (entry) => entry.mapId === Number(map)
                                );

                                const classNames = [''];

                                if (playedMaps.length < (map ? parseInt(map) : 0)) {
                                    classNames.push('notplayable');
                                }

                                if (highscoreData) {
                                    classNames.push('done');
                                }
                                return (
                                    <li
                                        key={startIndex + index}
                                        data-mapid={map}
                                        onMouseOver={
                                            playedMaps.length >= Number(map)
                                                ? handleMouseOver
                                                : undefined
                                        }
                                        onClick={
                                            playedMaps.length >= Number(map)
                                                ? handleMapClick
                                                : undefined
                                        }
                                        className={classNames.join(' ')}
                                    >
                                        {startIndex + index + 1}
                                        <div className="highest">
                                            {highscoreData && (
                                                <>
                                                    <span className="highmoves">
                                                        {highscoreData.score}
                                                    </span>
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
                    <button
                        className="arrow prev"
                        onClick={handlePrevClick}
                        onMouseOver={handleMouseOver}
                        disabled={currentPage === 0}
                    ></button>

                    <button
                        className="arrow next"
                        onClick={handleNextClick}
                        onMouseOver={handleMouseOver}
                        disabled={currentPage === Math.ceil(mapFiles.length / perPage) - 1}
                    ></button>
                </div>
                <div id="menubuttons">
                    <span>{`Page ${currentPage + 1} of ${Math.ceil(
                        mapFiles.length / perPage
                    )}`}</span>
                    <div
                        id="btn-start"
                        className="button"
                        onClick={handleStartClick}
                        onMouseOver={handleMouseOver}
                    ></div>
                    <div
                        id="btn-credits"
                        className="button"
                        onClick={handleCreditsClick}
                        onMouseOver={handleMouseOver}
                    ></div>
                    <div
                        id="btn-play"
                        className="button"
                        onClick={handlePlayClick}
                        onMouseOver={handleMouseOver}
                    ></div>
                </div>
            </div>
        </>
    );
}
