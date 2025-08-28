import { getTodos, updateTodo, deleteTodo } from "../../../lib/db";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    switch (method) {
      case "GET":
        const todos = await getTodos();
        const todo = todos.find((t) => t.id === parseInt(id));

        if (!todo) {
          return res.status(404).json({ error: "Todo not found" });
        }

        res.status(200).json(todo);
        break;

      case "PUT":
        const updates = req.body;

        if (
          updates.title &&
          (updates.title.trim() === "" || updates.title.length > 255)
        ) {
          return res.status(400).json({ error: "Valid title is required" });
        }

        const updatedTodo = await updateTodo(parseInt(id), updates);
        res.status(200).json(updatedTodo);
        break;

      case "DELETE":
        await deleteTodo(parseInt(id));
        res.status(200).json({ success: true });
        break;

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("API Error:", error);

    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
