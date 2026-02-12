import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './components/pages/StartPage';
import CanvasPage from './components/pages/CanvasPage';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
        </Routes>
    </BrowserRouter>
);
