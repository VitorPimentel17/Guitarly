import React from 'react';

interface ConfirmationPopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-popup">
      <p>{message}</p>
      <button onClick={onConfirm}>Sim</button>
      <button onClick={onCancel}>Não</button>
    </div>
  );
};

export default ConfirmationPopup;