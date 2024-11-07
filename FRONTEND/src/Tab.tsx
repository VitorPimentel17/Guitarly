import React, { useContext, useLayoutEffect, useEffect, useState } from 'react';
import { CountContext } from './app';
import * as Tone from 'tone';
import audioManager from './AudioManager';
import logo from './pics/logo.png';
import metronomeSound from '/src/audio/Metronome.mp3';
import { useLocation } from 'react-router-dom'; 
import { usePopup, PopupContext } from './PopupContext';
import { useAuth } from './auth/AuthContext';
import styled from 'styled-components';
import MetronomeContainer from './components/MetronomeContainer';
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const tuningStrings = ["E4", "B3", "G3", "D3", "A2", "E2", "B1", "F#1"];
const TuningString: string[] = ["E", "B", "G", "D", "A", "E", "B", "F#"];

const generateArray = (length: number): string[] => Array(length).fill('-');

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
`;

const ButtonColumns = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ResponsiveContainer = styled.div`
  font-size: 100%;

  @media only screen and (min-width: 2560px) {
    font-size: 112.5%;
  }

  @media only screen and (min-width: 1920px) and (max-width: 2559px) {
    font-size: 100%;
  }

  @media only screen and (min-width: 1366px) and (max-width: 1919px) {
    font-size: 87.5%;
  }

  @media only screen and (min-width: 1280px) and (max-width: 1365px) {
    font-size: 81.25%;
  }

  @media only screen and (min-width: 1024px) and (max-width: 1279px) {
    font-size: 75%;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
`;

const DEFAULT_COLUMNS = 10; 
const DEFAULT_ROWS = 6; 
const DEFAULT_TAB_VALUES = Array.from({ length: DEFAULT_ROWS }, () => Array(DEFAULT_COLUMNS).fill('-')); 


const Tab: React.FC = () => {    const [columns, setColumns] = useState(13);
  const {  rows, setRows, hoveringColumn, setHoveringColumn, selectedColumn, setSelectedColumn, tabValues, setTabValues } = useContext(CountContext);
    const { isLoggedIn, user } = useAuth();
    const { isLoginPopupOpen, setIsLoginPopupOpen, isRegisterPopupOpen, setIsRegisterPopupOpen, isPostPopupOpen, setIsPostPopupOpen, isExportPopupOpen, setIsExportPopupOpen } = usePopup();

  const [tabName, setTabName] = useState<string>('');
  const [artistName, setArtistName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [copiedColumn, setCopiedColumn] = useState<string[] | null>(null);
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<Tone.Loop | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [metronomeVolume, setMetronomeVolume] = useState<number>(-10);
  const [volume, setVolume] = useState<number>(-10);
  const [checkboxes, setCheckboxes] = useState({
    exercicio: false,
  });

  const [isExercise, setIsExercise] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<number>(0); 
  const resetToDefault = () => {
    setColumns(DEFAULT_COLUMNS);
    setRows(DEFAULT_ROWS);
    setTabValues(DEFAULT_TAB_VALUES);
    setBpm(120); 
    setTabName('');
    setArtistName('');
    setCheckboxes({
        exercicio: false,
    });
};

  const [lastTabName, setLastTabName] = useState<string>('');
  const [lastArtistName, setLastArtistName] = useState<string>('');
  const [lastCheckboxes, setLastCheckboxes] = useState({
    exercicio: false,
  });
  const { isAnyPopupOpen } = useContext(PopupContext); 

  const [isEffectActive, setIsEffectActive] = useState<boolean>(true);

  const toggleEffect = () => {
    setIsEffectActive((prev) => !prev);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (isValidTabFile(json)) {
            importTab(json);
          } else {
            alert('Arquivo inválido. Por favor, envie um arquivo no formato correto.');
          }
        } catch (error) {
          alert('Erro ao ler o arquivo. Por favor, envie um arquivo JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const isValidTabFile = (json: any) => {
    return (
      json &&
      Array.isArray(json.tabValues) &&
      typeof json.tabName === 'string' &&
      typeof json.artistName === 'string' && json.artistName.length <= 50 &&
      typeof json.columns === 'number' &&
      typeof json.rows === 'number' && json.rows >= 6 && json.rows <= 8 &&
      typeof json.bpm === 'number' && json.bpm >= 20 && json.bpm <= 208 &&
      typeof json.notesPerBeatIndex === 'number' && json.notesPerBeatIndex >= 0 && json.notesPerBeatIndex <= 3
    );
  };

  const importTab = (json: any) => {
    setColumns(json.columns);
    setBpm(json.bpm);
    setRows(json.rows);
    setTabValues(json.tabValues);
    setTabName(json.tabName);
    setArtistName(json.artistName);
    setNotesPerBeatIndex(json.notesPerBeatIndex);
  };

  useLayoutEffect(() => {
    setTabValues((prevTabValues: string[][]) => {
      if (prevTabValues.length === rows && prevTabValues[0]?.length === columns) {
        return prevTabValues;
      }

      const newTabValues = Array(rows).fill(null).map((_, rowIndex) => {
        const existingRow = prevTabValues[rowIndex] || [];
        return Array(columns).fill('-').map((_, colIndex) => existingRow[colIndex] || '-');
      });

      return newTabValues;
    });
  }, [columns, rows]);
  const exportTab = () => {
    const data = JSON.stringify({ columns, bpm, rows, tabValues, tabName: lastTabName, artistName: lastArtistName, notesPerBeatIndex}); 
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${lastTabName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const stylegridtab: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1.25rem)`,
    textAlign: 'center',
    gridTemplateRows: `repeat(${rows}, 1.3125rem)`,
    borderLeft: "0.125rem solid",
    borderRight: "0.125rem solid",
    paddingBottom: "0.75rem",
    position: 'relative',
    left: '0',
  };

  useEffect(() => {
    const player = new Tone.Player(metronomeSound).toDestination();
    player.volume.value = metronomeVolume;

    const playClick = () => {
      
      if (!isMuted) {
        player.start();
      }
    };

    const newLoop = new Tone.Loop(playClick, (60 / bpm)).start(0);
    setLoop(newLoop);

    return () => {
      newLoop.stop();
    };
  }, [bpm, isMuted, columns, setSelectedColumn, metronomeVolume]);

  const toggleMetronome = () => {
    if (selectedColumn === columns - 1) {
        resetMetronome();
        setIsPlaying(true); 
    } else {
        if (isPlaying) {
            Tone.Transport.stop();
            loop?.stop();
            stopAnimation();
        } else {
          switch (notesPerBeatIndex) {
            case 1: 
                if (selectedColumn % 2 !== 0 + 1) {
                    const newColumn = selectedColumn - 1;
                    if (newColumn <= selectedColumn) setSelectedColumn(newColumn); 
                }
                break; 
            case 2:  
                if (selectedColumn % 3 !== 0 + 1) {
                    const newColumn = selectedColumn - (selectedColumn % 3) + 1;
                    if (newColumn <= selectedColumn) setSelectedColumn(newColumn); 
                    else setSelectedColumn(selectedColumn -2)

                }
                break; 
            case 3:  
                if (selectedColumn % 4 !== 0 + 1) {
                    const newColumn = selectedColumn - (selectedColumn % 4) + 1;
                    if (newColumn <= selectedColumn) setSelectedColumn(newColumn); 
                    else setSelectedColumn(selectedColumn -3)
                }
                break; 
        }
            Tone.Transport.start();
            loop?.start(0);
            playInitialColumnSounds();
            startAnimation();
        }
   
        setIsPlaying(!isPlaying);
    }
};

  const playInitialColumnSounds = () => {
    const currentTabValues = tabValues.map((row: string[]) => row[selectedColumn]);
    currentTabValues.forEach((value: string, rowIndex: number) => {
      if (value !== '-') {
        playSound(rowIndex, parseInt(value));
      }
    });
  };

  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Math.max(20, Math.min(300, Number(event.target.value)));
    setBpm(newBpm);
    if (animationInterval) {
      clearInterval(animationInterval);
      startAnimation();
    }
  };

  const [notesPerBeatIndex, setNotesPerBeatIndex] = useState(0); 
  const notesPerBeatOptions = [60000, 30000, 20000, 15000]; 
  const divisor = notesPerBeatIndex + 1;
