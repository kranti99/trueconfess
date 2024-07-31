import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";
import Modal from "@components/modal"; // Assuming the Modal component from the previous implementation
import PropTypes from "prop-types";

const EditDropDown = ({ onEdit, onDelete, itemId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    onEdit(itemId);
    setIsOpen(false);
  };

  const handleDelete = () => {
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button onClick={handleToggle} className="text-gray-500 hover:text-gray-700">
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-36 bg-gray-800 text-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-700 w-full text-left"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
          <p>Are you sure you want to delete this comment?</p>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete(itemId);
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

EditDropDown.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EditDropDown;
