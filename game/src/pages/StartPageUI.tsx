import './../css/Map.css';
import './../css/StartPageUI.css';

import { useContext, useState, useEffect } from 'react';
import { SelectPageProps } from './../components/InterfacePages';
import { MyContext } from '../ContextProvider/ContextProvider';
import { playSound } from './../components/playSound';

export function StartPageUI({ onPageChange }: SelectPageProps) {
    const { setGameReady, setMusic, alias, setAlias } = useContext(MyContext);
    const [playerName, setPlayerName] = useState<string >("");

    const handleButtonClick = () => {
        onPageChange('selectlevel');
        playSound('click', 0.25);
        playSound('swoosh', 0.25);
    };

    function handleMouseOver() {
        playSound('hover', 0.15);
    }

    const handleButtonClick2 = () => {
        onPageChange('MapGenerator');
        playSound('click', 0.25);
        playSound('swoosh', 0.25);
        setMusic('create');
        setGameReady(false);
    };

    const handleNameChange = (e: { target: { value: string } }) => {
        const newName = e.target.value;
        setPlayerName(newName);
    };
    const handleSetLocalStorage = () => {
        playSound('click', 0.25);
        if (playerName === '' ) {
            alert('You need to set an alias');
            return;
        }
        setAlias(playerName);
        localStorage.setItem('playerName', playerName);
    };
    const handleKeyDown = (e: { key: string }) => {
        if (e.key === 'Enter') {
            handleSetLocalStorage();
        }
    };

    useEffect(() => {
        const localAlias = localStorage.getItem('playerAlias');
        if (localAlias) {
            setAlias(localAlias);
        }
        renderInputField(); // Call renderInputField after setting alias
    }, [alias]);

    // Second useEffect block
    useEffect(() => {
        const inputElement = document.getElementById('aliasInput');
        if (inputElement) {
            inputElement.focus();
        }
    }, [alias]);

    const renderInputField = () => {
        if (!alias) {
            return (
                <>
                    <div id="setalias">
                        <input
                            id="aliasInput"
                            type="text"
                            value={playerName}
                            onChange={handleNameChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter alias"
                        />
                        <div
                            id="enteralias"
                            onClick={handleSetLocalStorage}
                            onMouseOver={handleMouseOver}
                            className="button"
                        >
                            Enter
                        </div>
                    </div>
                    <div id="darkoverlay" className="startoverlay"></div>
                </>
            );
        }
    };

    return (
        <>
            {renderInputField()}
            <div id="player">
                <h1>Sokoban</h1>

                <div className="player playerwalkdown"></div>
            </div>
            <div id="startplay" onClick={handleButtonClick} onMouseOver={handleMouseOver}></div>
            <div
                id="mapEditor"
                className="button"
                onClick={handleButtonClick2}
                onMouseOver={handleMouseOver}
            ></div>
        </>
    );
}
