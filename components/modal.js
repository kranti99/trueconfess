// Modal.js
import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 relative w-full max-w-md">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;
