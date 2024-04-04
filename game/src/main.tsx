import './index.css';

import App from './App.tsx';
import { GameContextProvider } from './ContextProvider/ContextProvider.tsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <HashRouter>
        <React.StrictMode>
            <GameContextProvider>
                <App />
            </GameContextProvider>
        </React.StrictMode>
    </HashRouter>
);
