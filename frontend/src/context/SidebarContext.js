import { createContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isOpenSidebar, setIsOpenSidebar] = useState(null);

    return (
        <SidebarContext.Provider value={{ isOpenSidebar, setIsOpenSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export default SidebarContext;
