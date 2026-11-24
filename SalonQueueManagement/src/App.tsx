import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { JoinQueuePage } from './pages/JoinQueuePage';
import { StatusPage } from './pages/StatusPage';
import { ReceptionPage } from './pages/ReceptionPage';
import { BarberPage } from './pages/BarberPage';
import { DisplayPage } from './pages/DisplayPage';
import { AdminPage } from './pages/AdminPage';

// Layout wrapper that hides standard Navbar and Footer for the dedicated TV Display mode
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isTvDisplay = location.pathname.startsWith('/display');

  if (isTvDisplay) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-dark">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueueProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/join" element={<JoinQueuePage />} />
            <Route path="/status/:id" element={<StatusPage />} />
            <Route path="/reception" element={<ReceptionPage />} />
            <Route path="/barber" element={<Navigate to="/barber/Arjun" replace />} />
            <Route path="/barber/:name" element={<BarberPage />} />
            <Route path="/display" element={<DisplayPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueueProvider>
  );
};

export default App;
