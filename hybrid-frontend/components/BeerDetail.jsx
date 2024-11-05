import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, ActivityIndicator, Button, FlatList, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { backend_url } from '@env'

const reviewsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: '', reviews: [], page: action.page };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        reviews: action.payload.reviews,
        totalPages: action.payload.totalPages,
      };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.page };
    default:
      throw new Error();
  }
};

const BeerDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { beerId } = route.params;
  const [beer, setBeer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsState, dispatch] = useReducer(reviewsReducer, {
    reviews: [],
    loading: true,
    error: '',
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchBeer = async () => {
      try {
        const response = await fetch(`${backend_url}/api/v1/beers/${beerId}`);
        if (response.ok) {
          const data = await response.json();
          setBeer(data);
        } else {
          setError('Failed to load beer details');
        }
      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBeer();
  }, [beerId]);

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch({ type: 'FETCH_INIT', page: reviewsState.page });
      try {
        const response = await axios.get(`http://localhost:3001/api/v1/beers/${beerId}/reviews`, {
          params: { page: reviewsState.page, per_page: 1 },
        });
        const data = response.data;
        dispatch({ type: 'FETCH_SUCCESS', payload: { reviews: data.reviews, totalPages: data.total_pages } });
      } catch (error) {
        dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to load reviews' });
      }
    };

    if (beer) {
      fetchReviews();
    }
  }, [beerId, reviewsState.page, beer]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!beer) return <Text>No details available for this beer.</Text>;

  const currentReview = reviewsState.reviews[0] || null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{beer.name}</Text>
      <Text style={styles.detail}>Type: {beer.beer_type || 'No type available'}</Text>
      <Text style={styles.detail}>Style: {beer.style || 'No style available'}</Text>
      <Text style={styles.detail}>IBU: {beer.ibu || 'No IBU information available'}</Text>
      <Text style={styles.detail}>Alcohol: {beer.alcohol}</Text>
      <Text style={styles.detail}>Average Rating: {beer.avg_rating !== null ? beer.avg_rating : 'No rating available'}</Text>

      <Button title="Add Review" onPress={() => navigation.navigate('ReviewForm', { beerId })} />

      <Text style={styles.reviewTitle}>Review</Text>

      {reviewsState.loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : currentReview ? (
        <View style={styles.reviewCard}>
          <Text style={styles.rating}>Rating: {currentReview.rating}</Text>
          <Text>{currentReview.text}</Text>
        </View>
      ) : (
        <Text>No reviews available</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Previous"
          onPress={() => {
            const newPage = reviewsState.page - 1;
            if (newPage >= 1) {
              dispatch({ type: 'SET_PAGE', page: newPage });
            }
          }}
          disabled={reviewsState.page === 1}
        />
        <Button
          title="Next"
          onPress={() => {
            const newPage = reviewsState.page + 1;
            if (newPage <= reviewsState.totalPages) {
              dispatch({ type: 'SET_PAGE', page: newPage });
            }
          }}
          disabled={reviewsState.page === reviewsState.totalPages}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#505050',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detail: {
    color: '#ffffff',
    marginVertical: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: '#d0d0d0',
    borderRadius: 8,
    marginVertical: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default BeerDetail;