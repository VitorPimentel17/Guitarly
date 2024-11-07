import React from 'react';
import { FaTrash } from 'react-icons/fa';
import './UserTable.css'; 
interface User {
  _id: string;
  username: string;
  email: string;
  admin: boolean; 
}

interface UserTableProps {
  users: User[];
  onDelete: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete }) => {
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      onDelete(id);
    }
  };

  return (
    <div className="user-table-container"> 
      <table>
        <thead>
          <tr>
            <th>Nome de Usuário</th>
            <th>Email</th>
            <th>Ações</th> 
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {!user.admin && ( 
                    <FaTrash
                      onClick={() => handleDelete(user._id)}
                      style={{ cursor: 'pointer', color: 'red' }}
                    />
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>Nenhum usuário encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;