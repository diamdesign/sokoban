import { useState } from "react";
import { StartPageUI } from "./pages/StartPageUI";
import { SelectLevel } from "./pages/SelectLevel";
import { Music } from "./components/Music";
import musicSong from "./assets/neon-gaming-128925.mp3";
import "./App.css";

type Page = "start" | "selectlevel";

function App() {
	console.log("----SOKOBAN----");

	const [currentPage, setCurrentPage] = useState("start");

	const handlePageChange = (page: Page) => {
		setCurrentPage(page);
	};

	return (
		<>
			{/* Music Player */}
			<Music audio={musicSong} />

			{/* StartPage UI */}
			{currentPage === "start" && <StartPageUI onPageChange={handlePageChange} />}

			{/* Select Level */}
			{currentPage === "selectlevel" && <SelectLevel onPageChange={handlePageChange} />}
		</>
	);
}

export default App;
