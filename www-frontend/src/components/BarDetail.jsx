import React, { useEffect, useState } from 'react'
import { Typography, Card, CardContent, CircularProgress } from '@mui/material'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const BarDetail = () => {
  const { id } = useParams()
  const [bar, setBar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/v1/bars/${id}`)
        setBar(response.data.bar)
      } catch (err) {
        console.error('Failed to load bar details:', err)
        setError('Failed to load bar details')
      } finally {
        setLoading(false)
      }
    }

    fetchBarDetails()
  }, [id])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Card>
      <CardContent>
        <Typography variant="h4">{bar.name}</Typography>
        {bar.address ? (
          <>
            <Typography variant="h6">{bar.address.line1}, {bar.address.line2}</Typography>
            <Typography variant="h6">{bar.address.city}</Typography>
          </>
        ) : (
          <Typography>Address not available</Typography>
        )}
        <Typography variant="h6">Latitude: {bar.latitude}</Typography>
        <Typography variant="h6">Longitude: {bar.longitude}</Typography>
      </CardContent>
    </Card>
  )
}

export default BarDetail