const [columnsDecrementValue, setColumnsDecrementValue] = useState(notesPerBeatIndex + 1);

useEffect(() => {
  setColumnsDecrementValue(notesPerBeatIndex + 1);
}, [notesPerBeatIndex]);
  const toggleNotesPerBeat = () => {
    setNotesPerBeatIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % notesPerBeatOptions.length;
      
      return newIndex;
    });
    resetMetronome(); 
  };

  const startAnimation = () => {
    stopAnimation();
    const interval = setInterval(() => {
      setSelectedColumn((prev: number) => {
        const nextColumn = (prev + 1) % columns;
        const columnToRead = nextColumn === 0 ? 1 : nextColumn;
        const currentTabValues = tabValues.map((row: string[]) => row[columnToRead]);
        currentTabValues.forEach((value: string, rowIndex: number) => {
          if (value !== '-') {
            playSound(rowIndex, parseInt(value));
          }
        });
       
        return columnToRead;
      });
    }, notesPerBeatOptions[notesPerBeatIndex] / bpm);
    setAnimationInterval(interval);
  };

  const stopAnimation = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
  };

  const playSound = (stringIndex: number, fretIndex: number) => {
    const note = getNoteForStringAndFret(stringIndex, fretIndex);
    audioManager.playNote(note);
};

  useEffect(() => {
   
    const handleArrowKeyDown = (event: KeyboardEvent) => {
  
      if (event.key === 'ArrowRight') {
     
        setSelectedColumn((prev: number) => {
          const nextColumn = (prev + 1) % columns;
          const columnToRead = nextColumn === 0 ? 1 : nextColumn;
          const currentTabValues = tabValues.map((row: string[]) => row[columnToRead]);
          currentTabValues.forEach((value: string, rowIndex: number) => {
            if (value !== '-') {
              playSound(rowIndex, parseInt(value));
            }
          });
          return columnToRead;
        });
      } else if (event.key === 'ArrowLeft') {
        setSelectedColumn((prev: number) => {
          const nextColumn = (prev - 1 + columns) % columns;
          const columnToRead = nextColumn === 0 ? (nextColumn - 1 + columns) % columns : nextColumn;
          const currentTabValues = tabValues.map((row: string[]) => row[columnToRead]);
          currentTabValues.forEach((value: string, rowIndex: number) => {
            if (value !== '-') {
              playSound(rowIndex, parseInt(value));
            }
      
          });
          return columnToRead;
        });
      } else if (event.ctrlKey && event.key === 'c') {
        const copiedValues = tabValues.map((row: string[]) => row[selectedColumn]);
        setCopiedColumn(copiedValues);
      } else if (event.ctrlKey && event.key === 'v') {
        if (copiedColumn) {
          setTabValues((prevTabValues: string[][]) => {
            const newTabValues = prevTabValues.map((row: string[], rowIndex: number) => {
              const newRow = [...row];
              newRow[selectedColumn] = copiedColumn[rowIndex];
              return newRow;
            });
            return newTabValues;
          });
        }
      }
    };

    window.addEventListener('keydown', handleArrowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleArrowKeyDown);
    };
  }, [columns, setColumns, setSelectedColumn, selectedColumn, tabValues, copiedColumn]);

  const resetMetronome = () => {
    stopAnimation();
    setSelectedColumn(1);
    setIsPlaying(false);
    Tone.Transport.stop();
  };

  const stringNotes = tuningStrings.map(tuning => {
    const [note, octave] = [tuning.slice(0, -1), parseInt(tuning.slice(-1))];
    const startIndex = notes.indexOf(note);
    return Array.from({ length: 25 }, (_, i) => {
      const noteIndex = (startIndex + i) % notes.length;
      const octaveAdjustment = Math.floor((startIndex + i) / notes.length);
      return notes[noteIndex] + (octave + octaveAdjustment);
    });
  });

  const getNoteForStringAndFret = (stringIndex: number, fretIndex: number): string => stringNotes[stringIndex][fretIndex];

  const handleColumnClick = (columnIndex: number) => {
    if (columnIndex !== 0) {
      setSelectedColumn(columnIndex);
      const currentTabValues = tabValues.map((row: string[]) => row[columnIndex]);
      currentTabValues.forEach((value: string, rowIndex: number) => {
        if (value !== '-') {
          playSound(rowIndex, parseInt(value));
        }
      });
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    }
    return () => {
      stopAnimation();
    };
  }, [bpm, isMuted, columns, tabValues, isPlaying]);

  const postTab = async () => {
    if (!tabName.trim()) {
      alert('O nome da tablatura é obrigatório.');
      return;
    }

    if (!isExercise && !artistName.trim()) {
      alert('O artista é obrigatório se a tablatura não for um exercício.');
      return;
    }

    const data = JSON.stringify({
      name: tabName,
      artist: artistName,
      columns,
      bpm,
      rows,
      tabValues,
      likes: 0,
      downloads: 0,
      userId: user.id,
      description: description,
      author: user.username,
      visibility: visibility,
      isExercise: Boolean(isExercise),
      notesPerBeat: notesPerBeatIndex,
    });

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        alert('Tablatura postada com sucesso!');
        setIsPostPopupOpen(false);
        setIsLoginPopupOpen(false);
        setIsRegisterPopupOpen(false);
        setIsExportPopupOpen(false);
      } else {
        alert('Falha ao postar a tablatura.');
      }
    } catch (error) {
      console.error('Erro ao postar a tablatura:', error);
      alert(`Erro ao postar a tablatura: ${error.message}`);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckboxes((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const openExportPopup = () => {
    setIsExportPopupOpen(true);
    setLastTabName(tabName);
    setLastArtistName(artistName);
    setLastCheckboxes(checkboxes);
  };

  const loadSounds = async () => {
    await Tone.start();
    await Tone.Buffer.load(metronomeSound); 
  };




  useEffect(() => {

    if (isEffectActive && selectedColumn === columns - 1   && isPlaying===true) {
      Tone.Transport.stop();
      loop?.stop();
      resetMetronome();
    }
  }, [ selectedColumn, columns, loop, isEffectActive, isPlaying]);
 

  const getColumnBackgroundColor = (columnIndex: number) => {
   if (columnIndex % divisor === 0 + 1 && columnIndex !== 0 && divisor !== 1) {
    return '#5e5e5e'; 
  } 
  };

  useEffect(() => {
    if (isExercise) {
      setArtistName('');
    }
  }, [isExercise]);

  useEffect(() => {
    if (notesPerBeatIndex === 0) {
      console.log("Notes per beat index is 0");
    } else if (notesPerBeatIndex === 1) {
      console.log("Notes per beat index is 1");
      if(columns % 2 !== 0){
        setColumns(columns + 1 + (2 - (columns % 2 )));
      }
    } else if (notesPerBeatIndex === 2) {
      console.log("Notes per beat index is 2");
      if(columns % 3 !== 1){
        setColumns(columns + 1 + (3 - (columns % 3 )));
      }
    } else if (notesPerBeatIndex === 3) {
      console.log("Notes per beat index is 3");
      if(columns % 4 !== 0){
        setColumns(columns + 1 + (4 - (columns % 4 )));
      }
    }
  }, [notesPerBeatIndex]); 

  return (
    <ResponsiveContainer>
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>
      <MetronomeContainer 
        toggleMetronome={toggleMetronome} 
        resetMetronome={resetMetronome} 
        isPlaying={isPlaying} 
        isMuted={isMuted} 
        setIsMuted={setIsMuted} 
        volume={volume} 
        setVolume={(newVolume) => {
          setVolume(newVolume);
          audioManager.setVolume(newVolume);
        }} 
        rows={rows} 
        setRows={setRows} 
        bpm={bpm} 
        setBpm={setBpm} 
        handleBpmChange={handleBpmChange} 
        toggleEffect={toggleEffect} 
        isEffectActive={isEffectActive}
        resetToDefault={resetToDefault}
        toggleNotesPerBeat={toggleNotesPerBeat} 
        notesPerBeatIndex={notesPerBeatIndex} 
      />
      <div className="tab-grid-container"> 
        <div className="tuning-column">
          {TuningString.slice(0, rows).map((tuning, index) => (
            <div key={index} className="tuning-cell">{tuning}</div>
          ))}
        </div>
        <div className="tab-grid" style={stylegridtab}>
          {tabValues.map((stringArray: string[], stringIndex: number) => (
            Array.isArray(stringArray) && stringArray.map((value, columnIndex) => {
              const isSelected = columnIndex === selectedColumn;
              const itemStyle = {
                backgroundColor: getColumnBackgroundColor(columnIndex),
              };

              return (
                <div
                  key={`${stringIndex}-${columnIndex}`}
                  onClick={() => handleColumnClick(columnIndex)}
                  onMouseEnter={() => {
                    if (columnIndex !== 0) {
                      setHoveringColumn(columnIndex);
                    }
                  }}
                  onMouseLeave={() => {
                    if (columnIndex !== 0) {
                      setHoveringColumn(undefined);
                    }
                  }}
                  className={`item item-${stringIndex}-${columnIndex} ${isSelected ? 'focused' : ''}`}
                  style={itemStyle}
                >
                  {value}
                  {stringIndex === tabValues.length - 1 && (
                    <div className="column-number">{columnIndex}</div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
      <div className="tab-buttons">
        <div className="column-buttons">
          <ButtonColumns onClick={() => { 
            if (isPlaying) {
              resetMetronome();
            }
            if (columnsDecrementValue === 1) {
              setColumns(columns + 2);
            } else {
              setColumns(columns + columnsDecrementValue);
            }
          }} tabIndex={-1} onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}>Adicionar Colunas</ButtonColumns>
          <ButtonColumns onClick={() => { 
            if (columns > 12) {
              if (isPlaying) {
                resetMetronome();
              }
              if (columnsDecrementValue === 1) {
                setColumns(columns - 2);
              } else {
                setColumns(columns - columnsDecrementValue);
              }            }
          }} tabIndex={-1} onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}>Remover Colunas</ButtonColumns>
        </div>
        <div className="action-buttons">
          <ButtonColumns onClick={openExportPopup}>Exportar Tablatura</ButtonColumns>
          {isLoggedIn ? (
            <ButtonColumns onClick={() => setIsPostPopupOpen(true)}>Postar Tablatura</ButtonColumns>
          ) : (
            <ButtonColumns onClick={() => setIsLoginPopupOpen(true)}>Postar Tablatura</ButtonColumns>
          )}
          <ButtonColumns as="label"  style={{   border: '0.2rem solid #111', height: '1.43rem', width: '7.1rem', textAlign: 'center', fontSize: '0.925rem', fontWeight: 'bold', color: 'black',}}>
          
            Importar Tablatura
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </ButtonColumns>
        </div>
      </div>
      {isPostPopupOpen && (
        <PopupOverlay className='popup-overlay'>
          <PopupContent className='popup-content' style={{ backgroundColor: '#1e1e1e' }}>
          <button style={{backgroundColor: '#1e1e1e',border:'none',color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%'}} onClick={() => setIsPostPopupOpen(false)}>X</button>
          <h2 style={{ textAlign: 'center' }}>Postar Tablatura</h2>
            <label className='popup-label' >
              Nome da Tablatura:
              <input type="text" value={tabName} onChange={(e) => setTabName(e.target.value)} required />
            </label>
            <label className='popup-label'>
  Artista:
  <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} required={!isExercise} disabled={isExercise} style={{ backgroundColor: isExercise ? 'gray' : 'white' }} />
</label>
              <label className='popup-label'>
                Descrição:
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}/>
              </label>
            <div className="checkbox-container">
            <label className='popup-label'>
              Exercício:
              <input
                type="checkbox"
                name="exercicio"
                checked={isExercise}
                onChange={(e) => setIsExercise(e.target.checked)}
                required
              />
            </label>
            <label className='popup-label'>
              Visibilidade:
              <select required value={visibility} onChange={(e) => setVisibility(parseInt(e.target.value))}>
                <option value={0}>Pública</option>
                <option value={2}>Privada</option>
              </select>
            </label>


            </div>
            <ButtonColumns style={{ marginTop: '0.5rem', fontFamily: 'Oswald', fontSize: '1.1rem'}}  onClick={postTab}>Postar</ButtonColumns>
            <ButtonColumns style={{ marginLeft: '0.5rem', fontFamily: 'Oswald', fontSize: '1.1rem'}} onClick={() => setIsPostPopupOpen(false)}>Cancelar</ButtonColumns>
          </PopupContent>
        </PopupOverlay>
      )}
      {isExportPopupOpen && (
        <PopupOverlay className='popup-overlay'>
          <PopupContent className='popup-content' style={{ backgroundColor: '#1e1e1e' }}>
          <button style={{backgroundColor: '#1e1e1e',border:'none',color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%'}} onClick={() => setIsExportPopupOpen(false)}>X</button>
            <h2 style={{ textAlign: 'center' }}>Exportar Tablatura</h2>
            <label className='popup-label'>
              Nome da Tablatura:
              <input type="text" value={lastTabName} onChange={(e) => setLastTabName(e.target.value)} required />
            </label>
            <label className='popup-label'>
              Artista:
              <input type="text" value={lastArtistName} onChange={(e) => setLastArtistName(e.target.value)} required />
            </label>
            <div className="checkbox-container">
              <label className='popup-label'>
                Exercício:
                <input
                  type="checkbox"
                  name="exercicio"
                  checked={lastCheckboxes.exercicio}
                  onChange={(e) => setLastCheckboxes({ exercicio: e.target.checked })}
                  required
                />
              </label>
            </div>
            <ButtonColumns style={{ marginTop: '1.0rem', fontFamily: 'Oswald', fontSize: '1.1rem'}} onClick={exportTab}>Exportar .JSON</ButtonColumns>
            <ButtonColumns style={{ marginLeft: '0.5rem', fontFamily: 'Oswald', fontSize: '1.1rem'}} onClick={() => setIsExportPopupOpen(false)}>Cancelar</ButtonColumns>
          </PopupContent>
        </PopupOverlay>
      )}

    </ResponsiveContainer>
  );
};


export default Tab;