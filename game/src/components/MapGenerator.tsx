/* eslint-disable @typescript-eslint/no-explicit-any */

import { SetStateAction, useContext, useEffect, useMemo, useState } from 'react';

import { MapRender } from './MapRender';
import { MyContext } from '../ContextProvider/ContextProvider';
import { playSound } from './playSound';

const ITEMS = [
    'empty',
    'wall',
    'ground',
    'box',
    'boxindicator',
    'player',
    'cracked',
    'mined',
    'special',
    'specialboxed',
    'door',
];

interface ToolbarProps {
    onItemSelected: (item: string) => void;
}

function handleMouseOver() {
    playSound('hover', 0.15);
}
// This is the toolbar component that displays the items that can be selected
function Toolbar({ onItemSelected }: ToolbarProps) {
    const { setContextMenu } = useContext(MyContext);
    // memo becuse we dont want to recreate the array every time the component rerenders
    const items = useMemo(() => ITEMS, []);
    // This is a custom hook that listens for keydown events and calls the provided callback when a number key is pressed (1-9) to select an item
    useEffect(() => {
        const handleKeyDown = (e: { key: string }) => {
            const keyNumber = parseInt(e.key, 10);
            if (keyNumber >= 1 && keyNumber <= items.length) {
                // console.log(`Key ${keyNumber} pressed, selecting item ${items[keyNumber - 1]}`);
                onItemSelected(items[keyNumber - 1]);

                const allButtons = document.querySelectorAll('.toolbar button');
                allButtons.forEach((btn, index) => {
                    const button = btn as HTMLButtonElement;
                    button.classList.remove('active');
                    if (index === keyNumber - 1) {
                        button.classList.add('active');
                        button.focus();
                    }
                });

                // Hide the context menu
                setContextMenu({ visible: false, x: 0, y: 0 });
                playSound('click', 0.25);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [items, onItemSelected]);

    function handleToolbarClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: string) {
        playSound('click', 0.25);
        const allButtons = document.querySelectorAll(
            '.toolbar button'
        ) as NodeListOf<HTMLButtonElement>;
        allButtons.forEach((btn: HTMLButtonElement) => {
            btn.classList.remove('active');
        });
        (e.target as HTMLButtonElement).classList.add('active');
        onItemSelected(item);
    }

    // This is the toolbar component that displays the items that can be selected
    return (
        <div>
            {items.map((item, index) => (
                <button
                    className={'button' + index}
                    key={item}
                    onClick={(e) => handleToolbarClick(e, item)} // Pass 'e' to the function
                    onMouseOver={handleMouseOver}
                >
                    <span className="number">{index + 1}</span> <span className="text">{item}</span>
                </button>
            ))}
        </div>
    );
}

interface EmptydivsProps {
    gridItems: string[][];
    handleGridClick: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        i: number,
        j: number
    ) => void;
    handleGridClickBack: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        i: number,
        j: number
    ) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
}

