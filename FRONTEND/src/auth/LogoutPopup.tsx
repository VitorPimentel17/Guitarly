import React from 'react';
import './AuthPages.css';

const LogoutPopup: React.FC<{ onClose: () => void, onConfirm: () => void }> = ({ onClose, onConfirm }) => {
  return (
    <div className={"popupOverlay"}>
      <div className={"popupContent"}>
        <button style={{color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '1%', right: '2%'}} onClick={onClose}>X</button>
        <h1>Confirmar Logout</h1>
        <p>Tem certeza que deseja sair?</p>
        <button className={"button"} onClick={onConfirm}>Sim</button>
        <button className={"button"} onClick={onClose}>Não</button>
      </div>
    </div>
  );
};

export default LogoutPopup;