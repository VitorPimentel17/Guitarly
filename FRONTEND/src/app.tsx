import { createRoot } from 'react-dom/client';
import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import TabFretboard from './TabFretboard';
import { AuthProvider } from './auth/AuthContext';
import { PopupProvider } from './PopupContext';

const container = document.createElement('div');
container.id = 'app-root';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<App />);

export const CountContext = createContext(null);

function App() {
    return (
        <AuthProvider>
            <PopupProvider>
                <Router>
                    <AppContent />
                </Router>
            </PopupProvider>
        </AuthProvider>
    );
}

function AppContent() {
    const authToken = localStorage.getItem('authToken');
    if (authToken !== null) {
        
    }

    const [columns, setColumns] = useState(10);
    const [count, setCount] = useState(0);
    const [rows, setRows] = useState(6);
    const [selectedColumn, setSelectedColumn] = useState(1);
    const [hoveringColumn, setHoveringColumn] = useState(undefined as string | undefined);
    const [tabValues, setTabValues] = useState(Array.from({ length: 8 }, () => generateArray(columns)));
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(-10);
    const [notesPerBeatIndex, setNotesPerBeatIndex] = useState(0);
    const location = useLocation();

    const toggleMetronome = () => {
        setIsPlaying(!isPlaying);
    };

    const resetMetronome = () => {
        setIsPlaying(false);
        setSelectedColumn(1);
    };

    const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBpm(Number(event.target.value));
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(event.target.value));
    };

    useEffect(() => {
        setIsPlaying(false);
    }, [location]);

    return (
        <CountContext.Provider value={{ columns, setColumns, rows, setRows, count, setCount, hoveringColumn, setHoveringColumn, selectedColumn, setSelectedColumn, tabValues, setTabValues, bpm, setBpm, isPlaying, setIsPlaying, isMuted, setIsMuted, volume, setVolume, toggleMetronome, resetMetronome, handleBpmChange, handleVolumeChange }}>
            <div className="bg-cover"></div>
            <div>
                <Navbar />
                <div style={{ paddingTop: '3.75rem' }}> {}
                    <Routes>
                        <Route path="/" element={<TabFretboard />} /> {}

                    </Routes>
                </div>
            </div>
        </CountContext.Provider>
    );
}

function generateArray(n: number) {
    const array = [];
    for (let i = 0; i < n; i++) {
        array.push('-');
    }
    return array;
}

export default App;