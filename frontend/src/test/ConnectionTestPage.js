import React, { useState } from 'react';
import axios from 'axios';

export default function ConnectionTestPage() {
  const [deceasedName, setDeceasedName] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [relationship, setRelationship] = useState('');
  const [chatData, setChatData] = useState(null); // File state
  const [loading, setLoading] = useState(false);

  // file 핸들러
  const handleFileChange = (e) => {
    setChatData(e.target.files[0]);
  };

  // send 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Form data
    const formData = new FormData();
    formData.append(
      'deceasedData',
      new Blob(
        [
          JSON.stringify({
            name: deceasedName,
            userNickname,
            relationship,
          }),
        ],
        { type: 'application/json' }
      )
    );
    formData.append('chatData', chatData); // file

    try {
      const response = await axios.post(
        'http://localhost:8080/be/service/start',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Response from Spring Boot API:', response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  // Inline styles for the button
  const buttonStyle = {
    backgroundColor: loading ? '#ff9800' : '#4CAF50', // Change color when loading
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'progress' : 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease', // Smooth transition
    width: '100%',
    maxWidth: '200px',
    textAlign: 'center',
    marginTop: '20px',
  };

  // Hover effect for button
  const hoverStyle = {
    backgroundColor: loading ? '#ff9800' : '#45a049', // Darker green when hover
    transform: 'scale(1.05)', // Slightly enlarge when hovered
  };

  return (
    <div>
      <h2>Subscribe to SMS Service</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="deceasedName">Deceased Name</label>
          <input
            type="text"
            id="deceasedName"
            value={deceasedName}
            onChange={(e) => setDeceasedName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="userNickname">User Nickname</label>
          <input
            type="text"
            id="userNickname"
            value={userNickname}
            onChange={(e) => setUserNickname(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="relationship">Relationship</label>
          <input
            type="text"
            id="relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="chatData">Chat Data (File)</label>
          <input type="file" id="chatData" onChange={handleFileChange} />
        </div>

        <div>
          <button
            type="submit"
            style={buttonStyle}
            disabled={loading} // Disable the button while loading
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
