import React, { useContext, useState, useEffect, useRef } from 'react';
import { MyContext } from './../ContextProvider/ContextProvider';
import uiMusic from './../assets/neon-gaming-128925.mp3';
import createMusic from './../assets/penguin_popstar-164715.mp3';
import playMusic from './../assets/synthwave-background-music-155701.mp3';
import playMusic2 from './../assets/risk-136788.mp3';
import playMusic3 from './../assets/thinking-time-148496.mp3';

interface MusicProps {
    audio: string;
}

export const Music: React.FC<MusicProps> = ({ audio }) => {
    const [music, setMusic] = useState<string>(''); // Initialize music state with null
    const { level, isMuted } = useContext(MyContext);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Set the music based on the audio prop
        if (audio === 'ui') {
            setMusic(uiMusic);
        } else if (audio === 'play') {
            const playMusicOptions = [playMusic, playMusic2, playMusic3];
            const index = Math.floor(level / 9) % playMusicOptions.length; // Adjusted for zero-based indexing
            setMusic(playMusicOptions[index]);
        } else if (audio === 'create') {
            setMusic(createMusic);
        }
    }, [audio, level]);

    useEffect(() => {
        // Play music when music state changes
        const musicPlayer = audioRef.current;

        if (music && musicPlayer) {
            musicPlayer.src = music;
            if (isMuted) {
                musicPlayer.volume = 0;
            } else {
                musicPlayer.volume = 0.15;
            }

            musicPlayer.loop = true;
            musicPlayer.play();
        }

        return () => {
            // Cleanup function to pause music when component unmounts
            if (musicPlayer && !musicPlayer.paused) {
                musicPlayer.pause();
            }
        };
    }, [music]);

    return <audio id="music" autoPlay loop ref={audioRef} />;
};
