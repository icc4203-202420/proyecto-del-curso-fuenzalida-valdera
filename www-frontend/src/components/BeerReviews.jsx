import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material'

const BeerReviews = () => {
  const { id } = useParams()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/beers/${id}/reviews`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data)
        } else {
          setError('Failed to load reviews')
        }
      } catch (error) {
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
        Reviews for Beer ID {id}
      </Typography>
      <List>
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ListItem key={review.id}>
              <ListItemText
                primary={`Rating: ${review.rating}`}
                secondary={review.comment}
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