import React, { useEffect, useState } from 'react'
import { Container, Typography, Button, CircularProgress, TextField } from '@mui/material'
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
          setError('Something went wrong')
        }
      } catch (error) {
        setError('Error')
      } finally {
        setLoading(false)
      }
    }

    fetchBeer()
  }, [id])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

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