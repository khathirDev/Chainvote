import { useContext, createContext } from "react";

type NavigationContextType = {
    currentPage: string;  // The current page the user is on
    navigate: (page: string) => void;
};



export const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        console.error("useNavigation must be used within a NavigationProvider");
        throw new Error("useNavigation must be used within a NavigationProvider");
        
    }
    return context
}