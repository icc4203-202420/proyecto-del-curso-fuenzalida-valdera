import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Card, CardContent, Grid, CircularProgress, Button, Avatar, Tooltip, Autocomplete, TextField, Snackbar, Alert } from '@mui/material'
import axios from 'axios'

const EventBar = () => {
  const { id: barId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageDescription, setImageDescription] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    const fetchUserId = () => {
      const storedUserId = sessionStorage.getItem('userId')
      if (storedUserId) {
        setUserId(Number(storedUserId))
      } else {
        setError('User ID not found in session storage')
        setSnackbarOpen(true)
      }
    }

    const fetchEvents = async () => {
      try {
        const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`)
        setEvents(eventsResponse.data.events || [])
      } catch (err) {
        setError('Failed to load events')
        setSnackbarOpen(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUserId()
    fetchEvents()
  }, [barId])

  const handleCheckIn = async (eventId) => {
    const token = sessionStorage.getItem('jwtToken')
  
    // Verifica que el token esté disponible
    if (!token) {
      setError('Token not found. Please log in again.')
      setSnackbarOpen(true)
      return
    }
  
    const data = {
      user_id: userId,
      event: String(eventId),
    }
  
    try {
      await axios.post(
        `http://localhost:3001/api/v1/bars/${barId}/events/${eventId}/check_in`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
  
      // Refrescar eventos después de un check-in exitoso
      const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`)
      setEvents(eventsResponse.data.events || [])
    } catch (error) {
      console.error('Error:', error)
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Unauthorized. Please check your token.')
        } else {
          setError('Failed to check in: ' + error.response.data.message)
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
      
      setSnackbarOpen(true)
    }
  }  

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleUploadImage = async (eventId) => {
    if (!selectedFile || !userId || !imageDescription) {
      return
    }

    const formData = new FormData()
    formData.append('event_picture[image]', selectedFile)
    formData.append('event_picture[description]', imageDescription)
    formData.append('event_picture[user_id]', userId)

    try {
      await axios.post(`http://localhost:3001/api/v1/bars/${barId}/events/${eventId}/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`)
      setEvents(eventsResponse.data.events || [])
      setSelectedFile(null)
      setImageDescription('')
      document.getElementById(`file-input-${eventId}`).value = null
    } catch (err) {
      setError('Failed to upload image')
      setSnackbarOpen(true)
    }
  }

  const formatDescription = (description) => {
    const regex = /@(\w+)/g
    const parts = description.split(regex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} style={{ color: 'blue', cursor: 'pointer' }} onClick={() => console.log(`Navigate to ${part}`)}>
            @{part}
          </span>
        )
      }
      return part
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <div>
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={() => navigate(-1)} 
        style={{ margin: '20px 0' }}
      >
        Back to Bar Details
      </Button>

      <Typography variant="h5" style={{ marginTop: '20px' }}>Events at this Bar</Typography>

      <Grid container spacing={3}>
      {events.length > 0 ? (
        events.map(event => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{event.name}</Typography>
                <Typography color="textSecondary">{event.description}</Typography>
                <Typography color="textSecondary">
                  {new Date(event.date).toLocaleDateString()}{' '}
                  {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>

                {/* Mostrar los asistentes */}
                <Typography variant="body1" style={{ marginTop: '10px' }}>Attendees</Typography>
                <div style={{ display: 'flex', overflowX: 'scroll', padding: '10px 0' }}>
                  {event.attendees && event.attendees.length > 0 ? (
                    event.attendees.map(attendee => (
                      <div key={attendee.id} style={{ marginRight: '10px', textAlign: 'center' }}>
                        <Tooltip title={attendee.handle}>
                          <Avatar alt={attendee.name} src={attendee.avatar_url} />
                        </Tooltip>
                        <Typography variant="caption" style={{ marginTop: '5px' }}>{attendee.handle}</Typography>
                      </div>
                    ))
                  ) : (
                    <Typography>No attendees for this event</Typography>
                  )}
                </div>

                {/* Check-in button */}
                {event.user_has_checked_in ? (
                  <Button variant="outlined" disabled style={{ marginTop: '10px' }}>You're in!</Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleCheckIn(event.id)} 
                    style={{ marginTop: '10px' }}
                  >
                    Check In
                  </Button>
                )}

                {/* Input para subir imágenes desde cámara o galería */}
                <input 
                  id={`file-input-${event.id}`}
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleFileChange} 
                  style={{ marginTop: '10px' }}
                />
                
                {/* Campo para ingresar la descripción de la imagen */}
                <TextField
                  variant="outlined"
                  placeholder="Description of the image"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  style={{ marginTop: '10px', width: '100%' }}
                />

                {/* Autocomplete para etiquetar usuarios */}
                {event.attendees && event.attendees.length > 0 && (
                  <Autocomplete
                    options={event.attendees}
                    getOptionLabel={(option) => option.handle}
                    onChange={(event, value) => {
                      if (value) {
                        const newDescription = imageDescription + ` @${value.handle}`
                        setImageDescription(newDescription)
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Tag Users" variant="outlined" style={{ marginTop: '10px' }} />
                    )}
                    freeSolo
                  />
                )}

                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={() => handleUploadImage(event.id)} 
                  disabled={!selectedFile || !imageDescription}
                  style={{ marginTop: '10px' }}
                >
                  Upload Image
                </Button>

                {/* Mostrar imágenes asociadas al evento */}
                {event.event_pictures && event.event_pictures.length > 0 && (
                  <Grid container spacing={2} style={{ marginTop: '10px' }}>
                    {event.event_pictures.map(picture => (
                      <Grid item xs={12} sm={6} md={4} key={picture.id}>
                        <Card>
                          <img
                            src={picture.image_url}
                            alt={picture.description || 'Event image'}
                            style={{ width: '100%', height: 'auto' }}
                          />
                          <CardContent>
                            <Typography>
                              {formatDescription(picture.description)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography>No events found</Typography>
      )}
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default EventBar