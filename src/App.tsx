import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Todos from "./pages/Todos.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { ThemeToggle } from "./components/theme-toggle.tsx";

export default function App() {
  const [session, setSession] = useState<{
    userId: string;
    username: string;
  } | null>(() => {
    const user = localStorage.getItem("todo_user");
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });

  const handleSetSession = (
    user: { userId: string; username: string } | null,
  ) => {
    if (user) {
      localStorage.setItem("todo_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("todo_user");
    }
    setSession(user);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="todo-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />

          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <Routes>
            <Route
              path="/"
              element={
                session ? <Navigate to="/todos" /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={
                !session ? (
                  <Login setSession={handleSetSession} />
                ) : (
                  <Navigate to="/todos" />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !session ? (
                  <Signup setSession={handleSetSession} />
                ) : (
                  <Navigate to="/todos" />
                )
              }
            />
            <Route
              path="/todos"
              element={
                session ? (
                  <Todos session={session} setSession={handleSetSession} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
