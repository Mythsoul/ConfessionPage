import React from 'react';
import { useNavigate } from "react-router-dom";
import "./error-page.css"; 

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div id="error-page" className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-red-900">
      <h1 className="text-6xl font-bold mb-4">Oops!</h1>
      <p className="text-xl mb-4">Sorry, an unexpected error has occurred.</p>
      <p className='text-sm mb-6 text-blue-900'>BRO WHERE U CAME ? U Alright ? </p>
      <button 
        onClick={handleGoHome} 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Home Page
      </button>
    </div>
  );
};

export default ErrorPage;