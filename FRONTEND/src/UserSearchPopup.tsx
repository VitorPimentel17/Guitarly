import React, { useEffect, useState, useCallback } from 'react';
import UserTable from './UserTable';

const UserSearchPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearch = useCallback(
    debounce(async (term: string) => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('Token not provided');
          return;
        }

        const url = term
          ? `http://localhost:3000/users/search?query=${term}`
          : `http://localhost:3000/users`; 

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Erro ao buscar usuários');
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    }, 301), 
    []
  );

  const handleDeleteUser = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== id)); 
      } else {
        console.error('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  return (
    <div className="popupOverlay">
      <div className="popupContent">
        <button style={{ color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%' }} onClick={onClose}>X</button>
        <h1>Pesquisar Usuários</h1>
        <input
          type="text"
          placeholder="Digite o nome de usuário ou email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <UserTable users={users} onDelete={handleDeleteUser} />
      </div>
    </div>
  );
};

export default UserSearchPopup;