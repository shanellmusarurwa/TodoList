// pages/index.js
import { useState, useEffect } from "react";
import Head from "next/head";
import TodoItem from "../components/TodoItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaPlus, FaClipboardList, FaSync, FaSpinner } from "react-icons/fa";
import {
  getTodosFromLocalStorage,
  saveTodosToLocalStorage,
} from "../lib/storage";

export default function Home({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos || []);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialTodos);

  // Sync between server and client
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load from localStorage on client side
      const localTodos = getTodosFromLocalStorage();
      if (localTodos.length > 0) {
        setTodos(localTodos);
      }

      // Also save initial todos to localStorage
      if (initialTodos && initialTodos.length > 0) {
        saveTodosToLocalStorage(initialTodos);
      }
    }
  }, [initialTodos]);

  // Save to localStorage whenever todos change
  useEffect(() => {
    saveTodosToLocalStorage(todos);
  }, [todos]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      setTodos(data);
      saveTodosToLocalStorage(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const syncWithServer = async () => {
    setSyncing(true);
    try {
      await fetchTodos();
    } finally {
      setSyncing(false);
    }
  };

  const addTodo = async (title) => {
    setAdding(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      const newTodo = await response.json();
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setNewTodoTitle("");
    } catch (error) {
      console.error("Failed to add todo:", error);
      alert("Failed to add todo. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? updatedTodo : todo
      );
      setTodos(updatedTodos);
      return updatedTodo;
    } catch (error) {
      console.error("Failed to update todo:", error);
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete todo:", error);
      throw error;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodo(newTodoTitle);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Head>
        <title>Todo List App</title>
        <meta
          name="description"
          content="Full-stack todo list app with Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaClipboardList className="text-3xl" />
              <h1 className="text-3xl font-bold">Todo List</h1>
            </div>
            <button
              onClick={syncWithServer}
              disabled={syncing}
              className="p-2 text-white hover:bg-blue-700 rounded-full disabled:opacity-50"
              title="Sync with server"
            >
              {syncing ? <FaSpinner className="animate-spin" /> : <FaSync />}
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Manage your tasks efficiently and boost your productivity
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50"
        >
          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={adding || !newTodoTitle.trim()}
              className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md transition whitespace-nowrap min-w-[80px]"
            >
              {adding ? (
                <FaPlus className="animate-spin" />
              ) : (
                <>
                  <FaPlus className="sm:block hidden" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="max-h-96 overflow-y-auto">
          {initialLoading ? (
            <LoadingSpinner />
          ) : todos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaClipboardList className="text-4xl mx-auto mb-4 text-gray-300" />
              <p className="text-xl">No tasks yet.</p>
              <p className="mt-1">Add a new task to get started!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            ))
          )}
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 text-gray-600 flex justify-between items-center border-t border-gray-200 text-sm sm:text-base">
          <span className="font-medium">
            {todos.length} {todos.length === 1 ? "task" : "tasks"}
          </span>
          <span>{todos.filter((t) => t.completed).length} completed</span>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Get the absolute URL for the API request
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Fetch todos from the API route on the server
    const response = await fetch(`${baseUrl}/api/todos`);

    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }

    const initialTodos = await response.json();

    return {
      props: {
        initialTodos,
      },
    };
  } catch (error) {
    console.error("Failed to fetch initial todos:", error);
    return {
      props: {
        initialTodos: [],
      },
    };
  }
}
