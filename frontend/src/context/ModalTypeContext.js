import { createContext, useState } from 'react';

const ModalTypeContext = createContext();

export const ModalTypeProvider = ({ children }) => {
    const [modalType, setModalType] = useState(null);

    return (
        <ModalTypeContext.Provider value={{ modalType, setModalType }}>
            {children}
        </ModalTypeContext.Provider>
    );
};

export default ModalTypeContext;
