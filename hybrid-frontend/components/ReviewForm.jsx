import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, View, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRoute } from '@react-navigation/native';
import { backend_url } from '@env';

const ReviewForm = () => {
  const route = useRoute();
  const { beerId } = route.params;
  const [rating, setRating] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      if (storedUserId) {
        setCurrentUserId(Number(storedUserId));
      } else {
        setError('User ID not found');
      }
    };
    fetchUserId();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const token = await SecureStore.getItemAsync('jwtToken');

    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be a number between 1 and 5.');
      return;
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 15) {
      setError('Review text must be at least 15 words.');
      return;
    }

    const data = {
      review: {
        rating: Number(rating),
        text,
      },
      user_id: currentUserId,
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${backend_url}/api/v1/beers/${beerId}/reviews`, data, {
        headers: { Authorization: `Bearer ${token}` },
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
    <View style={styles.container}>
      <Text style={styles.title}>Add a Review</Text>

      <TextInput
        style={styles.input}
        placeholder="Rating (1-5)"
        keyboardType="number-pad"
        value={rating}
        onChangeText={(text) => setRating(text)}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Review Text"
        multiline
        numberOfLines={4}
        value={text}
        onChangeText={(text) => setText(text)}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isSubmitting ? 'Submitting...' : 'Submit Review'}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    color: 'black',
  },
  input: {
    backgroundColor: 'lightgray',
    color: 'black',
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ReviewForm;