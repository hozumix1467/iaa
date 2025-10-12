import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ConsultationFormPage from './pages/ConsultationFormPage';
import CaseBrowserPage from './pages/CaseBrowserPage';
import CaseDetailPage from './pages/CaseDetailPage';
import AboutPage from './pages/AboutPage';
import { ConsultationProvider } from './contexts/ConsultationContext';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PostList } from './components/PostList';
import { CreatePost } from './components/CreatePost';

function App() {
  return (
    <AuthProvider>
      <ConsultationProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <PostList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  }
                />
                <Route path="/consultation/new" element={<ConsultationFormPage />} />
                <Route path="/consultation/browse" element={<CaseBrowserPage />} />
                <Route path="/consultation/:id" element={<CaseDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ConsultationProvider>
    </AuthProvider>
  );
}

export default App;