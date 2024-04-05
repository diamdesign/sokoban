import { playSound } from './../components/playSound';
import { useContext } from 'react';
import { MyContext } from '../ContextProvider/ContextProvider';

export function Api() {
    const { setGameReady, setMusic, alias, setAlias, currentPage, onPageChange } =
        useContext(MyContext);
    const handleBackClick = () => {
        onPageChange('selectlevel');
        playSound('click', 0.25);
        playSound('swoosh', 0.15);
    };

    function handleMouseOver() {
        playSound('hover', 0.15);
    }

    return (
        <>
            <div id="selectlevel">
                <h1>API</h1>
                <div id="credits">
                    <h2>Creators</h2>
                    <p>
                        If you want to build your own Sokoban game, you are allowed to use our maps.
                        Just mention us and link to this game. Below is information on how you get
                        the data for the maps and highscores.
                    </p>
                    <br />
                    <h2>Levels</h2>
                    <h4>
                        <a href="https://diam.se/sokoban/src/php/getmap.php?page=1" target="_blank">
                            <strong>https://diam.se/sokoban/src/php/getmap.php?page=1</strong>
                        </a>
                    </h4>

                    <p>To get pagnation of 20 levels per page, with a total count of all maps.</p>
                    <br />
                    <h4>
                        <a
                            href="https://diam.se/sokoban/src/php/getmap.php?level=1"
                            target="_blank"
                        >
                            <strong>https://diam.se/sokoban/src/php/getmap.php?level=1</strong>
                        </a>
                    </h4>

                    <p>To get only get a specific level.</p>

                    <h2>Highscores</h2>
                    <h4>
                        <a
                            href="https://diam.se/sokoban/src/php/gethighscore.php?level=1"
                            target="_blank"
                        >
                            <strong>
                                https://diam.se/sokoban/src/php/gethighscore.php?level=1
                            </strong>
                        </a>
                    </h4>

                    <p>To get the 10 highest scores of each level.</p>
                </div>

                <div id="menubuttons">
                    <div
                        id="btn-levels"
                        className="button"
                        onClick={handleBackClick}
                        onMouseOver={handleMouseOver}
                    ></div>
                </div>
            </div>
        </>
    );
}
