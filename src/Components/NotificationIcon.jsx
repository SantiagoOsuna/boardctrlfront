// src/Components/NotificationIcon.jsx
import React, { useContext } from 'react';
import { NotificationContext } from './NotificationContext'; // Asegúrate de que la ruta sea correcta
import { BiMessageSquare } from 'react-icons/bi';

const NotificationIcon = () => {
  const { notifications } = useContext(NotificationContext); // Usa el contexto

  return (
    <div>
        
    </div>
  );
};

export default NotificationIcon;
