// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import your page components
import Upload from './Upload';
import Download from './Download';

import Login from './Login'; // The login component

import './App.css'; // Import your styles


function App() {
  // State to track if the user is logged in.
  // It checks localStorage for an 'authToken' on initial load.
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

  // Function to handle a successful login.
  // It receives the token from LoginPage, stores it, and updates the login state.
  const handleLoginSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
  };

  // Function to handle user logout.
  // It removes the token from localStorage and updates the login state.
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    // After logout, you'll be automatically redirected to /login by the Routes configuration.
  };
    const showNavBar = isLoggedIn && location.pathname !== '/download'; // 

  return (
    // Router component from react-router-dom enables navigation.
    <Router>
      <div className="App">
        
       
        
        {/* Navigation buttons: shown only when the user is logged in */}
        {isLoggedIn && (
          <>
            
           
          </>
        )}

        {/* Routes define which component to render based on the URL */}
        <Routes>
          {/* Public Route: Login Page */}
          {/* If logged in, redirect to /upload; otherwise, render LoginPage */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/upload" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Protected Route: Upload Page */}
          {/* If logged in, render Upload; otherwise, redirect to /login */}
          <Route
            path="/upload"
            element={isLoggedIn ? <Upload /> : <Navigate to="/login" replace />}
          />

          {/* Protected Route: Download Page */}
          {/* If logged in, render DownloadPage; otherwise, redirect to /login */}
          <Route
            path="/download"
            element={isLoggedIn ? <Download /> : <Navigate to="/login" replace />}
          />

          {/* Default Route: Redirect based on login status */}
          {/* This handles direct access to the root URL (e.g., http://localhost:3000/) */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/upload" replace /> : <Navigate to="/login" replace />}
          />

 




        </Routes>
      </div>
    </Router>
  );
}

export default App;