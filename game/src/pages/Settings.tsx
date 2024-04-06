import { useContext, useEffect } from 'react';

import { MyContext } from '../ContextProvider/ContextProvider';
/* import allMaps from './../maps/maps';*/
import { playSound } from './../components/playSound';

export function Settings() {
    const {
        mapFiles,
        gameReady,
        testingMap,
        setShowGameContainer,
        isMuted,
        setMuted,
        setMusic,
        setMapData,
        setBoxPositions,
        setPlayerPosition,
        initialMapData,
        resetGame,
        initialPlayerPosition,
        initialBoxPositions,
        totalToken,
        setTotalToken,
        setPlayedMaps,
        toggleSettings,
        setPlayerDirection,
        level,
        setCollectedTokens,
        setAlias,
        onPageChange,
        setDisableControls,
    } = useContext(MyContext);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                toggleSettings(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // useEffect(() => {
    //     const totalTokenLocalStorage = localStorage.getItem('totalTokens');
    //     if (totalTokenLocalStorage) {
    //         setTotalToken(parseInt(totalTokenLocalStorage));
    //     } else {
    //         setTotalToken(3);
    //         localStorage.setItem('totalTokens', '3');
    //     }
    // }, [totalToken, setTotalToken]);

    function handleMouseOver() {
        playSound('hover', 0.15);
    }

    function handleSoundToggle(): void {
        playSound('click', 0.25);
        if (isMuted) {
            (document.querySelector('#music') as HTMLAudioElement).volume = 0.15;
            setMuted(false);
        } else {
            setMuted(true);
            (document.querySelector('#music') as HTMLAudioElement).volume = 0;
        }
        toggleSettings(false);
    }

    function handleReplay() {
        playSound('click', 0.25);
        playSound('reverse', 0.35);
        setMapData(initialMapData);
        setPlayerPosition(initialPlayerPosition);
        console.log('Initial player Positions: ', initialPlayerPosition);

        setBoxPositions(initialBoxPositions);
        console.log('Initial Box Positions: ', initialBoxPositions);

        resetGame();
        setMusic('play');
        toggleSettings(false);
        setShowGameContainer(false);
        setTimeout(() => {
            setShowGameContainer(true);
        }, 1);
    }

    function handleSolution() {
        if (totalToken > 0) {
            playSound('click', 0.25);
            let newTokenAmount = totalToken - 1;
            if (newTokenAmount < 0) {
                newTokenAmount = 0;
            }
            setTotalToken(newTokenAmount);
            localStorage.setItem('totaltokens', newTokenAmount.toString());
            toggleSettings(false);
            resetGame();
            const index = mapFiles.findIndex((map) => map.id === level + 1);
            if (index === -1) {
                // Handle case where map with given id is not found
                return;
            }
            console.log('Watch solution for level: ', index + 1);
            setDisableControls(true);
            for (let i = 0; i < mapFiles[index].mapdata.solution.length; i++) {
                const mapData = mapFiles[index].mapdata.solution[i].mapdata;
                const direction = mapFiles[index].mapdata.solution[i].direction;

                setTimeout(() => {
                    setMapData(mapData);
                    setPlayerDirection(direction);
                }, i * 250);

                setTimeout(() => {
                    setDisableControls(false);
                    resetGame();
                }, (mapFiles[index].mapdata.solution.length + 2) * 250);
            }

            setMusic('play');
            playSound('collect');
        }
    }

    function handleCookie() {
        playSound('click', 0.25);
        const result = window.confirm(
            'Are you sure you want to delete all highscore and total tokens and start over again?'
        );
        if (result) {
            // User clicked "OK"
            setAlias('');
            localStorage.clear();
            setShowGameContainer(false);
            setTimeout(() => {
                setShowGameContainer(true);
            }, 1);
            onPageChange('start');
            playSound('reverse');
            setTotalToken(3);
            toggleSettings(false);
            setPlayedMaps([]);
            // reset tokens and collectedtokens
            localStorage.setItem('totalTokens', '3');
            // Reset collectedTokens state and local storage
            const resetCollectedTokens = {};
            setCollectedTokens(resetCollectedTokens);
            localStorage.setItem('collectedTokens', JSON.stringify(resetCollectedTokens));
        } else {
            // User clicked "Cancel"
            toggleSettings(false);
        }
    }
    return (
        <>
            <div id="settings">
                <h1>Settings</h1>
                <div className="content-container">
                    <button
                        id="btn-sound"
                        className={`button ${isMuted ? 'muted' : ''}`}
                        onClick={handleSoundToggle}
                        onMouseOver={handleMouseOver}
                    ></button>

                    {gameReady && (
                        <button
                            id="btn-replay"
                            className="button"
                            onClick={handleReplay}
                            onMouseOver={handleMouseOver}
                        ></button>
                    )}

                    {gameReady && !testingMap && (
                        <div
                            id="btn-solution"
                            className={`button ${totalToken <= 0 ? 'disabled' : ''}`}
                            onClick={handleSolution}
                            onMouseOver={handleMouseOver}
                        >
                            <span className="totaltokens" data-totaltoken={totalToken}>
                                {totalToken}
                            </span>
                        </div>
                    )}

                    <button
                        id="btn-cookie"
                        className="button"
                        onClick={handleCookie}
                        onMouseOver={handleMouseOver}
                    ></button>
                </div>
                <br />
                <br />
                <p>
                    Use <strong>"R"</strong> Key to reset map. <strong>"SPACE"</strong> Key to undo
                    step.
                </p>
            </div>
            <div id="darkoverlay"></div>
        </>
    );
}
