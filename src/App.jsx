import { useState } from "react";
import "./App.css";
import { db } from "./instantdb/instantdb";
import { id } from "@instantdb/react";

const ToDoApp = () => {
  // State to hold new task input for each category
  const [newTaskByCategory, setNewTaskByCategory] = useState({});
  // State to hold new category name input
  const [newCategoryName, setNewCategoryName] = useState("");

  // Query InstantDB for categories and tasks
  const query = { categories: {}, tasks: {} };
  const { isLoading, error, data } = db.useQuery(query);

  // If loading or error, display the respective states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Handle toggling category expansion (expand/collapse)
  const toggleCategory = (categoryId, expanded) => {
    db.transact(
      db.tx.categories[categoryId].update({
        expanded: !expanded,
      })
    );
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId, status) => {
    db.transact(
      db.tx.tasks[taskId].update({
        completed: !status,
      })
    );
  };

  // Add new task to a category
  const addNewTask = (categoryId) => {
    const newTaskText = newTaskByCategory[categoryId];
    if (!newTaskText.trim()) return;

    const newTaskObject = {
      categories: categoryId,
      text: newTaskText,
      completed: false,
    };
    db.transact(db.tx.tasks[id()].update(newTaskObject));
    setNewTaskByCategory({ ...newTaskByCategory, [categoryId]: "" });
  };

  // Handle changes to task input for each category
  const handleTaskInputChange = (categoryId, value) => {
    setNewTaskByCategory((prevState) => ({
      ...prevState,
      [categoryId]: value,
    }));
  };

  // Add new category
  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategoryObject = {
      id: id(),
      name: newCategoryName,
      expanded: false,
    };
    db.transact(db.tx.categories[id()].update(newCategoryObject));
    setNewCategoryName("");
  };

  return (
    <div className="todo-app">
      <div className="add-category">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Add a new category"
        />
        <button onClick={addNewCategory}>Add Category</button>
      </div>

      {data?.categories?.map((category) => (
        <div key={category.id} className="category">
          <div
            className="category-header"
            onClick={() => toggleCategory(category.id, category.expanded)}
          >
            <span className="folder-icon">📁</span>
            <span className="category-name">{category.name}</span>
            <span className="dropdown-icon">
              {category.expanded ? (
                <i className="fa-solid fa-angle-down"></i>
              ) : (
                <i className="fa-solid fa-angle-up"></i>
              )}
            </span>
          </div>
          {category.expanded && (
            <>
              <ul className="task-list">
                {data.tasks
                  .filter((task) => task.categories === category.id)
                  .map((task) => (
                    <li
                      key={task.id}
                      className={`task ${task.completed ? "completed" : ""}`}

                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() =>
                            toggleTaskCompletion(task.id, task.completed)
                          }
                        />
                        {task.text}
                      </label>
                    </li>
                  ))}
              </ul>
              <div className="add-task">
                <input
                  type="text"
                  value={newTaskByCategory[category.id] || ""}
                  onChange={(e) =>
                    handleTaskInputChange(category.id, e.target.value)
                  }
                  placeholder="Add a new task"
                />
                <button onClick={() => addNewTask(category.id)}>Add</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ToDoApp;