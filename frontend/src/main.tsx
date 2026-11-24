import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Wizard from "./pages/Wizard";
import Editor from "./pages/Editor";
import TemplatesPage from "./pages/TemplatesPage";
import BuildYourOwn from "./pages/BuildYourOwn";
import AuthPage from "./pages/AuthPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthGate, RequireAuth } from "./components/AuthGate";

const router = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
      { path: "/login", element: <AuthPage mode="login" /> },
      { path: "/register", element: <AuthPage mode="register" /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/templates", element: <TemplatesPage /> },
          { path: "/new", element: <Wizard /> },
          { path: "/build", element: <BuildYourOwn /> },
          { path: "/editor/:projectId", element: <Editor /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
