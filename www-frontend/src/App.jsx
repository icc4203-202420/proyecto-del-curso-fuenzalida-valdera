import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Container, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import LocalBarIcon from '@mui/icons-material/LocalBar'
import EventIcon from '@mui/icons-material/Event'
import SearchIcon from '@mui/icons-material/Search'
import LogoutIcon from '@mui/icons-material/Logout'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Map from './components/Map'
import BeerList from './components/BeerList'
import BarList from './components/BarList'
import Events from './components/Events'
import UserSearch from './components/UserSearch'
import BeerDetail from './components/BeerDetail'
import ReviewForm from './components/ReviewForm'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken')
    setIsAuthenticated(!!token)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login')
    } else if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/map')
    }
  }, [isAuthenticated, location.pathname, navigate])

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setDrawerOpen(open)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <>
      <AppBar position="fixed" style={{ width: '100%', height: '64px', backgroundColor: '#FFEB3B' }}>
        <Toolbar>
          {isAuthenticated && (
            <>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                <MenuIcon style={{ color: 'black' }} />
              </IconButton>
              <Typography variant="h6" style={{ flexGrow: 1, color: 'black' }}>
                Pintpals
              </Typography>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {isAuthenticated && (
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
            <ListItem button component={Link} to="/map" onClick={toggleDrawer(false)} style={{color: 'black'}}>
              <ListItemIcon><HomeIcon style={{ color: 'black' }} /></ListItemIcon>
              <ListItemText primary="Home/Map" />
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
            <ListItem button onClick={() => { handleLogout(); toggleDrawer(false); }} style={{color: 'black'}}>
              <ListItemIcon><LogoutIcon style={{ color: 'black' }} /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      )}
      
      <Container style={{ 
        marginTop: '64px', 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex', 
        justifyContent: 'center',
        padding: '0 16px'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/beers" element={isAuthenticated ? <BeerList /> : <Navigate to="/login" />} />
            <Route path="/bars" element={isAuthenticated ? <BarList /> : <Navigate to="/login" />} />
            <Route path="/bars/:id/events" element={isAuthenticated ? <Events /> : <Navigate to="/login" />} />
            <Route path="/search" element={isAuthenticated ? <UserSearch /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/map" element={isAuthenticated ? <Map /> : <Navigate to="/login" />} />
            <Route path="/beers/:id" element={isAuthenticated ? <BeerDetail /> : <Navigate to="/login" />} />
            <Route path="/beers/:id/add-review" element={isAuthenticated ? <ReviewForm /> : <Navigate to="/login" />} />
            <Route path="/logout" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Container>
    </>
  )
}

export default App