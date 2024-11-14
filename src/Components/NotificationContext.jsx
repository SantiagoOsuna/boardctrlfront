import { type } from "@testing-library/user-event/dist/type";
import React, { Children, createContext, useState } from "react";
import { BiMessageSquare } from "react-icons/bi";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type) => {
        const newNotification = { message, type, id: Date.now() };
        setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
    };

    return (
        <NotificationContext.Provider value = {{ notifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};