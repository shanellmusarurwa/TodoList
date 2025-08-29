// lib/storage.js
import { serialize, parse } from "cookie";

// Default todos
const defaultTodos = [
  { id: 1, title: "Learn Next.js", completed: false },
  { id: 2, title: "Build a todo app", completed: true },
  { id: 3, title: "Deploy to production", completed: false },
];

// Get next ID
function getNextId(todos) {
  return todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
}

// Get todos from cookies (for SSR)
export function getTodosFromCookies(req = null) {
  if (!req || !req.headers || !req.headers.cookie) {
    return defaultTodos;
  }

  const cookies = parse(req.headers.cookie);
  try {
    return cookies.todos ? JSON.parse(cookies.todos) : defaultTodos;
  } catch {
    return defaultTodos;
  }
}

// Save todos to cookies (for SSR)
export function setTodosCookie(todos, res = null) {
  if (res && res.setHeader) {
    res.setHeader(
      "Set-Cookie",
      serialize("todos", JSON.stringify(todos), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
      })
    );
  }
}

// Get todos from localStorage (for client-side)
export function getTodosFromLocalStorage() {
  if (typeof window === "undefined") {
    return defaultTodos;
  }

  try {
    const stored = localStorage.getItem("todos");
    return stored ? JSON.parse(stored) : defaultTodos;
  } catch {
    return defaultTodos;
  }
}

// Save todos to localStorage (for client-side)
export function saveTodosToLocalStorage(todos) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }
}

// Combined function to get todos (prioritizes cookies for SSR)
export function getTodos(req = null) {
  if (req) {
    return getTodosFromCookies(req);
  }
  return getTodosFromLocalStorage();
}

// Combined function to save todos
export function saveTodos(todos, res = null) {
  setTodosCookie(todos, res);
  saveTodosToLocalStorage(todos);
}
