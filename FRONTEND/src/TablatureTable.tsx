import React, { useState, useEffect } from 'react';
import './TablatureTable.css';
import { useAuth } from './auth/AuthContext';
import { FaDownload, FaEdit, FaThumbsUp, FaRegThumbsUp, FaTrash, FaLock } from 'react-icons/fa'; // Import FaTrash and FaLock
import EditPopup from './components/EditPopup'; 

interface Tablature {
  _id: string;
  name: string;
  isExercise: boolean;
  artist: string;
  author: string;
  createdAt: string;
  likes: number;
  downloads: number;
  userId: string; 
  description: string;
  visibility: number;
}

interface TablatureTableProps {
  tablatures: Tablature[];
  onDownload: (id: string) => void; 
  showOwnTabs: boolean;
  showLikedTabs: boolean;
}

const TablatureTable: React.FC<TablatureTableProps> = ({ tablatures, onDownload, showOwnTabs, showLikedTabs }) => {
  const { user } = useAuth();
  const [likedTabs, setLikedTabs] = useState<string[]>([]);
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>({});
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tablature | null>(null);

  useEffect(() => {
    const fetchLikedTabs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3000/users/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLikedTabs(data.likedTabs || []);
        } else {
          console.error('Failed to fetch liked tabs');
        }
      } catch (error) {
        console.error('Error fetching liked tabs:', error);
      }
    };

    if (user) {
      fetchLikedTabs();
    }
  }, [user]);

  useEffect(() => {
    const initialLikesCount: { [key: string]: number } = {};
    tablatures.forEach(tab => {
      initialLikesCount[tab._id] = tab.likes;
    });
    setLikesCount(initialLikesCount);
  }, [tablatures]);

  useEffect(() => {
    const cells = document.querySelectorAll('td[data-tooltip]');
    cells.forEach(cell => {
    });

    return () => {
    };
  }, [tablatures]);

  const filteredTabs = tablatures.filter(tab => {
    if (showOwnTabs && tab.userId !== user.id) {
      return false; 
    }
    if (showLikedTabs && !likedTabs.includes(tab._id)) {
      return false; 
    }
    return true;
  });

  const visibleTabs = filteredTabs.filter(tab => {
    if (tab.userId !== user.id) {
      return tab.visibility === 0; 
    }
    return true; 
  });

  const handleEdit = (tab: Tablature) => {
    setCurrentTab(tab);
    setIsEditPopupOpen(true);
  };

  const handleEditSubmit = async (updatedTab: Tablature) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/tabs/${updatedTab._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTab),
      });

      if (response.ok) {
        console.log('Tab updated successfully');
        setIsEditPopupOpen(false);
        fetchPublicTablatures();
      } else {
        console.error('Failed to update the tab');
      }
    } catch (error) {
      console.error('Error updating the tab:', error);
    }
  };

  const handleDelete = async (tabId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/tabs/${tabId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Tab deleted successfully');
        fetchPublicTablatures();
      } else {
        console.error('Failed to delete the tab');
      }
    } catch (error) {
      console.error('Error deleting the tab:', error);
    }
  };

  const handleLike = async (tabId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/tabs/${isLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, tabId }),
      });

      if (response.ok) {
        // Atualiza o estado de likedTabs
        if (isLiked) {
          setLikedTabs(likedTabs.filter(id => id !== tabId)); 
          setLikesCount(prev => ({ ...prev, [tabId]: prev[tabId] - 1 })); 
        } else {
          setLikedTabs([...likedTabs, tabId]); 
          setLikesCount(prev => ({ ...prev, [tabId]: prev[tabId] + 1 })); 
        }
      } else {
        console.error('Erro ao alterar o like da tablatura');
      }
    } catch (error) {
      console.error('Erro ao processar o like:', error);
    }
  };

  return (
    <div className="tab-container" style={{ maxHeight: '23rem', overflowY: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th style={{overflow: 'hidden'}}>Nome</th>
            <th style={{overflow: 'hidden'}}>Exercício</th>
            <th style={{overflow: 'hidden'}}>Artista</th>
            <th style={{overflow: 'hidden'}}>Descrição</th>
            <th style={{overflow: 'hidden'}}>Autor</th>
            <th style={{overflow: 'hidden'}}>Curtidas</th>
            <th style={{overflow: 'hidden'}}>Downloads</th>
            <th style={{overflow: 'hidden'}}>Data Criada</th>
            <th style={{overflow: 'hidden'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {visibleTabs.map((tab, index) => {
            const isLiked = likedTabs.includes(tab._id);
            const isOwner = user.id === tab.userId;

            return (
              <tr key={`${tab._id}-${index}`} >
                <td data-tooltip={tab.name}>
                  {tab.name}
                  {tab.visibility === 2 && <FaLock style={{ marginLeft: '0.1rem', color: 'gray', width: '1rem' }} />} {}
                </td>
                <td style={{overflow: 'hidden'}}>{tab.isExercise ? 'Sim' : 'Não'}</td>
                <td data-tooltip={tab.artist}>{tab.artist}</td>
                <td data-tooltip={tab.description}>{tab.description}</td>
                <td data-tooltip={tab.author}>{tab.author}</td>
                <td style={{overflow: 'hidden'}}>{likesCount[tab._id]}</td>
                <td style={{overflow: 'hidden'}}>{tab.downloads}</td>
                <td style={{overflow: 'hidden'}}>{new Date(tab.createdAt).toLocaleDateString()}</td>
                <td style={{overflow: 'hidden'}}>
                  <button style={{ color: 'white', width: '2.7em', height: '2.7rem', justifyContent: 'center', alignItems: 'center' }} onClick={() => onDownload(tab._id)}>
                    <FaDownload style={{ fontSize: '1.3rem' }}/>
                  </button>
                  {isOwner ? (
                    <>
                      <button style={{ color: 'white', width: '2.7rem', height: '2.7rem', justifyContent: 'center', alignItems: 'center' }} onClick={() => handleEdit(tab)}>
                        <FaEdit style={{ fontSize: '1.3rem', marginLeft: '13%' }}/>
                      </button>
                    </>
                  ) : (
                    <button
                      style={{ color: 'white', width: '2.7rem', height: '2.7rem', justifyContent: 'center', alignItems: 'center' }}
                      onClick={() => handleLike(tab._id, isLiked)}
                    >
                      {isLiked ? <FaThumbsUp style={{ fontSize: '1.3rem' }} /> : <FaRegThumbsUp style={{ fontSize: '1.3rem' }} />}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isEditPopupOpen && currentTab && (
        <EditPopup
          tab={currentTab}
          onClose={() => setIsEditPopupOpen(false)}
          onSubmit={handleEditSubmit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default TablatureTable;