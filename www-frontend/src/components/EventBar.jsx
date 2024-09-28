import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Card, CardContent, Grid, CircularProgress, Button, Avatar, Tooltip } from '@mui/material'
import axios from 'axios'

const EventBar = () => {
  const { id: barId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null) // Asegúrate de establecer este valor correctamente
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedEventId, setSelectedEventId] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`)
        setEvents(eventsResponse.data.events || [])
      } catch (err) {
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
  
    fetchEvents()
  }, [barId])  

  const handleCheckIn = async (eventId) => {
    if (!userId) {
      setError('User not logged in')
      return
    }
    
    try {
      await axios.post(`http://localhost:3001/api/v1/bars/${barId}/events/${eventId}/check_in`, { user_id: userId })
      const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`)
      setEvents(eventsResponse.data.events || [])
    } catch (err) {
      setError('Failed to check in')
    }
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleUploadImage = async (eventId) => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('event_picture[image]', selectedFile)
    formData.append('event_picture[description]', 'Image for event')

    try {
      await axios.post(`http://localhost:3001/api/v1/bars/${barId}/events/${eventId}/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`)
      setEvents(eventsResponse.data.events || [])
      setSelectedFile(null) // Clear selected file
      setSelectedEventId(null) // Clear selected event id
    } catch (err) {
      setError('Failed to upload image')
    }
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
                    {' At your time zone'}
                  </Typography>

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

                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ marginTop: '10px' }}
                  />
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleUploadImage(event.id)} 
                    disabled={!selectedFile} 
                    style={{ marginTop: '10px' }}
                  >
                    Upload Image
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No events found</Typography>
        )}
      </Grid>
    </div>
  )
}

export default EventBar
