import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componente principal de registro de usuarios
const Register = () => {
    // Estado para manejar los datos del formulario
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        roleId: '1' // Por defecto es Admin
    });
    const [errors, setErrors] = useState({}); // Estado para almacenar mensajes de error especificos
    const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
    const navigate = useNavigate(); // Hook para redireccionar al usuario a otras rutas

    // Función que maneja cambios en los campos del formulario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrors({ ...errors, [e.target.name]: '' }); // Limpia los errores al cambiar el valor
    };

    // Validacion del formulario para asegurar la correcta entrada de datos
    const validateForm = () => {
        const newErrors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.username) {
            newErrors.username = 'El nombre de usuario es obligatorio.';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria.';
        } else if (formData.password.length <= 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una letra mayúscula.';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'La contraseña debe contener al menos un número.';
        }

        if (!formData.email) {
            newErrors.email = 'El correo electrónico es obligatorio.';
        } else if (!emailPattern.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido.';
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Debes seleccionar un rol.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
    };

    // Función que maneja el envio del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario
        
        if (validateForm()) { // Solo procede si el formulario es válido
            try {
                // Solicitud de registro al servidor
                const response = await axios.post('https://localhost:7296/api/Authentication/Register', formData);
                console.log('Usuario registrado correctamente:', response.data);
                navigate('/'); // Redirige a la página de login
            } catch (error) {
                if (error.response) {
                    const { message } = error.response.data; // Extraer el mensaje del backend
                    
                    // Verifica si el error esta relacionado con el usuario o el correo
                    if (error.response.status === 409) {
                        if (message.includes('usuario')) {
                            setErrors({ global: 'El nombre de usuario ya existe. Por favor, utiliza otro.' })
                        } else if (message.includes('correo')) {
                            setErrors({ global: 'El correo electronico ya esta en uso. Por favor, utiliza otro.' })
                        }
                    } else {
                        console.error('Error en el registro del usuario:', error);
                        setErrors({ global: 'Error al registrar el usuario. El correo esta en uso.'});
                    }
                }
            }
        }
    };

    // Función que redirige a la pagina de login
    const handleBackToLogin = () => {
        console.log("Navegando a la ruta de login...");
        navigate("/");
    };

    // Renderizado del formulario de registro
    return (
        <div className="bg-gradient-to-br from-green-900 to-green-400">
        <div className="register-container bg-gray-100 shadow-lg max-w-sm mx-auto p-6 rounded-lg">
            <form onSubmit={handleSubmit} className="register-form flex flex-col mt-2 space-y-4">
                <span className="text-green-700 text-3xl text-center font-semibold">BOARD CTRL</span>
                <h2 className="register-title text-black text-2xl mb-1 text-center font-semibold mt-6">Register</h2>
                <div className="form-group space-y-2">
                    <label className="block">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm transition-colors"
                    />
                    {errors.username && <span className="error text-red-600 text-xs bd-red-100 p-2 rounded-md">{errors.username}</span>}
                </div>

                <div className="form-group space-y-2">
                    <label className="block">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none foucs:ring-2 focus:ring-green-600 shadow-sm transition-colors"
                    />
                    {errors.password && <span className="error text-red-600 text-xs bg-red-100 p-2 rounded-md">{errors.password}</span>}
                </div>

                <div className="form-group space-y-2">
                    <label className="block">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm trnasition-colors"
                    />
                    {errors.email && <span className="error text-red-600 text-xs bg-red-100 p-2 rounded-md">{errors.email}</span>}
                </div>

                <div className="form-group space-y-2">
                    <label className="block">Role</label>
                    <select
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm transitio-colors"
                    >
                        <option value="1">Admin</option>
                        <option value="2">User</option>
                    </select>
                    {errors.roleId && <span className="error text-red-600 text-xs bg-red-100 p-2 rounded-md">{errors.roleId}</span>}
                </div>
                <button type="submit" className="register-btn w-full p-3 bg-green-700 text-white rounded-md hover:bg-green-800 transform hover:scale-105 transition-transform">Register</button>
                {errors.global && <span className="error text-red-600 text-xs bg-red-100 p-2 rounded-md">{errors.global}</span>}
                {successMessage && <span className="success text-green-700 text-xs bg-green-100 p-2 rounded-md">{successMessage}</span>} {/* Mensaje de éxito */}
                <button
                    type="button" // Asegúrate de que no sea un botón de envío
                    className="back-btn w-full p-3 text-green-700 border border-green-700 rounded-md hover:bg-green-700 hover:text-white transition-colors"
                    onClick={handleBackToLogin}
                >
                    Back to login
                </button>
            </form>
        </div>
            <footer className="text-white p-2 text-center mt-auto">
                <p>@ 2024 FINANZAUTO</p>
            </footer>
    </div>
        
        
    );
};

export default Register;