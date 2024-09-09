import React, { useState } from 'react'
import { TextField, Button, Typography } from '@mui/material'
import axios from 'axios'

const ReviewForm = ({ beerId }) => {
  const [rating, setRating] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (rating < 1 || rating > 5) {
      setError('rating must be between 1 and 5')
      return
    }
    if (text.split(' ').length < 15) {
      setError('Review must be at least 15 words long')
      return
    }
    try {
      await axios.post('/api/v1/reviews', { rating, text, beer_id: beerId })
      setRating('')
      setText('')
      setError('')
    } catch (error) {
      setError('Error')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Add a Review</Typography>
      <TextField
        label="Rating (1-5)"
        type="number"
        inputProps={{ min: 1, max: 5 }}
        fullWidth
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Review Text"
        multiline
        rows={4}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained">Submit Review</Button>
    </form>
  )
}

export default ReviewForm