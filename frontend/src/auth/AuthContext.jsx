import React, { createContext, useContext, useEffect, useState } from 'react';
import { analyzeImage, analyzeText, createAnalysis, getAnalyses } from '../services/analysisService';
import { loginRequest, signupRequest } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('truthlens_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    getAnalyses()
      .then(({ analyses }) => setHistory(analyses))
      .catch(() => setHistory([]));
  }, [user]);

  const login = async (email, password) => {
    if (!email || !password) throw new Error("Please fill in all fields");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    
    const { user: userData, token } = await loginRequest(email, password);
    setUser(userData);
    localStorage.setItem('truthlens_user', JSON.stringify(userData));
    localStorage.setItem('truthlens_token', token);
    return userData;
  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) throw new Error("Please complete all registration fields");
    const { user: userData, token } = await signupRequest(name, email, password);
    setUser(userData);
    localStorage.setItem('truthlens_user', JSON.stringify(userData));
    localStorage.setItem('truthlens_token', token);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truthlens_user');
    localStorage.removeItem('truthlens_token');
  };

  const addHistoryItem = async (item) => {
    const { analysis } = await createAnalysis(
      item.type.toLowerCase(),
      item.content
    );

    setHistory(prev => [analysis, ...prev]);
    setLastAnalysis(item);
  };

  const submitImageAnalysis = async (file) => {
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read the selected image'));
      reader.readAsDataURL(file);
    });
    const { analysis, result } = await analyzeImage(file.name, image);
    setHistory(prev => [analysis, ...prev]);
    const completedAnalysis = { ...result, analysisId: analysis._id, type: 'image', imagePreview: image, imageName: file.name };
    setLastAnalysis(completedAnalysis);
    return completedAnalysis;
  };

  const submitTextAnalysis = async (content, sourceUrl = '') => {
    const { analysis, result } = await analyzeText(content, sourceUrl);
    setHistory(prev => [analysis, ...prev]);
    const completedAnalysis = { ...result, analysisId: analysis._id, assessment: result.verdict, content, type: 'text' };
    setLastAnalysis(completedAnalysis);
    return completedAnalysis;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, history, addHistoryItem, submitImageAnalysis, submitTextAnalysis, lastAnalysis }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
