import { useContext, useEffect, useState } from "react";

import { MyContext } from "../ContextProvider/ContextProvider";
import { formatElapsedTime } from "../utils/TimeUtils";
import { playSound } from "./../components/playSound";

export function Highscore() {
	const [highestScores, setHighestScores] = useState<{
		[level: string]: { score: number; elapsedTime: number };
	}>({});

	const { setMapData, setBoxPositions, setPlayerPosition, initialMapData, resetGame, initialPlayerPosition, initialBoxPositions } = useContext(MyContext);


	useEffect(() => {
		const storedScores = localStorage.getItem("highestScores");
		if (storedScores) {
			setHighestScores(JSON.parse(storedScores));
		}
	}, []); // Empty dependency array to run the effect only once

	function handleMouseOver() {
		playSound("hover", 0.15);
	}

	function handleReplay() {
		playSound("click", 0.25);
		playSound("levelstart", 0.5);
		setMapData(initialMapData);
		setPlayerPosition(initialPlayerPosition);
		setBoxPositions(initialBoxPositions);
		resetGame();
		
	}
	function handleNextLevel() {
		playSound("click", 0.25);
		playSound("levelstart", 0.5);
	}
	return (
		<>
			<div id="highscore">
				<h1>Completed</h1>
				<h2>Level 1</h2>
				<h2>High Score</h2>
				<div className="showhighscore">
					<div className="result">
						<div className="row thead">
							<div>Level</div>
							<div>Steps</div>
							<div>Time</div>
						</div>
					</div>
				</div>
				{Object.keys(highestScores).map((level, index) => (
					<div key={index} className="showhighscore">
						<div className="result">
							<div className="row">
								<div>{level}</div>
								<div>{highestScores[level].score}</div>
								<div>
									{formatElapsedTime(highestScores[level].elapsedTime)}
								</div>{" "}
							</div>
						</div>
					</div>
				))}
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
