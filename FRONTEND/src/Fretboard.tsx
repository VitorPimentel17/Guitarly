import React, { useContext, useEffect, useState } from 'react';
import { CountContext } from './app'; 
import audioManager from './AudioManager';
import styled from 'styled-components';



const TuningString = ["E4", "B3", "G3", "D3", "A2", "E2", "B1", "F#1"]; 
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]; 

function generateArrayNote(n: number) {
    const array = [];
    let add = 0;
    for (let i = 0; i < n; i++) {
        if (i % 26 === 0) {
            add += 100;
        }
        let valor = i % 26;
        array.push(add + valor);
    }
    return array;
}

const ResponsiveContainer = styled.div`
  font-size: 100%; /* 1rem = 16px; 16px/16px = 100% */

  @media only screen and (min-width: 2560px) {
    font-size: 112.5%; /* 1rem = 18px; 18px/16px = 112.5% */
  }

  @media only screen and (min-width: 1920px) and (max-width: 2559px) {
    font-size: 100%; /* 1rem = 16px; 16px/16px = 100% */
  }

  @media only screen and (min-width: 1366px) and (max-width: 1919px) {
    font-size: 87.5%; /* 1rem = 14px; 14px/16px = 87.5% */
  }

  @media only screen and (min-width: 1280px) and (max-width: 1365px) {
    font-size: 81.25%; /* 1rem = 13px; 13px/16px = 81.25% */
  }

  @media only screen and (min-width: 1024px) and (max-width: 1279px) {
    font-size: 75%; /* 1rem = 12px; 12px/16px = 75% */
  }
`;

const Fretboard = () => {
    const { rows, setRows, count, setCount, tabValues, setTabValues, selectedColumn } = useContext(CountContext);
    const [volume, setVolume] = useState(-10); 
    const columns = 26;
    const items = generateArrayNote(rows * columns);


    const handleButtonClick = (id: string) => {
        setTabValues((prevTabValues: string[][]) => {
            const newTabValues = [...prevTabValues];
            const stringIndex = parseInt(id.charAt(0)) - 1; 
            const fretIndex = parseInt(id.slice(1)); 

            while (newTabValues.length <= stringIndex) {
                newTabValues.push(Array(columns).fill('-'));
            }

            while (newTabValues[stringIndex].length <= selectedColumn) {
                newTabValues[stringIndex].push('-');
            }

            if (stringIndex >= 0 && stringIndex < newTabValues.length && fretIndex >= 0) {
                newTabValues[stringIndex] = newTabValues[stringIndex].map((value, colIndex) => {
                    if (colIndex === selectedColumn) {
                        const tuningNote = TuningString[stringIndex].slice(0, -1); 
                        const tuningOctave = parseInt(TuningString[stringIndex].slice(-1)); 
                        const noteIndex = notes.indexOf(tuningNote); 
                        const newNoteIndex = (noteIndex + fretIndex) % notes.length;
                        const octaveAdjustment = Math.floor((noteIndex + fretIndex) / notes.length); 
                        const noteToPlay = notes[newNoteIndex] + (tuningOctave + octaveAdjustment); 

                        audioManager.playNote(noteToPlay);
                        return `${fretIndex}`;
                    }
                    return value;
                });
            }
            return newTabValues;
        });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
            return; //
        }

        if (event.key === 'Backspace') {
            setTabValues((prevTabValues: string[][]) => {
                const newTabValues = prevTabValues.map((stringArray) => {
                    return stringArray.map((value, colIndex) => colIndex === selectedColumn ? '-' : value);
                });
                return newTabValues;
            });
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
        audioManager.setVolume(newVolume); 
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedColumn]);

    const generateStrings = (rows: number) => {
        const positions = Array.from({ length: rows }, (_, i) => `${((i + 1) / (rows + 1)) * 100}%`);
        return positions.map((position, index) => (
            <line key={index} x1="0" y1={position} x2="100%" y2={position} stroke="#888" strokeWidth="5" />
        ));
    };

    return (
        <ResponsiveContainer>
            <div style={{ position: 'fixed', bottom: 0, width: '100%', borderTop: '0.2rem solid #111', background: 'linear-gradient(to right, #3e3e3e 0%, #222 30%, #222 82%, #3e3e3e 93%)', zIndex: 1000, display: 'fixed', justifyContent: 'space-between' }}>
                <div className="hidden-dropdown">
                    <select className="button" style={{ borderRadius: "2rem", marginBottom: "1rem", width: "20rem", height: "2rem" }} onChange={(e) => setRows(Number(e.target.value))}>
                        <option className="button" value="6">Standard Guitar</option>
                        <option className="button" value="7">7-String Guitar</option>
                        <option className="button" value="8">8-String Guitar</option>
                    </select>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                    <div className="string-label-container" style={{ '--rows': rows }}>
                        {TuningString.slice(0, rows).map((tuning, index) => (
                            <div key={index} className="string-label">{tuning}</div>
                        ))}
                    </div>
                    <div>
                        <div className="fret-numbers">
                            {Array.from({ length: columns }, (_, i) => (
                                <div key={i} className="fret-number">{i}</div>
                            ))}
                        </div>
                        <div className="container"  style={{'--rows':rows}}>
                            <svg viewBox="0 0 1300 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ position: 'absolute', zIndex: 0, width: '98.8%', height: '100%', borderLeft: '0.105rem solid #ccc', borderRight: '0.105rem solid #ccc' }}>
                                <rect width="100%" height="100%" fill="#1e1e1e" />
                                {Array.from({ length: 26 }, (_, i) => (
                                    <line key={i} x1={`${(i + 1) * 3.85}%`} y1="0" x2={`${(i + 1) * 3.85}%`} y2="100%" stroke="#ccc" strokeWidth="2" />
                                ))}
                                {generateStrings(rows)}
                            </svg>
                            {items.map((item, i) => {
                                const stringIndex = Math.floor(i / 26); 
                                const fretIndex = i % 26; 

                                const tuningNote = TuningString[stringIndex].slice(0, -1);
                                const tuningOctave = parseInt(TuningString[stringIndex].slice(-1));

                                const noteIndex = notes.indexOf(tuningNote);
                                const newNoteIndex = (noteIndex + fretIndex) % notes.length;
                                const octaveAdjustment = Math.floor((noteIndex + fretIndex) / notes.length);

                                const noteLabel = notes[newNoteIndex];
                                const octaveLabel = tuningOctave + octaveAdjustment;

                                const id = `${stringIndex + 1}${String(fretIndex).padStart(4, '0')}`; 
                                return (
                                    <div key={i} className={`item item-${i}`} style={{ position: 'relative', zIndex: 1 }}>
                                        <button 
                                            onClick={() => {
                                                setCount(count + 1);
                                                console.log(`${item}`);
                                                handleButtonClick(id); 
                                            }} 
                                            className="button" 
                                            style={{ width: "100%", height: "100%" }} 
                                            tabIndex={-1} 
                                            onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} 
                                        >
                                            <span className="note-label">{noteLabel}{octaveLabel}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="column-numbers">
                        {Array.from({ length: columns }, (_, columnIndex) => (
                            <div key={columnIndex} className="column-number">{columnIndex}</div>
                        ))}
                    </div>
                </div>
            </div>
        </ResponsiveContainer>
    );
};

export default Fretboard;