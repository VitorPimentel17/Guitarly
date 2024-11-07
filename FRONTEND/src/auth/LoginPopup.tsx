import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

const LoginPopup: React.FC<{ onClose: () => void, onLogin: (user: any) => void }> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) { // Verifica se a resposta foi bem-sucedida
        localStorage.setItem('authToken', data.token);
        onLogin(data.user); // Pass the user data to the parent component
        navigate('/');
        onClose();
      } else {
        // Define mensagens de erro específicas com base no status da resposta
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          setErrorMessage('Erro ao fazer login');
        }
      }
    } catch (error) {
      setErrorMessage('Erro ao fazer login');
    }
  };

  return (
    <div className={"popupOverlay"}>
      <div className={"popupContent"}>
        <button style={{color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%'}} onClick={onClose}>X</button>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
          </div>
          <div>
            <label htmlFor="password">Senha:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
          {errorMessage && <p className={"error"} style={{ color: 'red' }}>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;