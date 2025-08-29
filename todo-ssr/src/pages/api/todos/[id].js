// pages/api/todos/[id].js
import { getTodosFromCookies, setTodosCookie } from "../../../lib/storage";

export default function handler(req, res) {
  const { id } = req.query;
  const todoId = parseInt(id);

  if (isNaN(todoId)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const todos = getTodosFromCookies(req);
  const todoIndex = todos.findIndex((t) => t.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  if (req.method === "GET") {
    return res.status(200).json(todos[todoIndex]);
  }

  if (req.method === "PUT") {
    const updates = req.body;

    // Validate title if provided
    if (
      updates.title &&
      (updates.title.trim() === "" || updates.title.length > 255)
    ) {
      return res.status(400).json({ error: "Valid title is required" });
    }

    const updatedTodo = { ...todos[todoIndex], ...updates };
    if (updates.title) {
      updatedTodo.title = updates.title.trim();
    }

    const updatedTodos = [...todos];
    updatedTodos[todoIndex] = updatedTodo;
    setTodosCookie(updatedTodos, res);

    return res.status(200).json(updatedTodo);
  }

  if (req.method === "DELETE") {
    const updatedTodos = todos.filter((t) => t.id !== todoId);
    setTodosCookie(updatedTodos, res);

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
