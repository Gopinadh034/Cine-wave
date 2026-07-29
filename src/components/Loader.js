import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-ring">
        <div className="loader-ring-inner"></div>
      </div>
      <p className="loader-text grad-text">Loading cine magic...</p>
    </div>
  );
}
