import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import LoginPopup from './auth/LoginPopup';
import RegisterPopup from './auth/RegisterPopup';
import LogoutPopup from './auth/LogoutPopup';
import { useAuth } from './auth/AuthContext';
import { usePopup } from './PopupContext';
import { FaSearch, FaSignOutAlt } from 'react-icons/fa';
import TablatureTable from './TablatureTable';
import UserSearchPopup from './UserSearchPopup';

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, user, setUser } = useAuth();
  const { isLoginPopupOpen, setIsLoginPopupOpen, isRegisterPopupOpen, setIsRegisterPopupOpen, isSearchPopupOpen, setIsSearchPopupOpen } = usePopup();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [tablatures, setTablatures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExercises, setShowExercises] = useState(false);
  const [hideExercises, setHideExercises] = useState(false);
  const [isOwnTabsPopupOpen, setIsOwnTabsPopupOpen] = useState(false);
  const [ownTablatures, setOwnTablatures] = useState<any[]>([]);
  const [showOwnTabs, setShowOwnTabs] = useState(false);
  const [showLikedTabs, setShowLikedTabs] = useState(false);
  const [isUserSearchPopupOpen, setIsUserSearchPopupOpen] = useState(false); // Estado para o popup de pesquisa de usuários

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = useCallback(
    debounce(async (searchTerm: string) => {
      console.log('Searching for:', searchTerm);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('Token not provided');
          return;
        }
        const response = await fetch(`http://localhost:3000/tabs?query=${searchTerm}&isExercise=${showExercises}&hideExercises=${hideExercises}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTablatures(data);
        } else {
          console.error('Erro ao buscar tablaturas');
        }
      } catch (error) {
        console.error('Erro ao buscar tablaturas:', error);
      }
    }, 300),
    [showExercises, hideExercises]
  );

  useEffect(() => {
    if (isSearchPopupOpen) {
      fetchPublicTablatures();
    }
  }, [isSearchPopupOpen]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      handleSearch(searchTerm); 
    }
  }, [searchTerm, handleSearch]);

  useEffect(() => {
    if (isSearchPopupOpen) {
      handleSearch(searchTerm); 
    }
  }, [showExercises, hideExercises]);

  const fetchPublicTablatures = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await new Promise(resolve => setTimeout(resolve, 301)); 
      const response = await fetch('http://localhost:3000/tabs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTablatures(data);
      } else {
        console.error('Erro ao buscar tablaturas');
      }
    } catch (error) {
      console.error('Erro ao buscar tablaturas:', error);
    }
  };

  const fetchOwnTablatures = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/tabs/own?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOwnTablatures(data);
      } else {
        console.error('Erro ao buscar suas tablaturas');
      }
    } catch (error) {
      console.error('Erro ao buscar suas tablaturas:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUser(null);
    setIsLogoutPopupOpen(false);
  };

  const handleLogin = (user: any) => {
    setUser(user);
    setIsLoggedIn(true);
  };

  const handleDownload = async (id: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/tabs/${id}/incrementDownload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        console.error('Erro ao incrementar o download da tablatura');
        return;
      }

      const responseData = await fetch(`http://localhost:3000/tabs/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (responseData.ok) {
        const data = await responseData.json();
        const jsonData = JSON.stringify({ columns: data.columns, bpm: data.bpm, rows: data.rows, tabValues: data.tabValues, tabName: data.name, artistName: data.artist, notesPerBeatIndex: data.notesPerBeat }, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name} by ${data.author}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error('Erro ao baixar a tablatura');
      }
    } catch (error) {
      console.error('Erro ao baixar a tablatura:', error);
    }
  };

  const handleShowExercisesChange = (checked: boolean) => {
    setShowExercises(checked);
    if (checked) {
      setHideExercises(false); 
    }
  };

  const handleHideExercisesChange = (checked: boolean) => {
    setHideExercises(checked);
    if (checked) {
      setShowExercises(false);
    }
  };

  const handleShowOwnTabsChange = (checked: boolean) => {
    setShowOwnTabs(checked);
    if (checked) {
      setShowLikedTabs(false); 
    }
  };

  const handleShowLikedTabsChange = (checked: boolean) => {
    setShowLikedTabs(checked);
    if (checked) {
      setShowOwnTabs(false); 
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-center">
        <FaSearch
          onClick={() => {
            if (isLoggedIn) {
              setIsSearchPopupOpen(true);
              fetchPublicTablatures();
            } else {
              setIsLoginPopupOpen(true);
            }
          }}
          style={{ cursor: 'pointer', margin: '0 1.25rem' }}
        />
      </div>
      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <li key="greeting">Olá, {user.username}</li>
            {user.admin && (
              <li key="users">
                <span className="navbar-text" onClick={() => setIsUserSearchPopupOpen(true)}>Usuários</span> 
              </li>
            )}
            <li key="logout"><span className="navbar-text" onClick={() => setIsLogoutPopupOpen(true)}><FaSignOutAlt /></span></li>
          </>
        ) : (
          <>
            <li key="login"><span className="navbar-text" onClick={() => setIsLoginPopupOpen(true)}>Login</span></li>
            <li key="register"><span className="navbar-text" onClick={() => setIsRegisterPopupOpen(true)}>Registro</span></li>
          </>
        )}
      </div>
      {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} onLogin={handleLogin} />}
      {isRegisterPopupOpen && <RegisterPopup onClose={() => setIsRegisterPopupOpen(false)} onLogin={handleLogin} />}
      {isLogoutPopupOpen && <LogoutPopup onClose={() => setIsLogoutPopupOpen(false)} onConfirm={handleLogout} />}
      {isUserSearchPopupOpen && <UserSearchPopup onClose={() => setIsUserSearchPopupOpen(false)} />} 
      {isSearchPopupOpen && (
        <div className="popup-content">
          <h2 style={{ justifyContent: 'center', textAlign: 'center' }}>Pesquisa</h2>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <input
              type="text"
              placeholder="Pesquisar Tablaturas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc', flex: 1, marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '2rem', width: '100%' }}>
              <label>
                <input
                  type="checkbox"
                  checked={showExercises}
                  onChange={(e) => handleShowExercisesChange(e.target.checked)}
                />
                Mostrar apenas exercícios
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={hideExercises}
                  onChange={(e) => handleHideExercisesChange(e.target.checked)}
                />
                Não mostrar exercícios
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showOwnTabs}
                  onChange={(e) => handleShowOwnTabsChange(e.target.checked)}
                />
                Mostrar apenas minhas tablaturas
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showLikedTabs}
                  onChange={(e) => handleShowLikedTabsChange(e.target.checked)}
                />
                Mostrar apenas tablaturas curtidas
              </label>
            </div>
          </form>
          {tablatures.length > 0 ? (
            <TablatureTable tablatures={tablatures} onDownload={handleDownload} showOwnTabs={showOwnTabs} showLikedTabs={showLikedTabs} />
          ) : (
            <p>Nenhuma tablatura encontrada.</p>
          )}
          <button style={{ color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%' }} onClick={() => setIsSearchPopupOpen(false)}>X</button>
        </div>
      )}
      {isOwnTabsPopupOpen && (
        <div className="popup-content">
          <h2>Minhas Tablaturas</h2>
          {ownTablatures.length > 0 ? (
            <TablatureTable tablatures={ownTablatures} onDownload={handleDownload} />
          ) : (
            <p>Você não possui tablaturas.</p>
          )}
          <button onClick={() => setIsOwnTabsPopupOpen(false)}>Fechar</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;