import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login';
import Categorias from './Components/categorias/Categorias';
import Boards from './Components/Boards/Boards';
import Slides from './Components/Slides/Slides';

function App() {
  return (
      <div className='app-container'>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Ruta para el login */}
          <Route path="/Boards" element={<Boards />} /> {/* Ruta para las boards */}
          <Route path="/Categorias" element={<Categorias />} /> {/* Ruta para las categorias */}
          <Route path="/Slides" element={<Slides />} /> {/* Ruta para las slides */}
        </Routes>
      </div>
  );
}

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login';
import Register from './Components/Login/Register';
import Categorias from './Components/categorias/Categorias';
import Boards from './Components/Boards/Boards';
import Slides from './Components/Slides/Slides';

function App() {
  return (
      <div className='app-container'>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Ruta para el login */}
          <Route path="/Register" element={<Register />} /> {/* Ruta para el registro */}
          <Route path="/Boards" element={<Boards />} /> {/* Ruta para las boards */}
          <Route path="/Categorias" element={<Categorias />} /> {/* Ruta para las categorias */}
          <Route path="/Slides" element={<Slides />} /> {/* Ruta para las slides */}
        </Routes>
      </div>
  );
}

export default App;
