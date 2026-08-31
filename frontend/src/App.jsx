
import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

import { ProgressModal } from './components/ProgressModal';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { TextAnalysis } from './pages/TextAnalysis';
import { ImageAnalysis } from './pages/ImageAnalysis';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { Results } from './pages/Results';
import { History } from './pages/History';


/* =========================================
   Main Application
   ========================================= */

export default function App() {
  const [modalActive, setModalActive] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [progress, setProgress] = useState(0);


  /* =========================================
     Analysis Pipeline
     ========================================= */

  const runAnalysisPipeline = (
    type,
    contentSummary,
    onComplete
  ) => {
    setModalActive(true);
    setProgress(0);

    setModalStatus(
      'Ingesting payload & checking structural integrity...'
    );


    setTimeout(() => {
      setProgress(40);

      setModalStatus(
        'Extracting temporal and frequency signal vectors...'
      );
    }, 500);


    setTimeout(() => {
      setProgress(80);

      setModalStatus(
        'Synthesizing cross-evidence confidence scores...'
      );
    }, 1200);


    setTimeout(() => {
      setProgress(100);

      setTimeout(() => {
        setModalActive(false);

        onComplete();
      }, 200);
    }, 1800);
  };


  /* =========================================
     Application Routes
     ========================================= */

  return (
    <AuthProvider>

      <ProgressModal
        active={modalActive}
        status={modalStatus}
        progress={progress}
      />


      <Routes>

        {/* =====================================
            Public Routes
            ===================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =====================================
            Protected Routes
            ===================================== */}

        <Route element={<ProtectedRoute />}>

          {/* ===================================
              Shared Application Layout

              Navbar
              Page Content
              Footer
              =================================== */}

          <Route element={<MainLayout />}>

            {/* Home */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/home"
                  replace
                />
              }
            />

            <Route
              path="/home"
              element={<Home />}
            />


            {/* Text Analysis */}

            <Route
              path="/text"
              element={
                <TextAnalysis
                  runAnalysisPipeline={
                    runAnalysisPipeline
                  }
                />
              }
            />


            {/* Image Analysis */}

            <Route
              path="/image"
              element={
                <ImageAnalysis
                  runAnalysisPipeline={
                    runAnalysisPipeline
                  }
                />
              }
            />


            {/* Video Analysis */}

            <Route
              path="/video"
              element={
                <VideoAnalysis
                  runAnalysisPipeline={
                    runAnalysisPipeline
                  }
                />
              }
            />


            {/* Results */}

            <Route
              path="/results"
              element={<Results />}
            />


            {/* History */}

            <Route
              path="/history"
              element={<History />}
            />

          </Route>

        </Route>

      </Routes>

    </AuthProvider>
  );
}

