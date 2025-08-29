// pages/api/todos/index.js
import { getTodosFromCookies, setTodosCookie } from "../../../lib/storage";

export default function handler(req, res) {
  if (req.method === "GET") {
    const todos = getTodosFromCookies(req);
    return res.status(200).json(todos);
  }

  if (req.method === "POST") {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const todos = getTodosFromCookies(req);
    const newId = Math.max(0, ...todos.map((t) => t.id)) + 1;
    const newTodo = {
      id: newId,
      title: title.trim(),
      completed: false,
    };

    const updatedTodos = [...todos, newTodo];
    setTodosCookie(updatedTodos, res);

    return res.status(201).json(newTodo);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
