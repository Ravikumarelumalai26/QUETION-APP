// Upload.js
import React, { useState } from 'react';
import './Upload.css';

function Upload() {
  // State to store the value of the "Subject name" input field
  const [title, setTitle] = useState('');
  // State to store the selected file object
  const [file, setFile] = useState(null);
  // State to store the message displayed to the user regarding the upload status
  const [uploadStatus, setUploadStatus] = useState('');

  /**
   * Handles the change event for the file input.
   * Stores the selected file in the `file` state.
   * @param {Object} event - The DOM event object.
   */
  const handleFileChange = (event) => {
    // `event.target.files` is a FileList object, we take the first selected file
    setFile(event.target.files[0]);
  };

  /**
   * Handles the change event for the title (subject name) input.
   * Stores the input value in the `title` state.
   * @param {Object} event - The DOM event object.
   */
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  /**
   * Handles the logout action.
   * This function will typically clear any authentication tokens and
   * redirect the user to a login page or home page.
   */
  const handleLogout = () => {
    // Implement your actual logout logic here.
    // For example, if you store a user token in localStorage:
    // localStorage.removeItem('authToken');
    console.log('User logged out!');
    // Redirect to the login page (or home page) after logout
    window.location.href = '/login'; // Assuming you have a /login route
  };


  /**
   * Handles the click event for the "Upload" button.
   * Prevents default form submission, validates input, and sends data to backend.
   * @param {Object} event - The DOM event object.
   */
  const uploadFile = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Basic validation: Check if a file has been selected
    if (!file) {
      setUploadStatus('Please select a file to upload.');
      return; // Exit the function if no file is selected
    }

    // Create a FormData object to send file and text data
    // FormData is essential for sending files via Fetch API
    const formData = new FormData();
    formData.append('title', title); // Append the subject name/title
    formData.append('file', file);   // Append the actual file

    setUploadStatus('Uploading...'); // Give immediate feedback to the user

    try {
      // Make a POST request to your backend's upload endpoint
      const response = await fetch('http://localhost:4000/upload-files', {
        method: 'POST',
        body: formData, // The FormData object is directly passed as the body
      });

      // Parse the JSON response from the server
      const data = await response.json();

      // Check if the HTTP response is OK (status 2xx) AND backend status is 'ok'
      if (response.ok && data.status === 'ok') {
        // --- Display Success Pop-up ---
        const popupContainer = document.createElement('div');
        popupContainer.style.position = 'fixed';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        popupContainer.style.height = '100%';
        popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black background
        popupContainer.style.display = 'flex';
        popupContainer.style.justifyContent = 'center';
        popupContainer.style.alignItems = 'center';
        popupContainer.style.zIndex = '1000'; // Ensure it's on top of other content
        popupContainer.style.color = 'white';
        popupContainer.style.fontSize = '2em';
        popupContainer.style.fontWeight = 'bold';
        popupContainer.textContent = 'Thank you for your contribution! 📚🎉';

        document.body.appendChild(popupContainer); // Add the pop-up to the DOM

        // Clear the input fields after successful upload
        setTitle('');
        setFile(null);
        // Clear the file input visually (important for re-uploading the same file)
        document.getElementById('file-input').value = '';
        setUploadStatus(''); // Clear any previous status message below the form

        // Automatically remove the pop-up after 2 seconds
        setTimeout(() => {
          if (document.body.contains(popupContainer)) {
            document.body.removeChild(popupContainer);
          }
        }, 2000); // 2000 milliseconds = 2 seconds

      } else {
        // Handle upload failure based on server response
        setUploadStatus(`Upload failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      // Handle network errors or other exceptions during the fetch operation
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  return (
    <> {/* Use a React Fragment to return multiple top-level elements */}

      {/* --- Navigation Bar --- */}
      <div className='navs'>
        {/* These buttons trigger navigation by changing the browser's URL */}
        <button className="button" onClick={() => window.location.href = '/upload'}>
          Upload Page
        </button>
        <button className="button" onClick={() => window.location.href = '/download'}>
          Download Page
        </button>
        
      </div>
      {/* --- End Navigation Bar --- */}

      {/* --- Main Upload Form Content --- */}
      {/* The `display: 'block'` style was removed here because its visibility
          is now managed by the parent `App.js` component using React Router. */}
      <div id="upload-form">
        <h2>Upload Question </h2>
        {/* Subject Name Input */}
        <label htmlFor="title">Course  Name: </label>
             
        <input
          type="text"
          id="title"
          placeholder="eg DSA, DBMS, OOPS"
          value={title} // Controlled component: value is tied to state
          onChange={handleTitleChange} // Update state on change
        />
        {/* File Input */}
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange} // Update state on file selection
        />
        {/* Upload Button */}
        <button type="button" onClick={uploadFile}>
          Upload
        </button>
        {/* Upload Status Message */}
        <div id="upload-status" style={{ color: uploadStatus.startsWith('Upload failed') ? 'red' : 'green' }}>
          {uploadStatus}
        </div>
      </div>
      {/* --- End Upload Form Content --- */}
    </>
  );
}

export default Upload; // Export the component for use in other files (e.g., App.js)