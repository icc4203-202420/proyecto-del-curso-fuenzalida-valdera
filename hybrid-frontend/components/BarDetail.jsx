import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { backend_url } from '@env'

const BarDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params; // Obtén el ID de la ruta
  const [bar, setBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBarDetails = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/v1/bars/${id}`);
        setBar(response.data.bar);
      } catch (err) {
        console.error('Failed to load bar details:', err);
        setError('Failed to load bar details');
      } finally {
        setLoading(false);
      }
    };

    fetchBarDetails();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Card.Content>
          <Title>{bar.name}</Title>
          {bar.address ? (
            <>
              <Paragraph>{bar.address.line1}, {bar.address.line2}</Paragraph>
              <Paragraph>{bar.address.city}, {bar.address.country.name}</Paragraph>
            </>
          ) : (
            <Paragraph>Address not available</Paragraph>
          )}
          <Paragraph>Latitude: {bar.latitude}</Paragraph>
          <Paragraph>Longitude: {bar.longitude}</Paragraph>

          {bar.events && bar.events.length > 0 && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EventBar', { id })} // Navega a EventBar
              style={styles.button}
            >
              View Events
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});

export default BarDetail;