import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const ReviewForm = () => {
  const route = useRoute();
  const { beerId } = route.params; // Obtiene el ID de la cerveza desde la URL
  const [rating, setRating] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); 

  useEffect(() => {
    // Obtiene el ID del usuario desde sessionStorage
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setCurrentUserId(Number(storedUserId)); // Asegúrate de que sea un número
    } else {
      setError('User ID not found in session storage');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Limpia los errores previos
    const token = sessionStorage.getItem('jwtToken');

    // Validar el rating (debe estar entre 1 y 5)
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

    // Crear la data para el POST
    const data = {
      review: {
        rating: Number(rating),
        text,
      },
      user_id: currentUserId, // Incluye el user_id directamente
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(`http://localhost:3001/api/v1/beers/${beerId}/reviews`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        alert('Review added successfully!');
        setRating(''); // Resetea el campo de rating
        setText(''); // Resetea el campo de texto
        setError(null);
      }
    } catch (error) {
      console.error('Error adding review:', error);
      // Muestra los errores específicos si están disponibles
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError('Failed to add review. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Marca que se terminó el envío
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" style={{ color: 'black' }}>Add a Review</Typography>

      <TextField
        label="Rating (1-5)"
        variant="outlined"
        type="number"
        fullWidth
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
        sx={{
          '& .MuiInputBase-input': { color: 'black' }, // Texto en negro
          backgroundColor: 'lightgray', // Fondo gris claro
        }}
        InputLabelProps={{ style: { color: 'black' } }}
        error={!!error && (rating < 1 || rating > 5)} // Muestra error si rating es inválido
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
        sx={{
          '& .MuiInputBase-input': { color: 'black' }, // Texto en negro
          backgroundColor: 'lightgray', // Fondo gris claro
        }}
        InputLabelProps={{ style: { color: 'black' } }}
        error={!!error && text.trim().split(/\s+/).length < 15} // Muestra error si el texto tiene menos de 15 palabras
      />

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Muestra mensaje de error */}
      
      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
