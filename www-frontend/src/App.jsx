import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, Container,
  ListItemIcon, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Home from './components/Home';
import BarList from './components/BarList';
import BeerList from './components/BeerList';
import Events from './components/Events';
import UserSearch from './components/UserSearch';
import './App.css';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <Router>
      <AppBar position="fixed" style={{ width: '100%', height: '64px', backgroundColor: '#FFEB3B' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon style={{ color: 'black' }} />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1, color: 'black' }}>
            Pintpals
          </Typography>
          <IconButton edge="end" color="inherit" aria-label="profile">
            <AccountCircleIcon style={{ color: 'black' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          style: {
            backgroundColor: '#FFEB3B',
            color: 'black'
          }
        }}
      >
        <List>
          <ListItem button component={Link} to="/" onClick={toggleDrawer(false)} style={{color: 'black'}}>
            <ListItemIcon><HomeIcon style={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/beers" onClick={toggleDrawer(false)} style={{color: 'black'}}>
            <ListItemIcon><LocalBarIcon style={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Beers" />
          </ListItem>
          <ListItem button component={Link} to="/bars" onClick={toggleDrawer(false)} style={{color: 'black'}}>
            <ListItemIcon><LocalBarIcon style={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Bars" />
          </ListItem>
          <ListItem button component={Link} to="/bars/1/events" onClick={toggleDrawer(false)} style={{color: 'black'}}>
            <ListItemIcon><EventIcon style={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>
          <ListItem button component={Link} to="/search" onClick={toggleDrawer(false)} style={{color: 'black'}}>
            <ListItemIcon><SearchIcon style={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Search Users" />
          </ListItem>
        </List>
      </Drawer>
      
      <Container style={{ marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/beers" element={<BeerList />} />
          <Route path="/bars" element={<BarList />} />
          <Route path="/bars/:id/events" element={<Events />} />
          <Route path="/search" element={<UserSearch />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
