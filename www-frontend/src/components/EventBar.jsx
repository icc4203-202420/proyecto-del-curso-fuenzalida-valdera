import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material'
import axios from 'axios'

const EventBar = () => {
  const { id } = useParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}/events`)
        setEvents(eventsResponse.data.events)
      } catch (err) {
        console.error('Failed to load events:', err)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [id])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <div>
      <Typography variant="h5" style={{ marginTop: '20px' }}>Events at this Bar</Typography>
      <Grid container spacing={3}>
        {events.length > 0 ? (
          events.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography color="textSecondary">{event.description}</Typography>
                  <Typography color="textSecondary">{new Date(event.date).toLocaleDateString()}</Typography>
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