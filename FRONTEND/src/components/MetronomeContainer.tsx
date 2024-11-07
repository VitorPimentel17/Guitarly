import React, { useState, useEffect, useContext } from 'react';
import { CountContext } from '../app';
import { PopupContext } from '../PopupContext'; 
import ResetIcon from '../icons/reset.svg';
import PlayIcon from '../icons/play.svg';
import PauseIcon from '../icons/pause.svg';
import MuteIcon from '../icons/mutemetro.svg';
import VolumeIcon from '../icons/metro.svg';
import LoopIcon from '../icons/loop.svg'; 
import DeleteIcon from '../icons/delete.svg'; 
import UnloopIcon from '../icons/unloop.svg';

interface MetronomeContainerProps {
  toggleMetronome: () => void;
  resetMetronome: () => void;
  isPlaying: boolean;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  rows: number;
  setRows: (rows: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  handleBpmChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleEffect: () => void;
  isEffectActive: boolean; 
  resetToDefault: () => void;  
  toggleNotesPerBeat: () => void;
  notesPerBeatIndex: number; 
}

const MetronomeContainer: React.FC<MetronomeContainerProps> = ({
  toggleMetronome,
  resetMetronome,
  isPlaying,
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  rows,
  setRows,
  bpm,
  setBpm,
  handleBpmChange,
  toggleEffect,
  isEffectActive, 
  resetToDefault,
  toggleNotesPerBeat,
  notesPerBeatIndex, 
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isAnyPopupOpen } = useContext(PopupContext);

  const handleDeleteConfirmation = () => {
    resetToDefault();
    setIsPopupOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnyPopupOpen) { 
        return;
      }

      switch (event.key) {
        case 'r':
          if (!isAnyPopupOpen) {
            resetMetronome();
          }
          break;
        case ' ':
          if (!isAnyPopupOpen) {
            toggleMetronome();
          }
          break;
        case 'm':
          if (!isAnyPopupOpen) {
            setIsMuted(!isMuted);
          }
          break;
        case 'l':
          if (!isAnyPopupOpen) {
            toggleEffect();
          }
          break;
        case 'Delete':
          if (!isAnyPopupOpen) {
            setIsPopupOpen(true);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMuted, resetMetronome, toggleMetronome, toggleEffect, resetToDefault, isAnyPopupOpen]);

  return (
    <div className="metronome-container">
      <div className="metronome-options">
        <button 
          className="metronome-button" 
          id="notesPerBeatButton"
          onClick={toggleNotesPerBeat}
          tabIndex={-1} 
          onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} 
        >
          {notesPerBeatIndex + 1} 
        </button>
        <button 
          className="metronome-button" 
          onClick={resetMetronome}
          tabIndex={-1} 
          onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} 
        >
          <img src={ResetIcon} alt="Reset" />
        </button>
        <button 
          className="metronome-button" 
          onClick={toggleMetronome}
          tabIndex={-1} 
          onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} 
        >
          <img src={isPlaying ? PauseIcon : PlayIcon} alt={isPlaying ? "Pause" : "Play"} />
        </button>
        <button 
          className="metronome-button" 
          onClick={() => setIsMuted(!isMuted)}
          tabIndex={-1} 
          onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} 
        >
          <img src={isMuted ? MuteIcon : VolumeIcon} alt={isMuted ? "Ativar som" : "Silenciar som"} />
        </button>
        <button 
          className="metronome-button" 
          onClick={toggleEffect} 
          tabIndex={-1} 
          onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
        >
          <img src={isEffectActive ? UnloopIcon : LoopIcon} alt={isEffectActive ? "Loop Ativo" : "Loop Inativo"} />
        </button>
        <button 
          className="metronome-button" 
          onClick={() => setIsPopupOpen(true)}
          tabIndex={-1} 
          onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }} 
        >
          <img src={DeleteIcon} alt="Delete"/>
        </button>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirmar Exclusão</h3>
            <p>Você realmente deseja apagar a tablatura atual?</p>
            <button onClick={handleDeleteConfirmation}>Sim</button>
            <button onClick={() => setIsPopupOpen(false)}>Não</button>
          </div>
        </div>
      )}

      <div className="metronome-controls">
        <input
          type="number"
          value={bpm}
          onChange={handleBpmChange}
          onWheel={(e) => {
            if (e.deltaY < 0) {
              setBpm(Math.min(bpm + 1, 208));
            } else {
              setBpm(Math.max(bpm - 1, 20));
            }
          }}
          min="20"
          max="208"
          className="bpm-input"
        />
        <input  
          className="metronome-volume-slider"
          type="range" 
          min="-30" 
          max="30" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))} 
        />
      </div>
    </div>
  );
};

export default MetronomeContainer;