import { useEffect, useState } from "react"
import { NavigationContext } from "./NavigationContext";




const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState(window.location.pathname);
    const navigate = (page: string) => {
        setCurrentPage(page)
        window.history.pushState(null, "", page);
    };

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPage(window.location.pathname);
        }

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        }
    })
    return (
        <NavigationContext.Provider value={{currentPage, navigate}}>
            {children}
            </NavigationContext.Provider>
    )
}

export default NavigationProvider