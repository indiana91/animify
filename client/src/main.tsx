import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mount the application to the DOM
const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<App />);
