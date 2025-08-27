import { useState, useEffect } from "react";
import Head from "next/head";
import TodoItem from "../components/TodoItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaPlus, FaClipboardList } from "react-icons/fa";

export default function Home({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos || []);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialTodos);

  // Add useEffect to handle initial loading
  useEffect(() => {
    if (!initialTodos) {
      fetchTodos();
    }
  }, [initialTodos]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
      setInitialLoading(false);
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
      setTodos([...todos, newTodo]);
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
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
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

      setTodos(todos.filter((todo) => todo.id !== id));
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
          <div className="flex items-center space-x-3 mb-2">
            <FaClipboardList className="text-3xl" />
            <h1 className="text-3xl font-bold">Todo List</h1>
          </div>
          <p className="text-blue-100">
            Manage your tasks efficiently and boost your productivity
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 border-b border-gray-200 bg-gray-50"
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={adding || !newTodoTitle.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 shadow-md transition"
            >
              {adding ? <FaPlus className="animate-spin" /> : <FaPlus />}
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Updated loading logic section */}
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

        <div className="p-6 bg-gray-50 text-gray-600 flex justify-between items-center border-t border-gray-200">
          <span className="font-medium">
            {todos.length} {todos.length === 1 ? "task" : "tasks"}
          </span>
          <span>{todos.filter((t) => t.completed).length} completed</span>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch todos from the API route on the server
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/todos`
    );
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
