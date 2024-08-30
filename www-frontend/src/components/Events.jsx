import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const Events = () => {
  const { id } = useParams()
  const [events, setEvents] = useState([])

  useEffect(() => {
    axios.get(`/api/v1/bar/${id}/events`).then(response => setEvents(response.data)).catch(error => console.error('Error fetching events:', error))
  }, [id])

  return (
    <div>
      <h1>Events for Bar {id}</h1>
      <ul>
        {events.map(event => (<li key={event.id}>{event.name}</li>))}
      </ul>
    </div>
  )
}

export default Events;