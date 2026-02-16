import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './components/pages/StartPage';
import CanvasPage from './components/pages/CanvasPage';
import GameLauncher from './components/pages/GameLauncher';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/launch" element={<GameLauncher />} />
        </Routes>
    </BrowserRouter>
);
