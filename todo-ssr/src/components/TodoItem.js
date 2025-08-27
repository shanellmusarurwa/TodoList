// components/TodoItem.js - Fixed link
import { useState } from "react";
import {
  FaCheck,
  FaTrash,
  FaEdit,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
} from "react-icons/fa";
import Link from "next/link";

export default function TodoItem({ todo, onUpdate, onDelete, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setError(null);
    setIsUpdating(true);

    try {
      // This should now return the updated todo
      const updatedTodo = await onUpdate(todo.id, { title: editTitle });

      // If we get here, the update was successful
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update todo");
      console.error("Failed to update todo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = async () => {
    setError(null);
    setIsUpdating(true);

    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (error) {
      setError("Failed to update todo");
      console.error("Failed to toggle todo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      await onDelete(todo.id);
    } catch (error) {
      setError("Failed to delete todo");
      console.error("Failed to delete todo:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div
      className={`flex flex-col p-4 border-b border-gray-200 ${
        loading ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {isUpdating && !isEditing ? (
            <FaSpinner className="animate-spin text-blue-500" />
          ) : (
            <button
              onClick={handleToggle}
              disabled={isUpdating || isDeleting}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                todo.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300"
              }`}
              aria-label={
                todo.completed ? "Mark as incomplete" : "Mark as complete"
              }
            >
              {todo.completed && <FaCheck size={12} />}
            </button>
          )}

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
          ) : (
            <span
              className={`flex-1 text-lg ${
                todo.completed ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {todo.title}
            </span>
          )}
        </div>

        <div className="flex space-x-3">
          {/* View Button */}
          <Link
            href={`/todo/${todo.id}`}
            className="p-2 text-blue-500 hover:text-blue-700"
          >
            <FaEye size={18} />
          </Link>

          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-2 text-green-500 hover:text-green-700 disabled:opacity-50"
                aria-label="Save changes"
              >
                {isUpdating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheck size={18} />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="Cancel editing"
              >
                <FaTimes size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isUpdating || isDeleting}
                className="p-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                aria-label="Edit todo"
              >
                <FaEdit size={18} />
              </button>
              <button
                onClick={confirmDelete}
                disabled={isUpdating || isDeleting}
                className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                aria-label="Delete todo"
              >
                {isDeleting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash size={18} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <FaExclamationTriangle className="mr-1" />
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &ldquo;{todo.title}&rdquo;? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaTrash className="mr-2" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
