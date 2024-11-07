import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa'; 

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

interface EditPopupProps {
  tab: Tablature;
  onClose: () => void;
  onSubmit: (updatedTab: Tablature) => void;
  onDelete: (tabId: string) => void; 
}

const EditPopup: React.FC<EditPopupProps> = ({ tab, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState(tab.name);
  const [artist, setArtist] = useState(tab.artist);
  const [description, setDescription] = useState(tab.description || '');
  const [visibility, setVisibility] = useState(tab.visibility || 0);
  const [isExercise, setIsExercise] = useState(tab.isExercise);

  useEffect(() => {
    if (isExercise) {
      setArtist('');
    }
  }, [isExercise]);

  const handleSubmit = () => {
    const updatedTab = { ...tab, name, artist, description, visibility, isExercise };
    onSubmit(updatedTab);
    onClose(); 
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta tablatura?')) {
      onDelete(tab._id); 
      onClose(); 
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button style={{color: 'white', fontFamily: 'Calibri', fontSize: '1.5rem', fontWeight: 'bold', position: 'absolute', top: '0', right: '2%'}} onClick={onClose}>X</button>
        <h2>Editar Tablatura</h2>
        <label>
          Nome:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Artista:
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} required={!isExercise} disabled={isExercise} style={{ backgroundColor: isExercise ? 'gray' : 'white' }} />
        </label>
        <label>
          Descrição:
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Visibilidade:
          <select value={visibility} onChange={(e) => setVisibility(parseInt(e.target.value))}>
            <option value={0}>Pública</option>
            <option value={2}>Privada</option>
          </select>
        </label>
        <label>
          Exercício:
          <input type="checkbox" checked={isExercise} onChange={(e) => setIsExercise(e.target.checked)} />
        </label>
        <button onClick={handleSubmit} style={{ marginLeft: '1rem', backgroundColor: 'green', color: 'white', marginTop: '1rem' }}>Salvar</button>
        <button onClick={handleDelete} style={{ marginLeft: '1rem',backgroundColor: 'red', color: 'white', marginTop: '1rem' }}>
           Excluir
        </button>
      </div>
    </div>
  );
};

export default EditPopup;