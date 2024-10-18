import React, { useEffect, useReducer, useState } from 'react'
import { Container, Typography, CircularProgress, Button, List, ListItem, Divider } from '@mui/material'
import ReviewForm from './ReviewForm'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const reviewsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: '', reviews: [], page: action.page }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        reviews: action.payload.reviews,
        totalPages: action.payload.totalPages
      }
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload }
    default:
      throw new Error()
  }
}

const BeerDetail = () => {
  const { id } = useParams()
  const [beer, setBeer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewsState, dispatch] = useReducer(reviewsReducer, {
    reviews: [],
    loading: true,
    error: '',
    page: 1,
    totalPages: 1
  })

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

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch({ type: 'FETCH_INIT', page: reviewsState.page })
      try {
        const response = await axios.get(`http://localhost:3001/api/v1/beers/${id}/reviews`, {
          params: { page: reviewsState.page, per_page: 5 } 
        })
        const data = response.data
        dispatch({ type: 'FETCH_SUCCESS', payload: { reviews: data.reviews, totalPages: data.total_pages } })
      } catch (error) {
        dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to load reviews' })
      }
    }

    if (beer) {
      fetchReviews()
    }
  }, [id, reviewsState.page, beer])

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

      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>

      {reviewsState.loading ? (
        <CircularProgress />
      ) : (
        <List>
          {reviewsState.reviews.length > 0 ? (
            reviewsState.reviews.map((review) => (
              <React.Fragment key={review.id}>
                <ListItem>
                  <ListItemText primary={`Rating: ${review.rating}`} secondary={review.text} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Typography>No reviews available</Typography>
          )}
        </List>
      )}

      <Button
        onClick={() => dispatch({ type: 'FETCH_INIT', page: reviewsState.page - 1 })}
        disabled={reviewsState.page === 1}
      >
        Previous
      </Button>
      <Button
        onClick={() => dispatch({ type: 'FETCH_INIT', page: reviewsState.page + 1 })}
        disabled={reviewsState.page === reviewsState.totalPages}
      >
        Next
      </Button>
    </Container>
  )
}

export default BeerDetail
