import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Live from "./pages/Live";
import Login from "./pages/Login";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext"; // Import the AuthProvider

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/live" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/live" element={<Live />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
