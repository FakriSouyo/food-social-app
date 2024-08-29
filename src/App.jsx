// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import NewPost from './pages/NewPost';
import Bookmarks from './pages/Bookmarks';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/new-post" element={<NewPost />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;