// This is the main component that renders the grid and handles the grid item clicks and context menu
function Emptydivs({
    gridItems,
    handleGridClick,
    handleGridClickBack,
    onMouseDown,
    onMouseUp,
    onItemSelected,
}: EmptydivsProps & ToolbarProps) {
    const { contextMenu, setContextMenu } = useContext(MyContext);
    const items = useMemo(() => ITEMS, []);

    useEffect(() => {
        document.addEventListener('click', () => setContextMenu({ visible: false, x: 0, y: 0 }));
        return () => {
            document.removeEventListener('click', () =>
                setContextMenu({ visible: false, x: 0, y: 0 })
            );
        };
    }, []);

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        if (contextMenu.visible) {
            setContextMenu({ visible: false, x: 0, y: 0 });
            return;
        }
        setContextMenu({ visible: true, x: event.pageX, y: event.pageY });
    };

    return (
        <div
            className="grid-container-editor"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onContextMenu={handleContextMenu}
        >
            {gridItems.map((row: any[], i: number) => (
                <div key={i} className="grid-row-editor">
                    {row.map((item: any, j: number) => (
                        <div
                            key={j}
                            className={`grid-item-editor ${
                                item.type && item.type !== 'empty'
                                    ? item.type === 'player'
                                        ? 'ground player-down playerwalkdown'
                                        : 'ground ' + item.type
                                    : item.type
                            }`}
                            data-id={item.id}
                            onClick={(e) => handleGridClick(e, i, j)}
                            onMouseOver={(e) => handleGridClick(e, i, j)}
                            onContextMenu={(e) => handleGridClickBack(e, i, j)}
                        >
                            {item.type === 'special' && <div className="specialid">{item.id}</div>}
                            {item.type === 'door' && <div className="specialid">{item.id}</div>}
                        </div>
                    ))}
                </div>
            ))}
            {/* {gridItems.map((row, i) => (
                <div key={i} className="grid-row-editor">
                    {row.map((item, j) => (
                        <div
                            key={j}
                            className={`grid-item-editor ${item}`}
                            onClick={(e) => handleGridClick(e, i, j)}
                            onMouseOver={(e) => handleGridClick(e, i, j)}
                            onContextMenu={(e) => handleGridClickBack(e, i, j)}
                        ></div>
                    ))}
                </div>
            ))} */}
            {contextMenu.visible && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    {items.map((item, index) => (
                        <p key={item} onClick={() => onItemSelected(item)}>
                            <span>{index + 1}</span> {item}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export function MapGenerator() {
    const {
        alias,
        currentPage,
        onPageChange,
        setMapData,
        setIntroDone,
        setMusic,
        wonGame,
        setGameRunning,
        youAreDead,
        youLost,
        setTestingMap,
        setLevel,
        resetGame,
        setWonGame,
    } = useContext(MyContext);
    const [usedDoorIds, setUsedDoorIds] = useState<string[]>([]);
    const [usedSpecialIds, setUsedSpecialIds] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isShiftDown, setIsShiftDown] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [showMapRender, setShowMapRender] = useState(false);

    const [savedMapData, saveMap] = useState<string[][]>([]);

    const { setDisableControls, setGameReady, setMapGeneratorRendering, setSolution, solution } =
        useContext(MyContext);

    // const [mapData, setMapData] = useState<string[][]>([]);
    const [gridItems, setGridItems] = useState(
        Array.from({ length: 10 }, () => new Array(10).fill(''))
    );

    const handleItemSelected = (item: SetStateAction<null>) => {
        // console.log(`Item selected: ${item}`);
        setSelectedItem(item);
    };
    useEffect(() => {
        const handleKeyDown = (e: { key: string }) => {
            if (e.key === 'Shift') {
                setIsShiftDown(true);
            }
        };

        const handleKeyUp = (e: { key: string }) => {
            if (e.key === 'Shift') {
                setIsShiftDown(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        console.log(savedMapData);
    }, [savedMapData]);

    function generateMap(): void {
        const data: { mapdata: string[][]; solution: string[][] } = {
            mapdata: [],
            solution: [],
        };
        let playerAmount = 0;
        let boxAmount = 0;
        let boxIndex = 0;
        let specialBoxIndicator = 0;
        let specialBoxAmount = 0;
        let doorAmount = 0;

        type ClassToSymbol = {
            [key: string]: {
                symbol: string;
                counter?: () => number;
            };
        };

        const classToSymbol: ClassToSymbol = {
            player: { symbol: 'P', counter: () => ++playerAmount },
            box: { symbol: 'B', counter: () => ++boxAmount },
            ground: { symbol: ',' },
            boxindicator: { symbol: 'I', counter: () => ++boxIndex },
            wall: { symbol: '#' },
            specialboxed: { symbol: 'O', counter: () => ++specialBoxIndicator },
            special: { symbol: 'S', counter: () => ++specialBoxAmount },
            door: { symbol: 'D', counter: () => ++doorAmount },
            cracked: { symbol: 'W' },
            mined: { symbol: 'M' },
        };

        gridItems.forEach((row) => {
            const newRow: string[] = [];
            row.forEach((item) => {
                let symbol = '-';
                if (item.type && classToSymbol[item.type]) {
                    symbol = classToSymbol[item.type].symbol;
                    if (classToSymbol[item.type].counter) {
                        if (item.type === 'door' || item.type === 'special') {
                            symbol += item.id; // Append the id to the symbol
                        }
                        classToSymbol[item.type].counter!(); // should null check it
                    }
                }
                newRow.push(symbol);
            });
            data.mapdata.push(newRow);
        });

        saveMap(data.mapdata);
        // console.log(data.mapdata);
    }

    // function saveMapToFile(data: { mapdata: string[][]; solution: string[][] }) {
    //     let hasPlayer = false;
    //     let hasBox = false;
    //     let hasBoxIndicator = false;

    //     for (const row of data.mapdata) {
    //         for (const item of row) {
    //             if (item === 'P') hasPlayer = true;
    //             else if (item === 'B') hasBox = true;
    //             else if (item === 'I') hasBoxIndicator = true;

    //             if (hasPlayer && hasBox && hasBoxIndicator) break;
    //         }
    //     }

    //     if (!hasPlayer || !hasBox || !hasBoxIndicator) {
    //         alert('You must have at least one player, one box, and one box indicator to save the map.');
    //         return;
    //     }

    function saveMapToFile() {
        // Rest of the function remains the same
        // Convert the JSON data to a Blob
        const Solution = solution.map((obj) => ({
            mapdata: obj.mapData,
            direction: obj.direction,
        }));
        const mergedData = {
            alias: alias,
            data: {
                mapdata: savedMapData,
                solution: Solution,
            },
        };
        console.log(mergedData);

        // If solution is an empty array, return early
        if (Solution.length === 0) {
            alert(
                'There was an error storing solution, please retry playing the level again to save the solution for the level.'
            );
            return;
        }

        let isSaving = false;

        function saveJsonToFile(data: any) {
            // Check if saving is already in progress
            if (isSaving) {
                console.log('Save operation is already in progress.');
                return;
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://diam.se/sokoban/src/php/savemap.php');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            const result = JSON.parse(xhr.responseText);
                            if (result.success) {
                                console.log('File saved successfully:', result.file);
                                alert(
                                    'Map has been saved into database. You can now play it, if you have managed to solve all other maps before it, it has been placed as the current last level.'
                                );
                            } else if (result.exist) {
                                alert('This exact map already exist.');
                                return;
                            } else {
                                console.error('Failed to save file:', result.message);
                                return;
                            }
                        } catch (error: any) {
                            console.error('Error parsing response:', error.message);
                        }
                    } else {
                        console.error('Error saving file:', xhr.status);
                    }
                }
            };
            xhr.send(JSON.stringify(data));
        }

        saveJsonToFile(mergedData);

        setTestingMap(false);
        setMusic('create');
        playSound('swoosh', 0.25);
        setShowMapRender(false);
        setMapGeneratorRendering(false);
        setGameReady(false);
    }

    const handleGridClick = (
        e: { stopPropagation: () => void; type: string },
        i: string | number,
        j: string | number
    ) => {
        e.stopPropagation();
        if ((isMouseDown && isShiftDown) || e.type === 'click') {
            const newGridItems = [...gridItems];
            if (selectedItem === 'player') {
                for (const row of newGridItems) {
                    for (let i = 0; i < row.length; i++) {
                        if (row[i].type === 'player') {
                            row[i] = { type: 'ground' };
                            break;
                        }
                    }
                }
            }

            if (selectedItem === 'door' || selectedItem === 'special') {
                const id = prompt('Enter an ID (1-9) for this item:');
                if (id && /^[1-9]$/.test(id)) {
                    if (
                        (selectedItem === 'door' && usedDoorIds.includes(id)) ||
                        (selectedItem === 'special' && usedSpecialIds.includes(id))
                    ) {
                        for (const row of newGridItems) {
                            for (let i = 0; i < row.length; i++) {
                                if (row[i].type === selectedItem && row[i].id === id) {
                                    row[i] = { type: 'empty' };
                                    break;
                                }
                            }
                        }
                    }
                    newGridItems[Number(i)][Number(j)] = { type: selectedItem, id };
                    if (selectedItem === 'door') {
                        setUsedDoorIds([...usedDoorIds, id]);
                    } else {
                        setUsedSpecialIds([...usedSpecialIds, id]);
                    }
                } else {
                    alert('Invalid ID. Please enter a single digit between 1 and 9.');
                }
            } else {
                newGridItems[Number(i)][Number(j)] = { type: selectedItem };
            }
            playSound('add', 0.4);
            setGridItems(newGridItems);
        }
    };

    //dont remove this i to lazy to fix it
    const handleGridClickBack = () => {
        // const handleGridClickBack = (e: { stopPropagation: () => void; preventDefault: () => void; }, i: string | number, j: string | number) => {
        // // e.stopPropagation();
        // // e.preventDefault();
        // // Copy gridItems state
        // const newGridItems = [...gridItems];
        // // Update the class of the clicked grid item
        // // If the grid item is not empty, set it to empty
        // if (newGridItems[i][j] !== '') {
        // 	newGridItems[i][j] = '';
        // }
        // // Update gridItems state
        // setGridItems(newGridItems);
    };

    function testPlayMap() {
        let hasPlayer = false;
        let hasBox = false;
        let hasBoxIndicator = false;

        for (const row of gridItems) {
            for (const item of row) {
                if (item.type === 'player') hasPlayer = true;
                else if (item.type === 'box') hasBox = true;
                else if (item.type === 'boxindicator') hasBoxIndicator = true;

                if (hasPlayer && hasBox && hasBoxIndicator) break;
            }
            if (hasPlayer && hasBox && hasBoxIndicator) break;
        }

        if (!hasPlayer) {
            alert('You must place down a player to save the map.');
            return;
        }
        if (!hasBox) {
            alert('You must place down a box to save the map.');
            return;
        }
        if (!hasBoxIndicator) {
            alert('You must place down a box indicator to save the map.');
            return;
        }

        generateMap();
        generateSymbolArray();
        setLevel(-1);
    }

    const generateSymbolArray = () => {
        const symbolArray = gridItems.map((row) =>
            row.map((item) => {
                // Split the item string by '-' to get the item type and the ID
                const itemType = item.type;
                const id = item.id;

                switch (itemType) {
                    case 'player':
                        return 'P';
                    case 'box':
                        return 'B';
                    case 'ground':
                        return ',';
                    case 'boxindicator':
                        return 'I';
                    case 'wall':
                        return '#';
                    case 'specialboxed':
                        return 'O';
                    case 'special':
                        return 'S' + id;
                    case 'door':
                        return 'D' + id;
                    case 'cracked':
                        return 'W';
                    case 'mined':
                        return 'M';
                    default:
                        return '-';
                }
            })
        );
        setMusic('play');
        setTestingMap(true);
        setDisableControls(false);
        playSound('click', 0.25);
        playSound('levelstart', 0.25);

        setMapData(symbolArray);
        setSolution([]);
        setShowMapRender(true);
        setGameRunning(true);
        setMapGeneratorRendering(true);
        setGameReady(true);
        setIntroDone(false);
    };

    const goBack = () => {
        setTestingMap(false);
        setMusic('create');
        playSound('swoosh', 0.25);
        playSound('click', 0.25);
        setShowMapRender(false);
        setMapGeneratorRendering(false);
        setGameReady(false);
        setWonGame(false);
        // setGameRunning(false);
    };
    const goHome = () => {
        setTestingMap(false);
        setMusic('ui');
        playSound('swoosh', 0.25);
        playSound('click', 0.25);
        setShowMapRender(false);
        setMapGeneratorRendering(false);
        setWonGame(false);
        // setGameRunning(false);
        onPageChange('start');
    };
    useEffect(() => {
        wonGame && setDisableControls(true);
    }, [wonGame]);
    useEffect(() => {
        console.log(solution);
    }, [setDisableControls]);
    const handleClearButton = () => {
        playSound('reverse', 0.3);
        setGridItems(Array.from({ length: 10 }, () => new Array(10).fill('')));
    };

    const handleHelp = () => {
        alert(
            '1. Click on the grid to place items.\n' +
                '2. Use the toolbar/right click or 1-9Num to select an item.\n' +
                '5. Hold Shift to place/draw multiple items.\n' +
                "6. Click the 'Play' icon to test the map and solve it to be able to save it.\n" +
                "7. When completing your test of the map, click 'Save' icon to download the map.\n" +
                "8. In the test play, click 'Back' icon to go back to the map editor.\n" +
                '9. You must have 1 player, 1 or more boxes, and the same amount of box indicators as boxes to save the map.\n'
        );
    };

    function handleReplay() {
        setWonGame(false);
        resetGame();
    }

    return showMapRender ? (
        <>
            {/* < div className="map-render"> */}
            <h1 className="createmapheader">Test</h1>
            <MapRender initialMapData={savedMapData} />
            {wonGame && (
                // <button
                //     className="button"
                //     id="btn-savemap"
                //     onClick={() => saveMapToFile({ mapdata: savedMapData, solution: [] })}
                //     onMouseOver={handleMouseOver}
                // ></button>
                <>
                    <div className="completedtest">
                        <h1>Completed</h1>
                        <h2>You've completed the test level successfully!</h2>
                        <p>
                            Click the save icon to store your solution. The map solution has been
                            recorded, but if you think you can solve the level more efficiently, do
                            replay it to save a better solution. The solution will be stored
                            alongside your level. Occasionally, duplicates are removed, and if any
                            level becomes too easy, it may be omitted. Keep challenging yourself!
                        </p>
                        <button
                            className="button"
                            id="btn-savemap"
                            onClick={saveMapToFile}
                            onMouseOver={handleMouseOver}
                        ></button>
                        <button
                            className="button"
                            id="btn-replay"
                            onClick={handleReplay}
                            onMouseOver={handleMouseOver}
                        ></button>
                    </div>
                    <div id="darkoverlay"></div>
                </>
            )}
            {youAreDead && <h1 className="dead">You are dead</h1>}
            {youLost && <h1 className="dead">You lost</h1>}

            <button
                className="button"
                id="btn-backtoedit"
                onClick={goBack}
                onMouseOver={handleMouseOver}
            ></button>

            <button
                className="button"
                id="btn-home"
                onClick={goHome}
                onMouseOver={handleMouseOver}
            ></button>

            {/* </div> */}
        </>
    ) : (
        <>
            <h1 className="createmapheader">Create</h1>
            {/* <div className="map-generator"> */}
            <button
                className="button"
                id="btn-home"
                onClick={goHome}
                onMouseOver={handleMouseOver}
            ></button>
            <div className="btn-container-top">
                <button
                    className="btn-help"
                    onClick={handleHelp}
                    onMouseOver={handleMouseOver}
                ></button>

                {/* <button className="toggle" onClick={toggleGrid}>
					Toggle Grid
				</button> */}
                <button
                    className="generate-symbol-array"
                    onClick={testPlayMap}
                    onMouseOver={handleMouseOver}
                ></button>
                <div className="toolbar">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Toolbar onItemSelected={handleItemSelected as any} />
                </div>
                <div>
                    <button
                        className="clear-btn"
                        onMouseOver={handleMouseOver}
                        onClick={handleClearButton}
                    >
                        Clear
                    </button>
                </div>
            </div>
            <Emptydivs
                gridItems={gridItems}
                handleGridClick={handleGridClick}
                handleGridClickBack={handleGridClickBack}
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => setIsMouseDown(false)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onItemSelected={handleItemSelected as any}
            />

            {/* </div> */}
        </>
    );
}

// gridItems.forEach((row) => {
//     const columns = row.querySelectorAll('.grid-item-editor');
//     const array: string[] = [];
//     data.mapdata.push(array);
//     columns.forEach((column) => {
//         let symbol;
//         if (column.classList.length <= 1 && column.classList.contains('grid-item-editor')) {
//             symbol = '-';
//         } else if (column.classList.contains('undefined')) {
//             symbol = '-';
//         } else if (column.classList.contains('player-down')) {
//             symbol = 'P';
//             ++playerAmount;
//         } else if (column.classList.contains('box')) {
//             symbol = 'B';
//             ++boxAmount;
//         } else if (column.classList.contains('boxindicator')) {
//             symbol = 'I';
//             ++boxIndicator;
//         } else if (column.classList.contains('wall')) {
//             symbol = '#';
//         } else if (column.classList.contains('cracked')) {
//             symbol = 'W';
//         } else if (column.classList.contains('mined')) {
//             symbol = 'M';
//         } else if (column.classList.contains('specialboxed')) {
//             symbol = 'O';
//             ++specialBoxAmount;
//         } else if (column.classList.contains('special')) {
//             let number = column.getAttribute('data-id');
//             symbol = 'S' + number;
//             ++specialBoxIndicator;
//         } else if (column.classList.contains('door')) {
//             let number = column.getAttribute('data-id');
//             symbol = 'D' + number;
//             ++doorAmount;
//         } else if (column.classList.contains('ground')) {
//             symbol = ',';
//         }
//         if (symbol === undefined) {
//             symbol = '-';
//         }
//         array.push(symbol);
//     });
// });
// saveMap(data.mapdata);

/*
if (playerAmount > 1 || playerAmount === 0) {
    alert('Can/must only have 1 player, please fix...');
    return;
}

if (boxAmount === 0) {
    alert('Must have at least one box, please fix...');
    return;
}

// console.log(boxIndicator, boxAmount);

if (boxIndex === 0 || boxIndex !== boxAmount) {
    alert(
        'You must have the same amount of Box indicators as you have boxes, please fix...'
    );
    return;
}
*/

// const handleGridClick = (
//     e: { stopPropagation: () => void; type: string },
//     i: string | number,
//     j: string | number
// ) => {
//     e.stopPropagation();

//     // Only update the grid item if the mouse button is down and Shift is held, or if it's a click event (not a drag)
//     if ((isMouseDown && isShiftDown) || e.type === 'click') {
//         // Copy gridItems state
//         const newGridItems = [...gridItems];

//         // Update the class of the clicked grid item based on the selected item
//         if (selectedItem === 'door' || selectedItem === 'special' || selectedItem === 'specialboxed') {
//             const id = prompt('Enter an ID (1-9) for this item:');
//             if (id && /^[1-9]$/.test(id)) { // Check if the input is a single digit between 1 and 9
//                 newGridItems[Number(i)][Number(j)] = selectedItem + '-' + id;
//             } else {
//                 alert('Invalid ID. Please enter a single digit between 1 and 9.');
//             }
//         } else {
//             newGridItems[Number(i)][Number(j)] = selectedItem;
//         }
//         console.log(newGridItems);
//         setGridItems(newGridItems);
//     }
// };

// const handleGridClick = (
//     e: { stopPropagation: () => void; type: string },
//     i: string | number,
//     j: string | number
// ) => {
//     e.stopPropagation();

//     // Only update the grid item if the mouse button is down and Shift is held, or if it's a click event (not a drag)
//     if ((isMouseDown && isShiftDown) || e.type === 'click') {
//         // console.log(`Grid item clicked at (${i}, ${j}), placing item ${selectedItem}`);
//         // Copy gridItems state
//         const newGridItems = [...gridItems];

//         // Update the class of the clicked grid item based on the selected item
//         newGridItems[Number(i)][Number(j)] = selectedItem;

//         // Update gridItems state
//         setGridItems(newGridItems);
//     }
// };
