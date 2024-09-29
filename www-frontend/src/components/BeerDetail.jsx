import React, { useEffect, useReducer, useState } from 'react'
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material'
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
        totalPages: action.payload.totalPages,
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
    totalPages: 1,
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
          params: { page: reviewsState.page, per_page: 5 },
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
  if (!beer) return <Typography color="#ffffff">No details available for this beer.</Typography>

  return (
    <Container style={{ backgroundColor: '#121212', color: '#ffffff', padding: '20px', borderRadius: '8px' }}>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#1e1e1e' }}>
        <Typography variant="h4" gutterBottom style={{ color: '#ffffff' }}>
          {beer.name}
        </Typography>
        <Typography variant="h6" style={{ color: '#ffffff' }}>Type: {beer.beer_type ? beer.beer_type : 'No type available'}</Typography>
        <Typography variant="body1" style={{ color: '#ffffff' }}>Style: {beer.style ? beer.style : 'No style available'}</Typography>
        <Typography variant="body1" style={{ color: '#ffffff' }}>IBU: {beer.ibu ? beer.ibu : 'No IBU information available'}</Typography>
        <Typography variant="body1" style={{ color: '#ffffff' }}>Alcohol: {beer.alcohol}</Typography>
        <Typography variant="body1" style={{ color: '#ffffff' }}>Average Rating: {beer.avg_rating !== null ? beer.avg_rating : 'No rating available'}</Typography>
      </Paper>

      <ReviewForm beerId={beer.id} />

      <Typography variant="h6" gutterBottom style={{ color: '#ffffff' }}>
        Reviews
      </Typography>

      {reviewsState.loading ? (
        <CircularProgress />
      ) : (
        <List style={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
          {reviewsState.reviews.length > 0 ? (
            reviewsState.reviews.map((review) => (
              <React.Fragment key={review.id}>
                <ListItem>
                  <ListItemText 
                    primary={`Rating: ${review.rating}`} 
                    secondary={review.text} 
                    primaryTypographyProps={{ style: { color: '#ffffff' } }} // Color blanco para el texto principal
                    secondaryTypographyProps={{ style: { color: '#ffffff' } }} // Color blanco para el texto secundario
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Typography color="#ffffff">No reviews available</Typography> // Texto blanco
          )}
        </List>
      )}

      <Button
        onClick={() => dispatch({ type: 'FETCH_INIT', page: reviewsState.page - 1 })}
        disabled={reviewsState.page === 1}
        style={{ marginRight: '10px', color: '#ffffff', backgroundColor: '#007bff' }}
      >
        Previous
      </Button>
      <Button
        onClick={() => dispatch({ type: 'FETCH_INIT', page: reviewsState.page + 1 })}
        disabled={reviewsState.page === reviewsState.totalPages}
        style={{ color: '#ffffff', backgroundColor: '#007bff' }}
      >
        Next
      </Button>
    </Container>
  )
}

export default BeerDetail