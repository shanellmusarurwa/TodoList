// pages/api/todos/index.js - Updated to only handle bulk operations
import { getTodos, addTodo } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        const todos = await getTodos();
        res.status(200).json(todos);
        break;

      case "POST":
        const { title } = req.body;
        if (!title || title.trim() === "") {
          return res.status(400).json({ error: "Title is required" });
        }
        const newTodo = await addTodo(title.trim());
        res.status(201).json(newTodo);
        break;

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
