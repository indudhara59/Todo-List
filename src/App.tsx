import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Todos from "./pages/Todos";

export default function App() {
  const [session, setSession] = useState<{ userId: string; username: string } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("todo_user");
    if (user) {
      setSession(JSON.parse(user));
    }
  }, []);

  const handleSetSession = (user: { userId: string; username: string } | null) => {
    if (user) {
      localStorage.setItem("todo_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("todo_user");
    }
    setSession(user);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
        
        <Routes>
          <Route 
            path="/" 
            element={session ? <Navigate to="/todos" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={!session ? <Login setSession={handleSetSession} /> : <Navigate to="/todos" />} 
          />
          <Route 
            path="/signup" 
            element={!session ? <Signup setSession={handleSetSession} /> : <Navigate to="/todos" />} 
          />
          <Route 
            path="/todos" 
            element={session ? <Todos session={session} setSession={handleSetSession} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
