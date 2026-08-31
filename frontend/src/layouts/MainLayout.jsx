
import React from 'react';
import { Outlet } from 'react-router-dom';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const MainLayout = () => {
  return (
    <div className="main-layout">

      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />


      <style>{`
        .main-layout {
          width: 100%;
          min-height: 100vh;

          display: flex;
          flex-direction: column;

          box-sizing: border-box;

          margin: 0;
          padding: 0;
        }


        .main-content {
          width: 100%;

          flex: 1 0 auto;

          box-sizing: border-box;

          margin: 0;
          padding: 0;
        }


        .main-content > * {
          width: 100%;

          box-sizing: border-box;

          margin-top: 0;
        }


        @media (max-width: 768px) {
          .main-layout {
            min-height: 100dvh;
          }
        }
      `}</style>

    </div>
  );
};

