import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/theme';
import Layout from './components/Layout';
import HomePage from './Page/Home';
import ConfessionsPage from './Page/AllConfessions';
import TeacherComplaints from './components/TeacherComplaint';
import ErrorPage from './components/error-page';
import { Toaster } from "@/components/ui/toaster"
import { isInstagramBrowser, isIOS } from '@/utils/browser-check';
import InstallPrompt from '@/components/install-prompt';
import InstagramWarning from './components/InstagramWarning';

function App() {
  if (isInstagramBrowser()) {
    return <InstagramWarning />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/confessions" element={<ConfessionsPage />} />
            <Route path="/complaints" element={<TeacherComplaints />} />
            <Route path='*' element={<ErrorPage />} />
          </Routes>
        </Layout>
        <Toaster />
        <InstallPrompt />
      </Router>
    </ThemeProvider>
  );
}

export default App;

