import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Boards = () => {
    const [boardsByCategory, setBoardsByCategory] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [boardCurrentPage, setBoardCurrentPage] = useState(1); // Pagina actual de tableros
    const [boardTotalPages, setBoardTotalPages] = useState({}); // Total de paginas por categoria
    const [editingBoard, setEditingBoard] = useState(null); // Estado para manejar la edición
    const [newTitle, setNewTitle] = useState(''); // Estado para el nuevo título
    const [newDescription, setNewDescription] = useState(''); // Estado para la nueva descripción
    const [statusBoard, setStatusBoard] = useState(true); // Estado para el estado del tablero
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // Estado para mensajes de éxito/error
    const [error, setError] = useState(null);
    const menuRef = useRef(null);
    const editingBoardRef = useRef(null);
    const navigate = useNavigate(); // Usar useNavigate para redireccionar

    const recordsPerPage = 5;

    // Función para mostrar mensajes
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 5000); // El mensaje se borra después de 5 segundos
    };

    const validateBoardData = (title, description) => {
        if (!title.trim()) {
            setMessage({ text: 'El titulo no puede estar vacio', type: 'error' });
            return false;
        }
        if (!description.trim()) {
            setMessage({ text: 'La descripcion no puede estar vacia', type: 'error' });
            return false;
        }
        return true;
    };

    useEffect(() => {
        loadCategoriesAndBoards();
    }, [currentPage]);

    const loadCategoriesAndBoards = async () => {
        try {
            const { categories, totalPages: catTotalPages } = await fetchCategories(currentPage);
            const allBoards = {};
            const totalPagesMap = {};

            for (const category of categories) {
                if (!category.statusCategory) continue;
                const { boards, totalPages: boardTotalPages } = await fetchBoardsByCategory(category.categoryId, 1);

                allBoards[category.categoryId] = {
                    categoryName: category.titleCategory,
                    boards: boards || [],
                    totalPages: boardTotalPages || 1,
                    isOpen: false
                };
                
                totalPagesMap[category.categoryId] = boardTotalPages || 1;
            }

            setBoardsByCategory(allBoards);
            setTotalPages(catTotalPages);
            setBoardTotalPages(totalPagesMap);
            const currentPageMap = {};
            categories.forEach(category => {
                if (category.statusCategory) currentPageMap[category.categoryId] = 1;
            });
            setBoardCurrentPage(currentPageMap);
        } catch (error) {
            console.error("Error loading boards:", error);
            setError("No se pudieron cargar las categorías o los tableros. Por favor, intente nuevamente.");
        }
    };

    // Fetch categories and boards remains unchanged
    const fetchCategories = async (page) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`https://localhost:7296/api/Categories/FullCategories?page=${page}&pageSize=5`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const { items, totalPages } = response.data;
            console.log("Fetched categories:", items);
            return { categories: items, totalPages };
        } catch (error) {
            if (error.response && error.response.status === 401) {
                showMessage('El token ha vencido. Redirigiendo al login...', 'error');

                localStorage.removeItem('token');

                setTimeout(() => {
                    navigate('/');
                }, 5000);
            } else {
                showMessage('No se encontraron Boards.', 'error');
            }
            console.error("Error fetching slides:", error);
        }
    };

    const fetchBoardsByCategory = async (categoryId, page) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`https://localhost:7296/api/Board/list-boards-by-category`, {
                params: {
                    categoryId: categoryId,
                    pageNumber: page,
                    pageSize: recordsPerPage
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return {
                boards: response.data.boards || [],
                totalPages: response.data.totalPages || 1
            };
        } catch (error) {
            if (error.response && error.response.status === 401) {
                showMessage('El token ha vencido. Por favor, inicia sesion nuevamente.', 'error');
                localStorage.removeItem('token');

                setTimeout(() => {
                    navigate('/');
                }, 5000);
            } else {
                showMessage('Error al obtener los boards', 'error');
            }
            console.error('Error fetching boards by category:', error);
            return { categoryName: '', boards: [], totalPages: 0 };
        }
    };


    const handleToggleAccordion = (categoryId) => {
        setBoardsByCategory((prev) => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                isOpen: !prev[categoryId]?.isOpen,
            },
        }));
    };

    const handleBoardPageChange = async (categoryId, newPage) => {
        // Ensure newPage is within valid range
        if (newPage < 1 || newPage > boardsByCategory[categoryId].totalPages) return;
        // Update the current page for this category
        setBoardCurrentPage(prev => ({
            ...prev,
            [categoryId]: newPage
        }));
    
        // Fetch the new boards for this category and page
        const { boards, totalPages } = await fetchBoardsByCategory(categoryId, newPage);
        
        // Update the state with new boards
        setBoardsByCategory(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                boards: boards,
                totalPages: totalPages,
            }
        }));
    };
    

    // Funcion para cargar tableros de la categoria actual
    const loadBoardsForCategory = async (categoryId, page) => {
        try {
            const { categoryName, boards } = await fetchBoardsByCategory(categoryId, page);
            setBoardsByCategory((prev) => ({
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    categoryName,
                    boards,
                    totalPages: boardTotalPages[categoryId],
                },
            }));
        } catch (error) {
            console.error("Error loading boards for category:", error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleEditBoard = (boardId, currentTitle, currentDescription, currentStatus) => {
        setEditingBoard(boardId);
        setNewTitle(currentTitle); // Establecer el título actual para editar
        setNewDescription(currentDescription); // Establecer la descripción actual para editar
        setStatusBoard(currentStatus); // Establecer el estado actual para editar
    };

    const handleClickOutside = (event) => {
        if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpen(false);
        }
        if (editingBoardRef.current && !editingBoardRef.current.contains(event.target)) {
            setEditingBoard(null);
            setNewTitle('');
            setNewDescription('');
            setStatusBoard(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleSlides = (boardId, categoryId) => {
        navigate(`/Slides?boardId=${boardId}&categoryId=${categoryId}`)
    }

    const handleSaveTitle = async () => {
        if (!validateBoardData(newTitle, newDescription))
            return;

        const token = localStorage.getItem('token');
        const updatedBoard = {
            boardId: editingBoard,
            titleBoard: newTitle,
            descriptionBoard: newDescription,
            statusBoard: statusBoard
        };

        try {
            await axios.put(`https://localhost:7296/api/Board/Update?id=${editingBoard}`, updatedBoard, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Llamada a loadCategoriesAndBoards para recargar las categorias y tableros tras la edición
            await loadCategoriesAndBoards();
            setMessage({ text: 'Tablero actualizado correctamente', type: 'success' });
            // Resetear los estados de edición
            setEditingBoard(null);
            setNewTitle('');
            setNewDescription('');
            setStatusBoard(false);
        } catch (error) {
            console.error('Error al actualizar el tablero:', error);
            setMessage({ text: 'Error al actualizar el tablero', type: 'error' });
        }
    };

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleCreateBoard = async (categoryId) => {
        if (!validateBoardData(newBoardTitle, newBoardDescription))
            return;

        const token = localStorage.getItem('token');
        const newBoard = {
            titleBoard: newBoardTitle,
            descriptionBoard: newBoardDescription,
            statusBoard: statusBoard,
            categoryId: categoryId // Asociar el nuevo board a una categoria
        };

        try {
            const response = await axios.post('https://localhost:7296/api/Board/Create', newBoard, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                await loadCategoriesAndBoards();
                setNewBoardTitle('');
                setNewBoardDescription('');
                setStatusBoard(true);
                setMessage({ text: 'Tablero creado correctamente', type: 'success' });

                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Error creating new board:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el tablero';
            setMessage({ text: 'Error al crear el tablero', type: 'error' });

            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        }
    };

    const refreshBoards = async () => {
        try {
            const { categories } = await fetchCategories(currentPage);
            const fetchBoardPromises = categories.map(async (category) => {
                const { categoryName, boards } = await fetchBoardsByCategory(category.categoryId, 1);
                return { categoryId: category.categoryId, categoryName, boards };
            });

            const boardsData = await Promise.all(fetchBoardPromises);
            const allBoards = {};
            boardsData.forEach(({ categoryId, categoryName, boards }) => {
                if (boards.length > 0) {
                    allBoards[categoryId] = { categoryName, boards };
                }
            });

            setBoardsByCategory(allBoards);
        } catch (error) {
            console.error('Error fetching boards:', error);
        }
    };

    const handleMostrar = async (boardId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`https://localhost:7296/api/Slides/List-Slide-by-board?boardId=${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.length === 0) {
                setMessage({ text: 'No hay slides disponibles para este board', type: 'error' });
                return;
            }
            if (response.data.length > 0) {
                const slides = response.data;
                const activeSlides = slides.filter(slide => slide.statusSlide === true);

                if (activeSlides.length > 0) {
                    let currentIndex = 0;
                    const newTab = window.open(activeSlides[currentIndex].uRL, '_blank');

                    const showNextSlide = () => {
                        const currentSlide = activeSlides[currentIndex];
                        const currentUrl = currentSlide.uRL;

                        newTab.location.href = currentUrl;

                        // Cambiar al siguiente slide
                        currentIndex = (currentIndex + 1) % activeSlides.length; // Reinicia el indice si llega al final

                        // Cambia el slide despues de un tiempo
                        setTimeout(showNextSlide, currentSlide.time * 60 * 1000);
                    };

                    showNextSlide();
                } else {
                    alert('No hay slides disponibles para este board');
                }
            } else {
                alert('No hay slides activos disponibles para este board');
            }
        } catch (error) {
            console.error("Error fetching slides:", error);
            setMessage({ text: 'No se encontraron slides', type: 'error' });
        }
    };

    const userName = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleUpdate = () => {
        // Implementa la lógica para actualizar datos
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }

    const handleClickOutsideP = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutsideP);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideP);
        };
    }, []);

    const clearMessage = () => {
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-x-auto p-5 dashboards-container">
            <header className="bg-[#0a361a] text-white p-6 flex flex-col md:flex-row md:items-center justify-between">
                <h1 className="text-3xl font-bold">BoardCtrl</h1>
                <nav>
                    <ul className="ml-10 flex space-x-4">
                        <li>
                            <a href="/boards" className="bg-white text-black font-semibold py-2 px-4 rounded shadow hover:bg-gray-200 transition duration-200">Boards</a>
                        </li>
                        <li>
                            <a href="/categorias" className="bg-white text-black font-semibold py-2 px-4 rounded shadow hover:bg-gray-200 transition duration-200">Categorias</a>
                        </li>
                    </ul>
                </nav>
                <div className="flex items-center relative mt-4 md:mt-0">
                    <span className="usuario text-lg mr-2 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>{userName}</span>
                    <FaUserCircle className="ml-(-1) text-white text-2xl" />
                    {menuOpen && (
                        <div ref={menuRef} className="absolute right-0 bg-white shadow-lg rounded mt-20">
                            <button className="block w-full text-left p-2 hover:bg-gray-200 transition duration-300 text-black" onClick={handleLogout}>Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </header>

            {/* Mostrar mensaje de error */}
            {error && <div className="text-red-500 mt-4">{error}</div>}

            {/* Mostrar mensaje de éxito o error */}
            {message.text && (
                <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg transition-opacity duration-500 ease-in-out ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {Object.keys(boardsByCategory).map(categoryId => (
                <div key={categoryId} className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg mt-8">
                    {/* Encabezado de la categoría para el acordeón */}
                    <h2 onClick={() => handleToggleAccordion(categoryId)}
                        className="text-xl text-black font-semibold cursor-pointer text-center py-4 border-b-2 border-[#065F46]"
                    >
                        {boardsByCategory[categoryId].categoryName} {boardsByCategory[categoryId].isOpen ? '−' : '+'}
                    </h2>

                    {/* Contenido del acordeón (tableros) */}
                    {boardsByCategory[categoryId]?.isOpen && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 ">
                                {boardsByCategory[categoryId].boards && boardsByCategory[categoryId].boards.length > 0 ? (
                                    boardsByCategory[categoryId].boards.map(board => (
                                        <div key={board.boardId} className="p-6 bg-white shadow-md rounded-lg flex flex-col justify-between border-b-2 border-black">
                                            {editingBoard === board.boardId ? (
                                                <div ref={editingBoardRef}>
                                                    <input
                                                        type="text"
                                                        value={newTitle}
                                                        onChange={(e) => setNewTitle(e.target.value.slice(0, 50))}
                                                        className="border p-2 rounded mb-2 w-full"
                                                        placeholder="Titulo"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newDescription}
                                                        onChange={(e) => setNewDescription(e.target.value.slice(0, 50))}
                                                        className="border p-2 rounded mb-2 w-full"
                                                        placeholder="Nueva descripción"
                                                    />
                                                    <select
                                                        value={statusBoard}
                                                        onChange={(e) => setStatusBoard(e.target.value === 'true')}
                                                        className="border p-2 rounded mb-2 w-full"
                                                    >
                                                        <option value="true">Activar</option>
                                                        <option value="false">Desactivar</option>
                                                    </select>
                                                    <button className="bg-orange-400 text-black rounded-lg px-4 py-2 hover:bg-orange-500" onClick={handleSaveTitle}>Guardar</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-bold">{board.titleBoard}</h3>
                                                    <p className="mb-4">{board.descriptionBoard || 'Descripcion del tablero'}</p>
                                                    <div className="flex flex-col items-center mt-2">
                                                        {/* Botones en forma de triángulo */}
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex justify-between w-full mb-1">
                                                                <button className="bg-[#FF7F50] text-black rounded-lg px-4 py-2 transition duration-300 transform hover:scale-105" onClick={() => handleEditBoard(board.boardId, board.titleBoard, board.descriptionBoard, board.statusBoard)}>Editar</button>
                                                                <button className="bg-[#00CED1] text-white rounded-lg px-4 py-2 transition duration-300 transform hover:scale-105 ml-2" onClick={() => handleMostrar(board.boardId)}>Mostrar</button>
                                                            </div>
                                                            <button className="bg-[#006D7D] text-white rounded-lg px-4 py-2 transition duration-300 transform hover:scale-105 modify-button mt-1" onClick={() => handleSlides(board.boardId, categoryId)}>Editar Slides</button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-full text-gray-500">No hay tableros en esta categoria.</p>
                                )}
                                {/* El botón de agregar tablero dentro del grid */}
                                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg flex flex-col justify-between">
                                    <h3 className="text-lg font-semibold">Agregar Tablero</h3>
                                    <input
                                        type="text"
                                        value={newBoardTitle}
                                        onChange={(e) => setNewBoardTitle(e.target.value.slice(0, 50))}
                                        placeholder="Titulo del nuevo tablero"
                                        className="border rounded w-full mb-2 p-2"
                                    />
                                    <input
                                        type="text"
                                        value={newBoardDescription}
                                        onChange={(e) => setNewBoardDescription(e.target.value.slice(0, 50))}
                                        placeholder="Descripcion del nuevo tablero"
                                        className="border rounded w-full mb-2 p-2"
                                    />
                                    <select
                                        value={statusBoard}
                                        onChange={(e) => setStatusBoard(e.target.value === 'true')}
                                        className="border rounded w-full mb-2 p-2"
                                    >
                                        <option value="true">Activar</option>
                                        <option value="false">Desactivar</option>
                                    </select>
                                    <button className="bg-orange-400 text-black rounded-lg w-full py-2 hover:bg-orange-500 transition duration-300" onClick={() => handleCreateBoard(categoryId)}>Crear Board</button>
                                </div>
                            </div>

                            {/* Agregar paginacion para los tableros de esta categoria */}
                            <div className="pagination mt-5 flex justify-between items-center">
                                <button
                                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition duration-300 cursor-pointer"
                                    onClick={() => handleBoardPageChange(categoryId, boardCurrentPage[categoryId] - 1)}
                                    disabled={boardCurrentPage[categoryId] === 1}>Anterior</button>
                                <span>Pagina {boardCurrentPage[categoryId]} de {boardsByCategory[categoryId].totalPages}</span>
                                <button
                                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition duration-300 cursor-pointer"
                                    onClick={() => handleBoardPageChange(categoryId, boardCurrentPage[categoryId] + 1)}
                                    disabled={boardCurrentPage[categoryId] === boardsByCategory[categoryId].totalPages}>Siguiente</button>
                            </div>
                        </>
                    )}
                </div>
            ))}

            {/* Paginacion de categorias */}
            <div className="pagination mt-5">
                <div className="flex justify-center space-x-2">
                    {[...Array(totalPages)].map((_, index) => (
                        <button key={index} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" onClick={() => handlePageChange(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <footer className="bg-[#0a361a] text-white p-5 text-center mt-auto">
                <p>@ 2024 FINANZAUTO</p>
            </footer>
        </div>
    );
};
export default Boards;