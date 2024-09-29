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
import { useParams, useNavigate } from 'react-router-dom'
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
    case 'SET_PAGE':
      return { ...state, page: action.page }; // Agregado para establecer la página
    default:
      throw new Error()
  }
}

const BeerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
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
          params: { page: reviewsState.page, per_page: 1 }, // Solo una reseña a la vez
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

  const currentReview = reviewsState.reviews[0] || null;

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

      <Button
        onClick={() => navigate(`/beers/${id}/add-review`)} // Redirige al formulario de reseñas
        style={{ marginBottom: '20px', color: '#ffffff', backgroundColor: '#007bff' }}
      >
        Add Review
      </Button>

      <Typography variant="h6" gutterBottom style={{ color: '#ffffff' }}>
        Review
      </Typography>

      {reviewsState.loading ? (
        <CircularProgress />
      ) : currentReview ? (
        <List style={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
          <ListItem>
            <ListItemText 
              primary={`Rating: ${currentReview.rating}`} 
              secondary={currentReview.text} 
              primaryTypographyProps={{ style: { color: '#ffffff' } }} // Color blanco para el texto principal
              secondaryTypographyProps={{ style: { color: '#ffffff' } }} // Color blanco para el texto secundario
            />
          </ListItem>
          <Divider />
        </List>
      ) : (
        <Typography color="#ffffff">No reviews available</Typography> // Texto blanco
      )}

      <Button
        onClick={() => {
          const newPage = reviewsState.page - 1;
          if (newPage >= 1) {
            dispatch({ type: 'SET_PAGE', page: newPage });
          }
        }}
        disabled={reviewsState.page === 1}
        style={{ marginRight: '10px', color: '#ffffff', backgroundColor: '#007bff' }}
      >
        Previous
      </Button>
      <Button
        onClick={() => {
          const newPage = reviewsState.page + 1;
          if (newPage <= reviewsState.totalPages) {
            dispatch({ type: 'SET_PAGE', page: newPage });
          }
        }}
        disabled={reviewsState.page === reviewsState.totalPages}
        style={{ color: '#ffffff', backgroundColor: '#007bff' }}
      >
        Next
      </Button>
    </Container>
  )
}

export default BeerDetail