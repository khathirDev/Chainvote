

import { ConnectButton } from "@mysten/dapp-kit";
import { useNavigation } from "../providers/navigation/NavigationContext";

const Navbar = () => {
   
    const {navigate} = useNavigation();
    
    return(
        <nav className="bg-gray-200 dark:bg-gray-800 p-4 shadow-md">
            <div className="flex justify-between">
           
             <button onClick={() => navigate("/")} className="flex items-center space-x-2 hover:opacity-80 transition-opacity bg-transparent border-none ml-5">
                    <img src="/icon.svg" alt="Chainvote Logo" className="w-8 h-8" />
                    <span className="text-xl font-bold text-gray-300">Chainvote</span>
            </button>
            <ConnectButton/>
            </div>
            

        </nav>
    )
}


export default Navbar