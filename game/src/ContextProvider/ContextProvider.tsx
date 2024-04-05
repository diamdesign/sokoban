import { Dispatch, SetStateAction, createContext, useState } from 'react';

interface PlayerPosition {
    x: number;
    y: number;
}

interface BoxPosition {
    x: number;
    y: number;
}

type PlayedMap = {
    mapId: number;
    score: number;
    elapsedTime: number;
};

interface HistoryState {
    mapData: string[][];
    playerPosition: { x: number; y: number };
    boxPositions: { x: number; y: number }[];
    counter: number;
    direction: string;
}

export interface TokensMap {
    [level: number]: number;
}

interface SolutionState {
    mapData: string[][];
    direction: string;
}
interface GameContextProps {
    mapFiles: string[][];
    setMapFiles: (mapFiles: string[][]) => void;
    currentPage: string;
    onPageChange: (currentPage: string) => void;
    alias: string;
    setAlias: (alias: string) => void;
    testingMap: boolean;
    setTestingMap: (testingMap: boolean) => void;
    mapGeneratorRendering: boolean;
    setMapGeneratorRendering: (mapGeneratorRendering: boolean) => void;
    gameReady: boolean;
    setGameReady: (gameReady: boolean) => void;
    introDone: boolean;
    setIntroDone: (introDone: boolean) => void;
    disableControls: boolean;
    setDisableControls: (disableControls: boolean) => void;
    // totalToken: number;
    // setTotalToken: (totalToken: number) => void;
    totalToken: number;
    setTotalToken: Dispatch<SetStateAction<number>>;
    playedMaps: { mapId: number; score: number; elapsedTime: number }[];
    setPlayedMaps: (playedMaps: { mapId: number; score: number; elapsedTime: number }[]) => void;
    youAreDead: boolean;
    setYouAreDead: (youAreDead: boolean) => void;
    youLost: boolean;
    setYouLost: (youLost: boolean) => void;
    wonGame: boolean;
    setWonGame: (wonGame: boolean) => void;
    settings: boolean;
    toggleSettings: (settings: boolean) => void;
    counter: number;
    setCounter: (counter: number) => void;
    elapsedTime: number;
    setElapsedTime: (elapsedTime: number) => void;
    resetGame: () => void;
    mapData: string[][];
    setMapData: (mapData: string[][]) => void;
    boxPositions: { x: number; y: number }[];
    setBoxPositions: (boxPositions: { x: number; y: number }[]) => void;
    playerPosition: { x: number; y: number };
    setPlayerPosition: (playerPosition: { x: number; y: number }) => void;
    indicatorPositions: { x: number; y: number }[];
    setIndicatorPositions: (indicatorPositions: { x: number; y: number }[]) => void;
    initialMapData: string[][];
    setInitialMapData: (initialMapData: string[][]) => void;
    initialPlayerPosition: PlayerPosition;
    setInitialPlayerPosition: (position: PlayerPosition) => void;
    initialBoxPositions: BoxPosition[];
    setInitialBoxPositions: (positions: BoxPosition[]) => void;
    initialSpecialBox: { x: number; y: number }[];
    setInitialSpecialBox: (specialBox: { x: number; y: number }[]) => void;
    level: number;
    setLevel: (level: number) => void;
    music: string;
    setMusic: (music: string) => void;
    startTime: Date | null;
    setStartTime: (startTime: Date | null) => void;
    gameRunning: boolean;
    setGameRunning: (gameRunning: boolean) => void;
    isMuted: boolean;
    setMuted: (setMuted: boolean) => void;
    showGameContainer: boolean;
    setShowGameContainer: (setShowGameContainer: boolean) => void;
    highestScores: {
        [level: string]: { score: number; elapsedTime: number };
    };
    // setHighestScores: (highestScores: {
    //     [level: string]: { score: number; elapsedTime: number };
    // }) => void;
    // stet distpatch and setstateaction
    setHighestScores: Dispatch<
        SetStateAction<{
            [level: string]: { score: number; elapsedTime: number };
        }>
    >;
    handleHistory: boolean;
    setHandleHistory: (handleHistory: boolean) => void;
    playerDirection: string;
    setPlayerDirection: (playerDirection: string) => void;
    history: HistoryState[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>;
    solution: SolutionState[];
    setSolution: React.Dispatch<React.SetStateAction<SolutionState[]>>;
    contextMenu: { visible: boolean; x: number; y: number };
    setContextMenu: (contextMenu: { visible: boolean; x: number; y: number }) => void;
    playerGroundFloor: string;
    setPlayerGroundFloor: (groundFloor: string) => void;
    boxGroundFloor: string;
    setBoxGroundFloor: (boxGroundFloor: string) => void;
    selectedPosition: { x: number; y: number } | null;
    setSelectedPosition: (selectedPosition: { x: number; y: number } | null) => void;
    collectedTokens: TokensMap;
    setCollectedTokens: (collectedTokens: TokensMap) => void;
    specialBox: { x: number; y: number }[];
    setSpecialBox: (specialbox: { x: number; y: number }[]) => void;
    specialBoxIndicator: { x: number; y: number }[];
    setSpecialBoxIndicator: (specialBoxIndicator: { x: number; y: number }[]) => void;
    specialDoor: { x: number; y: number }[];
    setSpecialDoor: (specialDoor: { x: number; y: number }[]) => void;
}

interface ChildrenProps {
    children: React.ReactNode;
}

export const MyContext = createContext({} as GameContextProps);

export const GameContextProvider = ({ children }: ChildrenProps) => {
    const [mapFiles, setMapFiles] = useState([]);
    const [currentPage, onPageChange] = useState<string>('start');
    const [alias, setAlias] = useState(localStorage.getItem('playerName') || null);
    const [testingMap, setTestingMap] = useState<boolean>(false);
    const [mapGeneratorRendering, setMapGeneratorRendering] = useState<boolean>(false);
    const [gameReady, setGameReady] = useState<boolean>(false);
    const [introDone, setIntroDone] = useState<boolean>(false);
    const [disableControls, setDisableControls] = useState<boolean>(false);
    const [youAreDead, setYouAreDead] = useState<boolean>(false);
    const [youLost, setYouLost] = useState<boolean>(false);
    const [counter, setCounter] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [wonGame, setWonGame] = useState<boolean>(false);
    const [mapData, setMapData] = useState<string[][]>([[]]);
    const [boxPositions, setBoxPositions] = useState<{ x: number; y: number }[]>([]);
    const [playerPosition, setPlayerPosition] = useState<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });
    const [indicatorPositions, setIndicatorPositions] = useState<{ x: number; y: number }[]>([]);
    const [initialMapData, setInitialMapData] = useState<string[][]>([[]]);
    const [initialPlayerPosition, setInitialPlayerPosition] = useState<PlayerPosition>({
        x: 0,
        y: 0,
    });
    const [initialBoxPositions, setInitialBoxPositions] = useState<BoxPosition[]>([]);
    const [initialSpecialBox, setInitialSpecialBox] = useState<{ x: number; y: number }[]>([]);
    const [level, setLevel] = useState<number>(0);
    const [music, setMusic] = useState<string>('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [gameRunning, setGameRunning] = useState<boolean>(false);
    const [isMuted, setMuted] = useState<boolean>(false);
    const [settings, toggleSettings] = useState<boolean>(false);
    const [showGameContainer, setShowGameContainer] = useState<boolean>(false);
    const [playedMaps, setPlayedMaps] = useState<PlayedMap[]>([]);
    const [highestScores, setHighestScores] = useState<{
        [level: string]: { score: number; elapsedTime: number };
    }>({});
    const [handleHistory, setHandleHistory] = useState<boolean>(false);
    const [playerDirection, setPlayerDirection] = useState<string>('down');
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [solution, setSolution] = useState<HistoryState[]>([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [totalToken, setTotalToken] = useState<number>(0);
    const [playerGroundFloor, setPlayerGroundFloor] = useState('ground');
    const [boxGroundFloor, setBoxGroundFloor] = useState('ground');
    const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
    const [collectedTokens, setCollectedTokens] = useState<{ [level: number]: number }>({});
    const [specialBox, setSpecialBox] = useState<{ x: number; y: number }[]>([]);
    const [specialBoxIndicator, setSpecialBoxIndicator] = useState<{ x: number; y: number }[]>([]);
    const [specialDoor, setSpecialDoor] = useState<{ x: number; y: number }[]>([]);

    const resetGame = () => {
        setCounter(0);
        setElapsedTime(0);
        setWonGame(false);
        setYouAreDead(false);
        setYouLost(false);
        setMapData(initialMapData);
        setMusic('play');
        setStartTime(new Date());
        setGameRunning(false);
        setPlayerPosition(initialPlayerPosition);
        setBoxPositions(initialBoxPositions);
        setSpecialBox(initialSpecialBox);
        setPlayerDirection('down');
        setHistory([]);
        setSolution([]);
        setPlayerGroundFloor('ground');
        setBoxGroundFloor('ground');
        setIntroDone(false);
        setDisableControls(false);
    };

    const value: GameContextProps = {
        mapFiles: mapFiles,
        setMapFiles: setMapFiles,
        currentPage: currentPage,
        onPageChange: onPageChange,
        alias: alias || '',
        setAlias: setAlias,
        testingMap: testingMap,
        setTestingMap: setTestingMap,
        mapGeneratorRendering: mapGeneratorRendering,
        setMapGeneratorRendering: setMapGeneratorRendering,
        introDone: introDone,
        setIntroDone: setIntroDone,
        gameReady: gameReady,
        setGameReady: setGameReady,
        disableControls: disableControls,
        setDisableControls: setDisableControls,
        playedMaps: playedMaps,
        setPlayedMaps: setPlayedMaps,
        totalToken: totalToken,
        setTotalToken: setTotalToken,
        youLost: youLost,
        setYouLost: setYouLost,
        youAreDead: youAreDead,
        setYouAreDead: setYouAreDead,
        counter: counter,
        setCounter: setCounter,
        elapsedTime: elapsedTime,
        setElapsedTime: setElapsedTime,
        wonGame: wonGame,
        setWonGame: setWonGame,
        resetGame: resetGame,
        mapData: mapData,
        setMapData: setMapData,
        boxPositions: boxPositions,
        setBoxPositions: setBoxPositions,
        playerPosition: playerPosition,
        setPlayerPosition: setPlayerPosition,
        indicatorPositions: indicatorPositions,
        setIndicatorPositions: setIndicatorPositions,
        initialMapData: initialMapData,
        setInitialMapData: setInitialMapData,
        initialPlayerPosition: initialPlayerPosition,
        setInitialPlayerPosition: setInitialPlayerPosition,
        initialBoxPositions: initialBoxPositions,
        setInitialBoxPositions: setInitialBoxPositions,
        initialSpecialBox: initialSpecialBox,
        setInitialSpecialBox: setInitialSpecialBox,
        level: level,
        setLevel: setLevel,
        music: music,
        setMusic: setMusic,
        startTime: startTime,
        setStartTime: setStartTime,
        gameRunning: gameRunning,
        setGameRunning: setGameRunning,
        isMuted: isMuted,
        setMuted: setMuted,
        settings: settings,
        toggleSettings: toggleSettings,
        showGameContainer: showGameContainer,
        setShowGameContainer: setShowGameContainer,
        highestScores: highestScores,
        setHighestScores: setHighestScores,
        handleHistory: handleHistory,
        setHandleHistory: setHandleHistory,
        playerDirection: playerDirection,
        setPlayerDirection: setPlayerDirection,
        history: history,
        setHistory: setHistory,
        solution: solution,
        setSolution: setSolution as Dispatch<SetStateAction<SolutionState[]>>,
        contextMenu: contextMenu,
        setContextMenu: setContextMenu,
        playerGroundFloor: playerGroundFloor,
        setPlayerGroundFloor: setPlayerGroundFloor,
        boxGroundFloor: boxGroundFloor,
        setBoxGroundFloor: setBoxGroundFloor,
        selectedPosition: selectedPosition,
        setSelectedPosition: setSelectedPosition,
        collectedTokens: collectedTokens,
        setCollectedTokens: setCollectedTokens,
        specialBox: specialBox,
        setSpecialBox: setSpecialBox,
        specialBoxIndicator: specialBoxIndicator,
        setSpecialBoxIndicator: setSpecialBoxIndicator,
        specialDoor: specialDoor,
        setSpecialDoor: setSpecialDoor,
    };

    return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
