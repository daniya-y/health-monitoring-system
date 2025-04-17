import React, { useState, createContext, useContext } from "react";

// Define the admin users (replace with your actual admin credentials)
const ADMINS = [
  {
    username: import.meta.env.VITE_ADMIN1_ID,
    password: import.meta.env.VITE_ADMIN1_PWD,
  },
  {
    username: import.meta.env.VITE_ADMIN2_ID,
    password: import.meta.env.VITE_ADMIN2_PWD,
  },
];

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

// Create an Auth Context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("authToken") !== null;
  });

  const login = (username: string, password: string) => {
    const isAdmin = ADMINS.some(
      (admin) => admin.username === username && admin.password === password
    );

    if (isAdmin) {
      setIsAuthenticated(true);
      localStorage.setItem("authToken", "adminToken"); // Simple token
    } else {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);
