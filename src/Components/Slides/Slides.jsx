import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

const Slides = () => {
    // Definicion de estados para manejar los slides
    const [slides, setSlides] = useState([]);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [time, setTime] = useState('');
    const [boardName, setBoardName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slideToEdit, setSlideToEdit] = useState(null);
    const [message, setMessage] = useState({ text: '', type: ''});
    const [errors, setErrors] = useState({ title: '', url: '', time: ''});
    const [newSlideTitle, setNewSlideTitle] = useState('');
    const [newSlideUrl, setNewSlideUrl] = useState('');
    const [newSlideTime, setNewSlideTime] = useState('');
    const location = useLocation();
    const boardId = new URLSearchParams(location.search).get('boardId');
    const categoryId = new URLSearchParams(location.search).get('categoryId');

    // Muestra mensajes temporales en pantalla
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: ''});
        }, 5000);
    }

    const navigate = useNavigate();

    // Función para obtener las diapositivas del servidor usando el ID del tablero
    const fetchSlides = async (boardId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`https://localhost:7296/api/v2/slides/list-slides-by-board?boardId=${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Asignar el nombre del tablero
            if (response.data.length > 0) {
                setBoardName(response.data[0].board.titleBoard);
            }
            
            setSlides(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                showMessage('El token ha vencido. Redirigiendo al login...', 'error');

                localStorage.removeItem('token');

                setTimeout(() => {
                    navigate('/');
                }, 5000);
            } else {
                showMessage('No se encontraron slides.', 'error');
            }
            console.error("Error fetching slides:", error);
        }
    };

    useEffect(() => {
        if (boardId) {
            fetchSlides(boardId);
        } else {
            console.error('Board Id es indefinido');
        }
    }, [boardId]);

    const displayMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: ''});
        }, 3000);
    }

    // Función para validar entradas de título, URL y tiempo de la diapositiva
    const validateInputs = () => {
        const newErrors = {
            title: '',
            url: '',
            time: ''
        };

        let isValid = true;

        // Valida el campo de titulo (debe tener contenido)
        if (!newSlideTitle.trim()) {
            newErrors.title = '• Este campo es obligatorio.';
            isValid = false;
        }

        // Valida el campo de URL y ajusta prefijo si falta
        let adjustedUrl = newSlideUrl.trim();
        if (!adjustedUrl) {
        newErrors.url = '• Este campo es obligatorio.';
        isValid = false;
        } else {
        if (!adjustedUrl.startsWith('http://') && !adjustedUrl.startsWith('https://')) {
            adjustedUrl = 'https://' + adjustedUrl;
            setNewSlideUrl(adjustedUrl);
        }
        const urlPattern = /^(https?:\/\/)?(\S+)\.(\S+)$/i;
        if (!urlPattern.test(adjustedUrl)) {
            newErrors.url = "• Por favor, ingrese una URL válida.";
            isValid = false;
        }
    }

    // Valida el campo de tiempo (debe ser un número dentro del rango 1-10000)
    if (!String(newSlideTime).trim()) {
        newErrors.time = '• Este campo es obligatorio.';
        isValid = false;
    } else if (isNaN(newSlideTime) || parseInt(newSlideTime) <= 0) {
        newErrors.time = 'El tiempo debe ser un numero positivo.';
        isValid = false;
    } else if (parseInt(newSlideTime) > 10000) {
        newErrors.time = 'El tiempo no puede exceder 10000 minutos';
        isValid = false
    }

    setErrors(newErrors);

    // Limpia los errores despues de 7 segundos
    setTimeout(() => {
        setErrors({
            newSlideTitle: '',
            newSlideUrl: '',
            newSlideTime: ''
        });
    }, 7000);

    return isValid;

    };

    const handleAddSlide = async () => {
        if (!validateInputs()) return;

        // Ajuste para agregar 'https://' a la URL si es necesario
        let adjustedUrl = newSlideUrl.trim();
        if (adjustedUrl && !adjustedUrl.startsWith('http://') && !adjustedUrl.startsWith('https://')) {
            adjustedUrl = 'https://' + adjustedUrl;
        }

        // Validar que la URL ajustada sea valida
        const urlPattern = new RegExp ('^(https?:\\/\\/)?'+ // protocolo
            '((([a-zA-Z0-9$-_@.&+!*\\(\\),]+\\.?)+)|'+ // dominio y subdominio
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // o una dirección IP (v4)
            '(\\:\\d+)?(\\/[-a-zA-Z0-9%_.~+&:]*)*'+ // puerto y ruta opcional
            '(\\?[;&a-zA-Z0-9%_.~+=-]*)?'+ // cadena de consulta opcional
            '(\\#[-a-zA-Z0-9_]*)?$','i'); // fragmento opcional
            
        if (!urlPattern.test(adjustedUrl)) {
            setErrors({ ...errors, newSlideUrl: "• Por favor, ingrese una URL válida."});
            return;
        }

        const newSlide = { 
            slideId: 0,
            titleSlide: newSlideTitle, 
            uRL: adjustedUrl, 
            time: parseInt(newSlideTime), // Asegurarse de que sea un número
            boardId: parseInt(boardId), // Asegurarse de que sea un número
            statusSlide: true, // El slide estará activo por defecto
            createdSlideBy: "frontend-user",
            editedSlideBy: "frontend-user"
        };

        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const response = await axios.post('https://localhost:7296/api/v2/slides', newSlide, config);
            setSlides([...slides, response.data]); // Agregar el slide recién creado
            resetForm();
            showMessage("Slide creado exitosamente.", "success");
        } catch (error) {
            console.error("Error adding slide:", error);
            if (error.response && error.response.status === 401) {
                showMessage('No autorizado. Por favor, inicia sesion nuevamente.', "error");
            } else {
                showMessage("Error al crear el slide.", "error");
            }
        }
    };

        // Llama a esta función cuando vayas a crear un nuevo slide
    const handleCreateNewSlide = () => {
        // Limpiar campos antes de crear un nuevo slide
        setNewSlideTitle('');
        setNewSlideUrl('');
        setNewSlideTime('');
        handleAddSlide();
    };

    const handleToggleActive = async (index) => {
        const slideToToggle = slides[index];

        if (!slideToToggle || !slideToToggle.slideId) {
            console.error("Slide no encontrado o ID no definido");
            showMessage("Slide no encontrado o ID no definido", "error");
            return;
        }

        const updatedStatus = !slideToToggle.statusSlide;
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            // Llama al endpoint para cambiar el estado del slide
            await axios.patch(`https://localhost:7296/api/v2/slides?id=${slideToToggle.slideId}`, 
                {statusSlide: updatedStatus }, 
                config
            );

            // Actualiza el estado local para reflejar el cambio
            const updatedSlides = slides.map((slide, i) =>
                i === index ? { ...slide, statusSlide: updatedStatus } : slide
            );
            setSlides(updatedSlides);

            const messageText = updatedStatus ? "Slide activado." : "Slide desactivado.";
            displayMessage(messageText, "success");
        } catch (error) {
            console.error("Error updating slide status:", error);
            showMessage("Error al actualizar el estado del slide.", "error");
        }
    };

    const handleEditSlide = (index) => {
        const slide = slides[index];
        if (slide) {
            setSlideToEdit(slide); // Almacena el slide a editar
            setTitle(slide.titleSlide);
            setUrl(slide.uRL);
            setTime(slide.time);
            setIsModalOpen(true); // Abre el modal
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSlideToEdit(null);
        resetForm();
    };

    const resetForm = () => {
        setNewSlideTitle('');
        setNewSlideUrl('');
        setNewSlideTime('');
    };

    const openEditModal = (slide) => {
        setSlideToEdit(slide);
        setIsModalOpen(true);
    };

    const handleSaveSlide = async (updatedSlide) => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },

        };

        try {
            await axios.patch(`https://localhost:7296/api/v2/slides?id=${updatedSlide.slideId}`, updatedSlide, config);
            
            const updatedSlides = slides.map(slide => 
                slide.slideId === updatedSlide.slideId 
                ? { ...slide, ...updatedSlide }
                :slide
            );

            setSlides(updatedSlides);
            showMessage("Slide actualizado exitosamente.", "success");
        } catch (error) {
            console.error("Error updating slide:", error);
            showMessage("Error al actualizar el slide.", "error")
        }
        handleCloseModal();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br-from-green-200 to-green-100 p-4 flex flex-col">
            <header className="bg-[#0a361a] text-white p-6 flex flex-col md:flex-row md:items-center justify-between">
                <h1 className="text-3xl font-bold cursor-pointer" onClick={() => window.history.back()}>BoardCtrl</h1>
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 transition duration-300" onClick={() => window.history.back()}
                >
                    Volver
                </button>
            </header>

            <h2 className="bg-green-900 text-white text-2xl p-3 font-bold rounded-lg text-center mt-4 mb-4">Tablero: {boardName || 'Nombre del tablero'}</h2>

            <div className="flex flex-wrap gap-16 mb-4">
                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        className="w-full md:w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 ml-4"
                        placeholder="Título"
                        value={newSlideTitle}
                        onChange={(e) => setNewSlideTitle(e.target.value.slice(0,50))}
                    />
                    {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="w-full md:w-auto">
                    <input 
                        type="url"
                        className="w-full md:w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                        placeholder="URL"
                        value={newSlideUrl}
                        onChange={(e) => setNewSlideUrl(e.target.value.slice(0,120))}
                        pattern="https?://.+"
                        required
                        title="Por favor, ingrese una URL valida que comience con http:// o https://"
                    />
                    {errors.url && <p className="text-red-500 mt-1">{errors.url}</p>}
                </div>

                <div className="w-full md:w-auto">
                    <input 
                        type="number"
                        className="w-full md:w-52 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                        placeholder="Tiempo (en minutos)"
                        value={newSlideTime}
                        onChange={(e) => {
                            const value = e.target.value;

                            // Permitir solo numeros y limitar a 5 digitos
                            if (/^\d{0,5}$/.test(value) && (value === '' || parseInt(value) <= 10000)) {
                                setNewSlideTime(value);
                            }
                        }}
                        min="1"
                        max="10000"
                        onKeyDown={(e) => {
                        // Previene la entrada de caracteres no numericos
                        if (e.key === '-' || e.key === '+' || e.key === 'e'){
                            e.preventDefault();
                        }
                    }}
                />
                {errors.time && <p className="text-red-500 mt-1">{errors.time}</p>}
                </div>
                <button 
                    className="bg-[#035711] hover:bg-green-700 text-white py-3 px-6 rounded-lg transition duration-300" 
                    onClick={handleAddSlide}
                >
                    Agregar
                </button>
            </div>

            {/* Mensaje de validacion o exito */}
            {message.text && (
            <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${message.type === 'error'?'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'} transition-all duration-500`}
                style={{ animation: 'fadeOut 5s forwards' }}
            >
                <p>{message.text}</p>
            </div>
            
            )}

            <div className="bg-white rounded-lg shadow-lg p-6 flex-grow">
                <h3 className="text-lg font-semibold mb-4">Lista de Slides</h3>
                <div className="grid grid-cols-4 gap-44">
                    <div className="ml-6">Nombre</div>
                    <div className="ml-12">URL</div>
                    <div className="-ml-1">Tiempo</div>
                    <div className="-ml-12">Acciones</div>
                </div>
                {slides.map((slide, index) => (
                    <div key={index} className="grid grid-cols-4 gap-16 items-center py-4 border-b">
                        <div className="ml-6">{slide.titleSlide}</div>
                        <div className="-ml-14 w-80 truncate">{slide.uRL}</div>
                        <span className="ml-20">{slide.time}</span>
                        
                        <div className="-ml-16 flex gap-2">
                            <button 
                                className={`py-2 px-4 rounded-lg text-white ${
                                 slide.statusSlide ? 'bg-red-600' : 'bg-green-600'
                                } hover:opacity-80 transition duration-300`}
                                onClick={() => handleToggleActive(index)}
                            >
                                {slide.statusSlide ?'Desactivar':'Activar'}
                            </button>
                            <button 
                                className="bg-yellow-400 hover:bg-yellow-500 text-white py-2 px-4 rounded-lg transition duration-300" 
                                onClick={() => handleEditSlide(index)}
                            >
                                Editar
                            </button>
                            <button 
                                className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300"
                                onClick={() => window.open(slide.uRL, '_blank')}
                            >
                                Mostrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <EditSlideModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slideToEdit={slideToEdit}
                onSave={handleSaveSlide}
            />

            <footer className="bg-[#0a361a] text-white p-5 text-center mt-auto">
                <p>@ 2024 FINANZAUTO</p>
            </footer>
        </div>
    );
};

const EditSlideModal = ({ isOpen, onClose, slideToEdit, onSave }) => {
    const [editedTitle, setEditedTitle] = useState('');
    const [editedUrl, setEditedUrl] = useState('');
    const [editedTime, setEditedTime] = useState('');

    useEffect(() => {
        if (slideToEdit) {
            setEditedTitle(slideToEdit.titleSlide);
            setEditedUrl(slideToEdit.uRL);
            setEditedTime(slideToEdit.time);
        } else {
            setEditedTitle('');
            setEditedUrl('');
            setEditedTime('');
        }
    }, [slideToEdit]);

    if (!isOpen || !slideToEdit) return null;

    const handleSave = () => {
        const updatedSlide = {}
            if (editedTitle !== slideToEdit.titleSlide) updatedSlide.titleSlide = editedTitle;
            if (editedUrl !== slideToEdit.uRL) updatedSlide.uRL = editedUrl;
            if (editedTime !== slideToEdit.time) updatedSlide.time = editedTime;
            
        updatedSlide.slideId = slideToEdit.slideId;

        onSave(updatedSlide);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Editar Slide</h3>
                <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value.slice(0,50))}
                    placeholder="Título"
                    className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 
                    focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />

                <input
                    type="text"
                    value={editedUrl}
                    onChange={(e) => setEditedUrl(e.target.value.slice(0,120))}
                    placeholder="URL"
                    className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 
                    focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />

                <input
                    type="number"
                    value={editedTime}
                    placeholder="Tiempo(min)"
                    onChange={(e) => {
                        const value = e.target.value;

                        // Permitir solo numeros y limitar a 5 digitos
                        if (/^\d{0,5}$/.test(value) && (value === '' || parseInt(value) <= 10000)) {
                            setEditedTime(value);
                        }
                    }}
                    min="1"
                    max="10000"
                    onKeyDown={(e) => {
                    // Previene la entrada de caracteres no numericos
                    if (e.key === '-' || e.key === '+' || e.key === 'e'){
                        e.preventDefault();
                    }
                }}
                    className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 
                    focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />

                <div className="flex justify-end space-x-4">
                <button 
                    className="bg-green-500 hover:bg-green-600 transition duration-300 text-white py-2 px-4 rounded-md focus:outline-none"
                    onClick={handleSave}
                >
                    Guardar
                </button>
                <button 
                    className="bg-red-500 hover:bg-red-600 transition duration-300 text-white py-2 px-4 rounded-md focus:outline-none"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>  
    </div>
    );
};

export default Slides;