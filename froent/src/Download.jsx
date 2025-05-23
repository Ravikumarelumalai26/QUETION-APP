import React, { useState, useEffect } from 'react';
import './Download.css';

function Download() {
  const [files, setFiles] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch files from the backend
  const fetchFiles = async () => {
    setLoading(true); // Start loading state
    setError('');     // Clear previous errors
    try {
      const response = await fetch('http://localhost:4000/get-files');
      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        setFiles(data.data || []); // Set files, default to empty array if data.data is null/undefined
      } else {
        // Handle API-specific errors from the backend
        setError(`Failed to fetch files: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      // Handle network errors or other exceptions
      setError(`Failed to fetch files: ${err.message}`);
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  // useEffect to fetch files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handles changes in the filter input field
  const handleFilterChange = (event) => {
    setFilterSubject(event.target.value);
  };

  // Defines the logout behavior
  const handleLogout = () => {
    // --- IMPORTANT: Add your actual logout logic here ---
    // e.g., localStorage.removeItem('userToken');
    console.log('User logged out!');
    // Redirect to login page (this causes a full page reload)
    window.location.href = '/login'; // Adjust '/login' to your actual login route
  };


  // Filters the files based on the filterSubject state
  const filteredFiles = files.filter(fileInfo => {
    const lowerCaseFilter = filterSubject.toLowerCase();
    const title = fileInfo.title ? fileInfo.title.toLowerCase() : '';
    const subject = fileInfo.subject ? fileInfo.subject.toLowerCase() : '';
    // Check if filter matches title or subject
    return title.includes(lowerCaseFilter) || subject.includes(lowerCaseFilter);
  });

  return (
    // Use a React Fragment <> to wrap multiple top-level elements
    // This allows you to return both the navs div and the download-page div
    <>
      {/* --- Navigation Bar --- */}
      <div className='navs'>
        {/* These buttons trigger navigation by changing the browser's URL (causes full page reload) */}
        <button className="button" onClick={() => window.location.href = '/upload'}>
          Upload Page
        </button>
        <button className="button" onClick={() => window.location.href = '/download'}>
          Download Page
        </button>
       
      </div>
      {/* --- End Navigation Bar --- */}

      {/* --- Main Download Page Content --- */}
      {/* This div now comes AFTER the navigation bar */}
      <div id="download-page">

        <div className="filter-header">
          <label htmlFor="filter-subject">Filter by Course: </label>
          <input
            type="text"
            id="filter-subject"
            value={filterSubject}
            onChange={handleFilterChange}
            placeholder="e.g., DBMS, OOPS, DSA"
          />
        </div>

        <div id="file-list">
          {/* Conditional rendering for loading, error, and no files states */}
          {loading && <p className="message loading">Loading files...</p>}
          {error && <p className="message error">{error}</p>}
          {!loading && !error && filteredFiles.length === 0 && (
            <p className="message info">No files uploaded yet or no files match your filter.</p>
          )}

          <div className="file-items-grid">
            {/* Map through filtered files and render each file item */}
            {filteredFiles.map((fileInfo) => (
              <div key={fileInfo.pdf} className="file-item">
                <p>Course: {fileInfo.title}</p>
                {/* Only render subject if it exists */}
                {fileInfo.subject && <p>Subject: {fileInfo.subject}</p>}
                <a
                  href={`http://localhost:4000/files/${fileInfo.pdf}`} // Link to the actual file for download
                  target="_blank" // Opens in a new tab
                  rel="noopener noreferrer" // Security best practice for target="_blank"
                  className="button"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* --- End Main Download Page Content --- */}
    </>
  );
}

export default Download;