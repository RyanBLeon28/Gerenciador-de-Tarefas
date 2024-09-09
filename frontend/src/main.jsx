import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "../src/pages/Home.jsx";
import "./index.css";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import TasksProvider from "./context/index.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TasksProvider>
      <DndProvider backend={HTML5Backend}>
        <Home />
      </DndProvider>
    </TasksProvider>
  </StrictMode>,
)
