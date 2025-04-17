
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // For demo purposes, auto-login as the mock user
      setCurrentUser(mockCurrentUser);
      localStorage.setItem("currentUser", JSON.stringify(mockCurrentUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would validate with a backend
    setLoading(true);
    
    try {
      const user = mockUsers.find((u) => u.email === email);
      
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        logout,
        users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
