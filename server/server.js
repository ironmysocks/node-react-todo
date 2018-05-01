const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

const ToDoList = [];

app.get("/api/todo/:id", (req, res) => {
  const result = ToDoList[req.params.id]
    ? { todos: ToDoList[req.params.id] }
    : { error: "The item doesn't exist." }
  res.send(result);
});

app.get("/api/todos", (req, res) => {
  res.send({ todos: ToDoList });
});

app.post("/api/todo", (req, res) => {
  ToDoList.push({
    description: req.body.description,
    priority: req.body.priority
  });
  res.send({ todos: ToDoList });
});

app.delete("/api/todo/:id", (req, res) => {
  let result;
  if (ToDoList[req.params.id]) {
    ToDoList.splice(req.params.id, 1);
    res.send({ todos: ToDoList });
  } else {
    res.send({ error: "The item doesn't exist." });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
