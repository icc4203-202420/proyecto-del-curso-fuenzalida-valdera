import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material'

const BeerReviews = () => {
  const { id } = useParams()
  const [reviews, setReviews] = useState([])
  const [beerName, setBeerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await fetch(`http://localhost:3001/api/v1/beers/${id}/reviews`)
        if (!reviewsResponse.ok) throw new Error('Failed to load reviews')

        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews)

        const beerResponse = await fetch(`http://localhost:3001/api/v1/beers/${id}`)
        if (!beerResponse.ok) throw new Error('Failed to load beer information')

        const beerData = await beerResponse.json()
        setBeerName(beerData.name)

      } catch (error) {
        console.error(error)
        setError(`Error: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [id])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reviews for {beerName}
      </Typography>
      <List>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ListItem key={review.id}>
              <ListItemText
                primary={<Typography sx={{ color: 'white' }}>Rating: {review.rating}</Typography>}
                secondary={
                  <Typography sx={{ color: 'white' }}>
                    {review.text} - Reviewed by: {review.user ? review.user.handle : 'Unknown User'} {/* Manejo de usuario undefined */}
                  </Typography>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography>No reviews available for this beer.</Typography>
        )}
      </List>
    </Container>
  )
}

export default BeerReviews