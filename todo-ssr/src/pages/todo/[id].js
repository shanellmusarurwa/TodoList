import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheck,
  FaSpinner,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ViewTodo() {
  const router = useRouter();
  const { id } = router.query;
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTodo();
    }
  }, [id]);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/todos/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Todo not found");
        }
        throw new Error("Failed to fetch todo");
      }

      const todoData = await response.json();
      setTodo(todoData);
    } catch (error) {
      setError(error.message);
      console.error("Failed to fetch todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !todo.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();
      setTodo(updatedTodo);
    } catch (error) {
      setError(error.message);
      console.error("Failed to update todo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      router.push("/");
    } catch (error) {
      setError(error.message);
      console.error("Failed to delete todo:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || "Todo not found"}</p>
            <Link
              href="/"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Back to Todos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Head>
        <title>{todo.title} - Todo App</title>
        <meta name="description" content="View todo details" />
      </Head>

      <div className="max-w-2xl mx-auto px-4">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Back to Todos
          </Link>
        </div>

        {/* Todo Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div
            className={`px-8 py-4 ${
              todo.completed ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  todo.completed
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {todo.completed ? "Completed" : "Active"}
              </span>
              <span className="text-gray-500 text-sm">ID: {todo.id}</span>
            </div>
          </div>

          {/* Todo Content */}
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {todo.title}
            </h1>

            <div className="flex items-center mb-8">
              <button
                onClick={handleToggle}
                disabled={isUpdating}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-4 ${
                  todo.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {isUpdating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  todo.completed && <FaCheck />
                )}
              </button>
              <span className="text-lg">
                Mark as {todo.completed ? "Incomplete" : "Complete"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleToggle}
                disabled={isUpdating}
                className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
              >
                {isUpdating ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                {todo.completed ? "Mark Incomplete" : "Mark Complete"}
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
              >
                <FaTrash className="mr-2" />
                Delete Todo
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700 flex items-center">
            <FaExclamationTriangle className="mr-2" />
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
                Are you sure you want to delete this todo? This action cannot be
                undone.
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
    </div>
  );
}
