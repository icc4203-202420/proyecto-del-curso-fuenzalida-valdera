import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, Container,
  ListItemIcon, ListItemText, BottomNavigation, BottomNavigationAction, Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import Home from './components/Home';
import BarList from './components/BarList';
import BeerList from './components/BeerList';
import Events from './components/Events';
import UserSearch from './components/UserSearch';
import './App.css';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navigationValue, setNavigationValue] = useState(0);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            My App
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List>
          <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/beers" onClick={toggleDrawer(false)}>
            <ListItemIcon><LocalBarIcon /></ListItemIcon>
            <ListItemText primary="Beers" />
          </ListItem>
          <ListItem button component={Link} to="/bars" onClick={toggleDrawer(false)}>
            <ListItemIcon><LocalBarIcon /></ListItemIcon>
            <ListItemText primary="Bars" />
          </ListItem>
          <ListItem button component={Link} to="/bars/1/events" onClick={toggleDrawer(false)}>
            <ListItemIcon><EventIcon /></ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>
          <ListItem button component={Link} to="/search" onClick={toggleDrawer(false)}>
            <ListItemIcon><SearchIcon /></ListItemIcon>
            <ListItemText primary="Search Users" />
          </ListItem>
        </List>
      </Drawer>
      
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/beers" element={<BeerList />} />
          <Route path="/bars" element={<BarList />} />
          <Route path="/bars/:id/events" element={<Events />} />
          <Route path="/search" element={<UserSearch />} />
        </Routes>
      </Container>
      
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={navigationValue}
          onChange={(event, newValue) => setNavigationValue(newValue)}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} component={Link} to="/" />
          <BottomNavigationAction label="Beers" icon={<LocalBarIcon />} component={Link} to="/beers" />
          <BottomNavigationAction label="Bars" icon={<LocalBarIcon />} component={Link} to="/bars" />
          <BottomNavigationAction label="Events" icon={<EventIcon />} component={Link} to="/bars/1/events" />
        </BottomNavigation>
      </Paper>
    </Router>
  );
}

export default App;
