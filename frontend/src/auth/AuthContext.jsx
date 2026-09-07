import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const INITIAL_HISTORY = [
  { id: "TL-9021", type: "Text", content: "DeepSea-1 model released claiming 99.8% accurate protein folding...", date: "2026-08-23 14:22", confidence: 94, result: "Supported", badge: "badge-supported" },
  { id: "TL-8842", type: "Image", content: "press_conference_synthetic_artifacts.png", date: "2026-08-21 09:15", confidence: 87, result: "High Risk", badge: "badge-highrisk" },
  { id: "TL-8701", type: "Video", content: "ceo_statement_manipulated_audio_sync.mp4", date: "2026-08-18 18:40", confidence: 62, result: "Uncertain", badge: "badge-uncertain" }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('truthlens_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const login = async (email, password) => {
    if (!email || !password) throw new Error("Please fill in all fields");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    
    const userData = { email, name: email.split('@')[0], role: "Verification Analyst" };
    setUser(userData);
    localStorage.setItem('truthlens_user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) throw new Error("Please complete all registration fields");
    const userData = { email, name, role: "Verification Analyst" };
    setUser(userData);
    localStorage.setItem('truthlens_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truthlens_user');
  };

  const addHistoryItem = (item) => {
    setHistory(prev => [item, ...prev]);
    setLastAnalysis(item);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, history, addHistoryItem, lastAnalysis }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);