import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ReviewForm = () => {
  const { id: beerId } = useParams(); // Obtiene el ID de la cerveza desde la URL
  const [rating, setRating] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el envío
  const [currentUserId, setCurrentUserId] = useState(null); // Estado para almacenar el ID del usuario

  useEffect(() => {
    const fetchUserId = () => {
      const storedUserId = sessionStorage.getItem('userId');
      if (storedUserId) {
        setCurrentUserId(Number(storedUserId)); // Asegúrate de que sea un número
      } else {
        setError('User ID not found in session storage');
      }
    };

    fetchUserId();
  }, []); // Este efecto se ejecuta una sola vez al montar el componente

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = sessionStorage.getItem('jwtToken');

    // Validar el rating
    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be a number between 1 and 5.');
      return;
    }

    // Validar que el texto tenga al menos 15 palabras
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 15) {
      setError('Review text must be at least 15 words.');
      return;
    }

    // Cambiar la estructura de datos para el POST
    const data = {
      review: {
        rating: Number(rating),
        text,
      },
      user_id: currentUserId, // Incluyendo el user_id directamente
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(`http://localhost:3001/api/v1/beers/${beerId}/reviews`, data, {
        headers: { Authorization: `Bearer ${token}` }, // Mantén el token para otras autenticaciones
      });

      if (response.status === 201) {
        alert('Review added successfully!');
        setRating('');
        setText('');
        setError(null);
      }
    } catch (error) {
      console.error('Error adding review:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError('Failed to add review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" style={{ color: 'white' }}>Add a Review</Typography>
      <TextField
        label="Rating (1-5)"
        variant="outlined"
        type="number"
        fullWidth
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
        InputProps={{ style: { color: 'white' } }} // Cambiar color del texto a blanco
        InputLabelProps={{ style: { color: 'white' } }} // Cambiar color de la etiqueta a blanco
      />
      <TextField
        label="Review Text"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        InputProps={{ style: { color: 'white' } }} // Cambiar color del texto a blanco
        InputLabelProps={{ style: { color: 'white' } }} // Cambiar color de la etiqueta a blanco
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
