let todos = [
  { id: 1, title: "Learn Next.js", completed: false },
  { id: 2, title: "Build a todo app", completed: true },
  { id: 3, title: "Deploy to production", completed: false },
];

let nextId = 4;

export async function getTodos() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return todos;
}

export async function addTodo(title) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTodo = { id: nextId++, title, completed: false };
  todos.push(newTodo);
  return newTodo;
}

export async function updateTodo(id, updates) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    throw new Error("Todo not found");
  }
  todos[index] = { ...todos[index], ...updates };
  return todos[index];
}

export async function deleteTodo(id) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    throw new Error("Todo not found");
  }
  todos.splice(index, 1);
  return { success: true };
}
