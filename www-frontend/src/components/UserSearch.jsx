import React, { useState, useEffect } from 'react'
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import axios from 'axios'

const UserSearch = () => {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    if (search.length > 2) {
      axios.get(`http://localhost:3001/api/v1/users?handle=${search}`)
      .then(response => {
        setUsers(response.data)
      })
    }
  }, [search])

  const addFriend = (friendId) => {
    axios.post(`http://localhost:3001/api/v1/users/${friendId}/friendships`, {
      bar_id: selectedEvent
    })
    .then(() => {
      alert('Amigo agregado exitosamente')
    })
    .catch((error) => {
      alert('Error al agregar amigo')
      console.error(error)
    })
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
      
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText primary={user.handle} />
            <Button variant="contained" onClick={() => addFriend(user.id)}>
              Add Friend
            </Button>
          </ListItem>
        ))}
      </List>
    </div>
  )
}

export default UserSearch