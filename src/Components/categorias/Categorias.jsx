import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Categorias = () => {
    // Definir estados locales para gestionar las categorias y otros datos
    const [categorias, setCategorias] = useState([]); // Estado para las categorias
    const [newCategory, setNewCategory] = useState (''); // Estado para la nueva categoria
    const [editingCategoryId, setEditingCategoryId] = useState(null); // ID de la categoria en edición
    const [editingTitleCategory, setEditingTitleCategory] = useState(''); // Título de la categoria en edición
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para mostrar el modal
    const [message, setMessage] = useState(''); // Mensaje de notificación
    const [messageType, setMessageType] = useState(''); // Tipo de notificación (exito o error)
    const [showNotification, setShowNotification] = useState(false); // Estado para mostrar la notificación
    const [showMenu, setShowMenu] = useState(false); // Estado para mostrar el menú desplegable del usuario
    const [page, setPage] = useState (1); // Número de página para la paginación
    const [pageSize, setPageSize] = useState(5); // Tamaño de página para la paginación
    const [totalPages, setTotalPages] = useState(1); // Total de paginas disponibles en la API
    const navigate = useNavigate(); // Hook para la navegacion de rutas

// useEffect para cargar categorias al montar el componente o al cambiar la pagina/paginaSize
useEffect(() => {
    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                showMessage('Usuario no autenticado.', 'error');
                return;
            }

            const response = await axios.get(`https://localhost:7296/api/v2/categories?page=${page}&pageSize=${pageSize}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Datos de la API: ", response.data);
            console.log("Datos de la API: ", response.data.items);

            // Mapeo para extraer y asignar los datos a cada categoria
            const categoriasMapped = response.data.items.map(categoria => ({
                categoryId: categoria.categoryId,
                titleCategory: categoria.titleCategory,
                status: categoria.statusCategory,
                createdCategoryBy: categoria.createdCategoryBy,
                editedCategoryBy: categoria.editedCategoryBy
            }));

            setCategorias(categoriasMapped); // Actualizar las categorias en el estado
            setTotalPages(response.data.totalPages); // Total de páginas desde la respuesta
        } catch (error) {
            // Manejo de error y redireccion a login si el token ha expirado
            showMessage('El token ha vencido. Por favor, inicia sesion nuevamente.', 'error');
            localStorage.removeItem('token');

            setTimeout(() => {
                navigate('/');
            }, 5000);
            showMessage('Error al obtener las categorias:', 'error');
        }
    };

    fetchCategorias();
}, [page, pageSize]);

// Función para mostrar un mensaje de notificación
const showMessage = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setShowNotification(true);

    setTimeout(() => {
        setShowNotification(false);
    }, 5000);
};

// Cambiar página en la paginación
const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
        setPage(newPage);
    }
};

// Maneja el cambio de tamaño de pagina
const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1); // Reinicia a la primera pagina despues de cambiar el tamaño
};

// Agregar una nueva categoria
const handleAddCategory = async () => {
    if (!newCategory.trim()) {
        showMessage('El nombre de la categoria no puede estar vacio.', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            showMessage('Usuario no autenticado.', 'error');
            return;
        }

        const response = await axios.post('https://localhost:7296/api/v2/categories', {
            titleCategory: newCategory,
            statusCategory: true
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Agregar la nueva categoria a la lista existente y limpiar el input
        setCategorias([...categorias, response.data]);
        setNewCategory(''); // Limpiar el input despues de agregar
        showMessage('Categoria agregada correctamente.', 'success');
    } catch (error) {
        showMessage('Error al agregar la categoria.', 'error');
    }
};

// Cambiar el estado de habilitación de una categoria
const handleToggleCategory = async (categoryId) => {
    const category = categorias.find(c => c.categoryId === categoryId);
    const isActive = category?.status;

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            showMessage('Usuario no autenticado.', 'error');
            return;
        }

        await axios.patch(`https://localhost:7296/api/v2/categories?id=${categoryId}`,
            { StatusCategory: !isActive },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Alternar el estado de habilitación de la categoria en el estado local
        setCategorias(categorias.map(categoria =>
            categoria.categoryId === categoryId ? { ...categoria, status: !isActive } : categoria
        ));
        showMessage(`Categoria ${isActive ? 'deshabilitada' : 'habilitada'} correctamente.`, 'success');
    } catch (error) {
        showMessage(`Error al ${isActive ? 'deshabilitar' : 'habilitar'} la categoria`, 'error');
    }
};

// Configurar la categoria seleccionada para editar
const handleEditCategory = (categoryId, titleCategory) => {
    setEditingCategoryId(categoryId);
    setEditingTitleCategory(titleCategory);
    setIsModalOpen(true);
};

// Actualizar la categoria editada
const handleUpdateCategory = async () => {
    if (!editingTitleCategory.trim()) {
        showMessage('El nombre de la categoria no puede estar vacio.', 'error');
        return;
    }

    try {
        console.log("ID de categoria en edicion: ", editingCategoryId);
        const token = localStorage.getItem('token');

        if (!token) {
            showMessage('Usuario no autenticado.', 'error');
            return;
        }

        await axios.patch(`https://localhost:7296/api/v2/categories?id=${editingCategoryId}`, {
            titleCategory: editingTitleCategory,
            statusCategory: true
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Actualizar la lista de categorias en el estado
        setCategorias(categorias.map(categoria =>
            categoria.categoryId === editingCategoryId ? { ...categoria, titleCategory: editingTitleCategory } : categoria
        ));

        // Limpiar el estado de edicion
        setEditingCategoryId(null);
        setEditingTitleCategory('');
        setIsModalOpen(false); // Cerrar el modal despues de actualizar
        showMessage('Categoria actualizada correctamente.', 'success');
    } catch (error) {
        showMessage('Error al actualizar la categoria.', 'error');
    }
};

const handleBoardsClick = () => {
    navigate('/Boards');
};

const handleUpdateProfile = () => {
    // Logica para actualizar el perfil
    showMessage('Funcion de actualizacion de perfil aun no implementada.', 'info');
};

// Función de cierre de sesión
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
}

// Obtener el nombre de usuario del almacenamiento local
const userName = localStorage.getItem('username');

const toggleMenu = () => {
    setShowMenu(!showMenu); // Alternar menu desplegable del usuario
};

    // useEffect para detectar clics fuera del menú desplegable y cerrarlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            const userContainer = document.querySelector('.user-container');
            const dropdownMenu = document.querySelector('.dropdown-menu');

        // Cerrar el menu si se hace clic fuera de la zona del menu o del contenedor del usuario
        if (showMenu && userContainer && !userContainer.contains(event.target) && 
        dropdownMenu && !dropdownMenu.contains(event.target)) {
            setShowMenu(false);
        }
    };

    // Escucha clics en el documento
    document.addEventListener('mousedown', handleClickOutside);

        return () => {
            // Limpiar el listener al desmontar el componente
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]); // Ejecutar el efecto cuando cambia el estado de showMenu

    return (
        <div className="categorias-container bg-green-250 min-h-screen p-4"> {/* Cambié bg-green-200 a bg-green-50 */}
            <header className="flex items-center justify-between bg-[#0a361a] text-white p-4">
                <div className="logo text-3xl font-bold cursor-pointer" onClick={handleBoardsClick}>BoardCtrl</div>
                <div className="flex-grow text-center">
                    <button className="boards-button bg-white text-black border-2 border-black rounded-lg px-4 py-2 font-bold transition duration-300 hover:bg-gray-200" onClick={handleBoardsClick}>
                        Boards
                    </button>
                </div>
                <div className="relative flex items-center ml-auto user-container cursor-pointer" onClick={toggleMenu}>
                    <span className="usuario text-lg">{userName}</span>
                    <FaUserCircle className="ml-2 text-white text-2xl" />
                    {showMenu && (
                        <div className="dropdown-menu absolute bg-gray-300 border border-gray-400 rounded shadow-lg mt-16 right-0 z-10">
                            <div className="block w-full text-left p-2 bg-white hover:bg-gray-200 transition duration-300 text-black" onClick={handleLogout}>Cerrar Sesion</div>
                        </div>
                    )}
                </div>
            </header>
    
            <h2 className="text-white bg-[#104319] p-4 rounded mt-4 text-center text-2xl font-bold">
                Categorias
            </h2>
    
            <div className="flex flex-col items-start space-y-4 p-4">
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value.slice(0, 50))}
                placeholder="Nombre de la categoria"
                className="w-full p-3 border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-300 transition duration-150 ease-in-out"
            />
            <button 
                onClick={handleAddCategory}
                className="bg-[#035711] text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 ease-in-out text-center">Agregar Categoria</button>
            </div>
            <ul className="list-none mt-4 w-full">
                {categorias && categorias.length > 0 ? (
                    categorias
                        .map((categoria) => (
                        <li key={categoria.categoryId} className="bg-[#F8F9FA] p-3 flex justify-between items-center border-b border-gray-300">
                            <span className="flex-1">{categoria.titleCategory}</span>
                            <button className="button-categorias bg-yellow-400 text-white rounded px-3 py-2 hover:bg-yellow-500 transition duration-300" onClick={() => handleEditCategory(categoria.categoryId, categoria.titleCategory)}>Editar</button>
                            <button className={`button-categorias ml-2 ${categoria.status ? 'bg-red-600' : 'bg-green-600'} text-white rounded px-3 py-2 hover:opacity-80 transition duration-300`} onClick={() => handleToggleCategory(categoria.categoryId)}>
                                {categoria.status ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="text-center text-gray-500">No hay categorias disponibles</li>
                )}
            </ul>
    
            <div className="pagination flex justify-center mt-4">
                <button className="page-button bg-gray-200 text-black hover:bg-gray-300 transition duration-300 rounded-lg px-3 py-1 mx-1 cursor-pointer" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Anterior</button>
                <span className="text-gray-700">Página {page} de {totalPages}</span>
                <button className="page-button bg-gray-200 text-black hover:bg-gray-300 transition duration-300 rounded-lg px-3 py-1 mx-1" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Siguiente</button>
            </div>
    
            {showNotification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg transition transform dutation-500 ease-out
                    ${
                        showNotification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    } ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'}
                 text-white text-sm`}>
                    {message}
                </div>
            )}
    
            {isModalOpen && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="modal-content bg-white rounded p-4">
                        <h3 className="text-xl font-bold">Editar Categoria</h3>
                        <input
                            type="text"
                            value={editingTitleCategory}
                            onChange={(e) => setEditingTitleCategory(e.target.value.slice(0, 50))}
                            className="border border-gray-300 rounded p-2 w-full mt-2"
                        />
                        <div className="flex justify-end mt-4">
                            <button className="bg-blue-500 text-white rounded px-4 py-2 mr-2" onClick={handleUpdateCategory}>Actualizar</button>
                            <button className="bg-red-500 text-white rounded px-4 py-2" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            <footer className="bg-[#0a361a] text-white p-5 text-center mt-auto">
                <p>@ 2024 FINANZAUTO</p>
            </footer>
        </div>
    );        
};

export default Categorias;