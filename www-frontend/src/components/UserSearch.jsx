import React, { useState, useEffect } from 'react'
import { TextField, Button, List, ListItem, ListItemText, Menu, MenuItem } from '@mui/material'
import axios from 'axios'

const UserSearch = () => {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [bars, setBars] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [error, setError] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [friendToAdd, setFriendToAdd] = useState(null) // Estado para almacenar el ID del amigo a agregar

  useEffect(() => {
    const fetchUserId = () => {
      const storedUserId = sessionStorage.getItem('userId')
      if (storedUserId) {
        setCurrentUserId(Number(storedUserId))
      } else {
        setError('User ID not found in session storage')
      }
    }

    fetchUserId()

    const fetchUsers = async () => {
      if (search.length > 2) {
        try {
          const response = await axios.get(`http://localhost:3001/api/v1/users?handle=${search}`)
          setUsers(response.data)
          setError(null)
        } catch (err) {
          setError('Failed to fetch users. Please try again.')
          console.error(err)
        }
      } else {
        setUsers([])
      }
    }

    fetchUsers()
  }, [search])

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/bars')
        setBars(response.data)
      } catch (err) {
        console.error('Failed to fetch bars:', err)
      }
    }

    fetchBars()
  }, [])

  const handleClick = (event, friendId) => {
    setFriendToAdd(friendId) // Almacena el ID del amigo a agregar
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleBarSelect = async (barId) => {
    setSelectedEvent(barId)
    handleClose() // Cierra el menú después de seleccionar un bar
    await addFriend(friendToAdd, barId) // Llama a addFriend con el ID del amigo y el ID del bar
  }

  const addFriend = async (friendId, barId) => {
    const token = sessionStorage.getItem('jwtToken')
  
    const data = {
      bar_id: barId || null,
      user: currentUserId.toString(), // ID del usuario actual
      friend_id: friendId // ID de la persona que quieres agregar
    }
  
    try {
      await axios.post(
        `http://localhost:3001/api/v1/users/${currentUserId}/friendships`, // Cambia friendId por currentUserId
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Friend added')
    } catch (error) {
      console.error('Error:', error)
      if (error.response && error.response.status === 401) {
        alert('Unauthorized. Please check your token.')
      } else {
        alert('Something went wrong')
      }
    }
  }  

  return (
    <div>
      <TextField
        label="Search User @"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        sx={{ backgroundColor: 'white' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText primary={user.handle} />
            <Button variant="contained" onClick={(event) => handleClick(event, user.id)}>
              Add Friend
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              {bars.map((bar) => (
                <MenuItem key={bar.id} onClick={() => handleBarSelect(bar.id)}>
                  {bar.name}
                </MenuItem>
              ))}
            </Menu>
          </ListItem>
        ))}
      </List>
    </div>
  )
}

export default UserSearch