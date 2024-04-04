import { SelectPageProps } from './../components/InterfacePages';
import { playSound } from './../components/playSound';

export function Credits({ onPageChange }: SelectPageProps) {
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
                <h1>Credits</h1>
                <div id="credits">
                    <p>
                        <strong>Phoneix</strong> was the name of the group at{' '}
                        <strong>Lexicon React course 2024 (Sweden)</strong>, where we got the task
                        to make the Sokoban game in React. Hope you enjoy it and go make some maps
                        for others to play.
                    </p>
                    <h2>Graphics</h2>
                    <h4>
                        <a
                            href="https://opengameart.org/content/sokoban-100-tiles"
                            target="_blank"
                            onMouseOver={handleMouseOver}
                        >
                            Kenny
                        </a>
                    </h4>
                    <h2>Sound</h2>
                    <h4>
                        <a href="https://pixabay.com/" onMouseOver={handleMouseOver}>
                            Pixabay
                        </a>
                    </h4>
                    <h2>HTML, CSS, React</h2>
                    <h5>
                        <a href="https://diam.se" target="_blank" onMouseOver={handleMouseOver}>
                            Fredrik Berglund
                        </a>
                    </h5>

                    <h5><a href="https://github.com/Cloticc" target="_blank" onMouseOver={handleMouseOver}>
                            Andreas Isidorsson
                        </a></h5>
                    <h5><a href="https://www.linkedin.com/in/alireza-kt/" target="_blank" onMouseOver={handleMouseOver}>
                            Alireza Kafshdartoosi
                        </a></h5>
                    <h5>Abbas Mansoori</h5>
                    <h5>Konstantios (Had to leave early)</h5>
                    <br />
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
