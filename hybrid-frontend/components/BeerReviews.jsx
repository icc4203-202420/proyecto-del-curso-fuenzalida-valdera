import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { backend_url } from '@env';

const BeerReviews = () => {
  const route = useRoute();
  const { beerId } = route.params; // Obtener beerId desde la ruta
  const [reviews, setReviews] = useState([]);
  const [beerName, setBeerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await fetch(`${backend_url}/api/v1/beers/${beerId}/reviews`);
        if (!reviewsResponse.ok) throw new Error('Failed to load reviews');

        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews);

        const beerResponse = await fetch(`${backend_url}/api/v1/beers/${beerId}`);
        if (!beerResponse.ok) throw new Error('Failed to load beer information');

        const beerData = await beerResponse.json();
        setBeerName(beerData.name);
      } catch (error) {
        console.error(error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [beerId]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews for {beerName}</Text>
      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={styles.rating}>Rating: {item.rating}</Text>
              <Text style={styles.reviewText}>
                {item.text} - Reviewed by: {item.user && item.user.handle ? item.user.handle : 'Unknown User'}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text>No reviews available for this beer.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewText: {
    fontSize: 14,
    marginTop: 8,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default BeerReviews;