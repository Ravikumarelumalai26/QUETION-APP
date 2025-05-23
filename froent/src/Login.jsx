// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For programmatic navigation
import './login.css'; // Importing CSS for styling

function Login({ onLoginSuccess }) {
  // State for Register Number
  const [registerNumber, setRegisterNumber] = useState('');
  // State for Date of Birth
  const [dob, setDob] = useState('');
  // State for messages displayed to the user
  const [message, setMessage] = useState('');
  // State for the color of the message
  const [messageColor, setMessageColor] = useState('black');
  // State for loading status
  const [isLoading, setIsLoading] = useState(false); // Initialize to false

  const navigate = useNavigate(); // Hook for navigation

  /**
   * Handles the form submission for student login.
   * Sends register number and DOB to the backend for authentication.
   * @param {Object} event - The form submission event.
   */
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default browser form submission (page reload)

    setMessage(''); // Clear any previous messages
    setIsLoading(true); // Set loading to true when the request starts

    try {
      // Make a POST request to your backend's login endpoint
      // Ensure your backend endpoint is configured to receive 'register_number' and 'dob'
      const response = await fetch('http://localhost:4000/login', { // Verify this endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          register_number: registerNumber, // Send register_number
          dob: dob // Send dob
        }),
      });

      const data = await response.json(); // Parse the JSON response from the server

      if (response.ok) { // Check if the HTTP status code is in the 2xx range
        // If your backend sends a token (e.g., data.token), pass it.
        // Otherwise, you might just pass true or a user ID.
        // Assuming your backend sends a token or a success indicator in `data.token` or similar.
        onLoginSuccess(data.token || true); // Call the success handler from App.js
        setMessage(`✅ ${data.message || 'Login successful!'}`); // Display success message
        setMessageColor("lightgreen");

        // Redirect to the upload page after a short delay
        setTimeout(() => {
          navigate('/upload'); // Redirect using React Router
        }, 1000);

      } else {
        // Handle login failure based on server response
        setMessage(`❌ ${data.error || data.message || 'Login failed. Please check your credentials.'}`);
        setMessageColor("red");
      }
    } catch (error) {
      // Catch network errors (e.g., server unreachable)
      setMessage(`❌ Network error: ${error.message}`);
      setMessageColor("red");
    } finally {
      // This block will always execute, regardless of success or failure
      setIsLoading(false); // Set loading to false when the request completes
    }
  };

  return (
    <div className="login-container" style={{
  
    }}>
      <h2>Student Login</h2>
      <form onSubmit={handleLogin}> {/* Associate handleLogin with form submission */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="reg" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Register Number:</label>
          <input
            type="text"
            id="reg"
            placeholder="Register Number"
            value={registerNumber} // Controlled component: value tied to state
            onChange={(e) => setRegisterNumber(e.target.value)} // Update state on change
            required // HTML5 validation: field is required
            disabled={isLoading} // Disable input while loading
            style={{ width: 'calc(100% - 22px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1em' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="dob" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date of Birth:</label>
          <input
            type="date"
            id="dob"
            value={dob} // Controlled component: value tied to state
            onChange={(e) => setDob(e.target.value)} // Update state on change
            required // HTML5 validation: field is required
            disabled={isLoading} // Disable input while loading
            style={{ }}
          />
        </div>
        <button
          type="submit"
          className="button"
          style={{ backgroundColor: '#007bff' }}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? 'Logging in...' : 'Login'} {/* Change button text based on loading state */}
        </button>
      </form>
      {/* Display login messages */}
      {message && (
        <p style={{  }}>
          {message}
        </p>
      )}
      {/* Display loading message */}
      {isLoading && (
        <p style={{  }}>
          Please wait...
        </p>
      )}
    </div>
  );
}

export default Login;