import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash, FaUserCircle, FaEye } from "react-icons/fa";

// Componente principal de la pantalla de inicio de sesion
const Login = () => {
    const [user, setUser] = useState(''); // Nombre de usuario
    const [password, setPassword] = useState(''); // Contraseña
    const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error
    const [showRegister, setShowRegister] = useState(false); // Controla la vista del formulario de registro
    const [errors, setErrors] = useState({}); // Validaciones de errores para campos especificos
    const [showPassword, setShowPassword] = useState(false); // Controla visibilidad de la contraseña
    const navigate = useNavigate(); // Hook para redireccionar al usuario a otras páginas

    // Función para validar el formulario
    const validateForm = () => {
        const newErrors = {};
        if (!user) {
            newErrors.user = 'El nombre de usuario es obligatorio.';
        }
        if (!password) {
            newErrors.password = 'La contraseña es obligatoria.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Funcion para mostrar mensaje de error temporalmente
    const displayErrorMessage = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage('');
        }, 3000);
    }

    // Funcion asincrónica para manejar el envio del formulario
    async function handleSubmit(event) {
        event.preventDefault(); // Evita el comportamiento predeterminado de enviar el formulario
    
        if (validateForm()) {
            try {
                // Envia solicitud de autenticacion al servidor
                const response = await fetch('https://localhost:7296/api/Authentication/Login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: user,
                        password: password
                    })
                });
    
                // Maneja errores en la respuesta
                if (!response.ok) {
                    if (response.status === 401) {
                        displayErrorMessage('Credenciales incorrectas. Intente nuevamente.');
                    } else {
                        displayErrorMessage('Ocurrió un error inesperado. Intentelo más tarde.');
                    }
                    return;
                }
                // Si la autenticacion es exitosa, guarda el token y redirecciona a la pagina principal
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.userName);
                navigate('/Boards');
            } catch (error) {
                console.error('Error durante el login:', error);
                displayErrorMessage('Hubo un error en el sistema. Inténtelo más tarde.');
            }
        }
    }    

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Renderizado del componente
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-900 to-green-400 text-white">
            <div className="bg-green-900 bg-opacity-80 p-8 rounded-2xl w-96 shadow-lg relative">
                <div className="text-center text-4xl font-bold mb-6 uppercase text-white">Board CTRL</div>
                    <form onSubmit={handleSubmit}>
                        <h1 className="text-3xl mb-6 ml-28">LOGIN</h1>
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full p-4 bg-transparent border border-green-500 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                onChange={e => setUser(e.target.value)}
                            />
                            <FaUserCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
                            {errors.user && <span className="text-red-500 text-sm">{errors.user}</span>}
                        </div>
                        <div className="relative mb-6">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full p-4 bg-transparent border border-green-500 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                        </div>
                        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
                        <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-full text-lg font-semibold">
                            Login
                        </button>
                    </form>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm opacity-80">FINANZAUTO</div>
            </div>
        </div>
    );
};

export default Login;