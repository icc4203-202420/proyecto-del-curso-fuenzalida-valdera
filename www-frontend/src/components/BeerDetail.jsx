import React, { useEffect, useState } from 'react'
import { Container, Typography, CircularProgress } from '@mui/material'
import ReviewForm from './ReviewForm'
import { useParams } from 'react-router-dom'

const BeerDetail = () => {
  const { id } = useParams()
  const [beer, setBeer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBeer = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/beers/${id}`)
        if (response.ok) {
          const data = await response.json()
          setBeer(data)
        } else {
          setError('Failed to load beer details')
        }
      } catch (error) {
        setError(`Error: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchBeer()
  }, [id])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  if (!beer) return <Typography>No details available for this beer.</Typography>

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {beer.name}
      </Typography>
      <Typography variant="h6">Type: {beer.beer_type}</Typography>
      <Typography variant="body1">Style: {beer.style}</Typography>
      <Typography variant="body1">IBU: {beer.ibu}</Typography>
      <Typography variant="body1">Alcohol: {beer.alcohol}</Typography>
      <Typography variant="body1">Average Rating: {beer.avg_rating}</Typography>
      <ReviewForm beerId={beer.id} />
    </Container>
  )
}

export default BeerDetail