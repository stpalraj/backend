import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
