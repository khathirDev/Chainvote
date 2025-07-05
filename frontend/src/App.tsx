import React from "react";
import { useTheme } from "./providers/theme/ThemeContext";
import ProposalView from "./views/ProposalView";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer";


const App: React.FC = () => {
  const { darkMode }  = useTheme();

  return (

    <>
      <ToastContainer/>
        <div className={`${darkMode ? "dark" : ""}`}>
          <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <Navbar/>
            <div className="max-w-screen-xl m-auto pt-16">
              <ProposalView />
            </div>
            <Footer/>
          </div>
        </div>
    </>
  );
};

export default App;
