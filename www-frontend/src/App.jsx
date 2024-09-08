import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import Events from './components/Events';
import UserSearch from './components/UserSearch';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!isAuthenticated && !token) {
      if (!['/login', '/signup', '/register'].includes(location.pathname)) {
        navigate('/');
      }
    } else if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/map');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/map" element={isAuthenticated ? <Map /> : <Navigate to="/login" />} />
      <Route path="/beers" element={isAuthenticated ? <BeerList /> : <Navigate to="/login" />} />
      <Route path="/bars" element={isAuthenticated ? <BarList /> : <Navigate to="/login" />} />
      <Route path="/bars/:id/events" element={isAuthenticated ? <Events /> : <Navigate to="/login" />} />
      <Route path="/search" element={isAuthenticated ? <UserSearch /> : <Navigate to="/login" />} />
      <Route path="/logout" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;