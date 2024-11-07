import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

const RegisterPopup: React.FC<{ onClose: () => void, onLogin: (user: any) => void }> = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username.length < 3 || username.length > 15) {
      setErrorMessage('Nome de usuário deve ser entre 3 a 15 caracteres.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Email inválido.');
      return;
    }

    if (password.length < 4 || password.length > 26) {
      setErrorMessage('A senha deve ser entre 4 a 26 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const loginResponse = await fetch('http://localhost:3000/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem('authToken', loginData.token);
          onLogin(loginData.user);
          onClose(); 
          navigate('/');
        } else {
          setErrorMessage('Registro bem-sucedido, mas falha no login automático.');
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(`Falha no registro: ${errorData.message}`);
      }
    } catch (error) {
      setErrorMessage(`Falha no registro: ${error.message}`);
    }
  };

  return (
    <div className={"popupOverlay"}>
      <div className={"popupContent"}>
      <button style={{color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%'}} onClick={onClose}>X</button>
      <h1>Registro</h1>
        <form onSubmit={handleSubmit}>
          {errorMessage && <p className={"error"}>{errorMessage}</p>}
          <div>
            <label htmlFor="username">Nome de Usuário:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
            />
          </div>
          <div>
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirmar Senha:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPopup;