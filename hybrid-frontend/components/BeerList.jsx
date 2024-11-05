import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Rating } from 'react-native-ratings';
import { useNavigation } from '@react-navigation/native';
import { backend_url } from '@env';

const BeerList = () => {
  const [beers, setBeers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBeers, setFilteredBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/v1/beers`); // Asegúrate de que este endpoint es correcto
        if (response.data && response.data.beers) {
          setBeers(response.data.beers);
          setFilteredBeers(response.data.beers);
        } else {
          setError('No beers found');
        }
      } catch (err) {
        setError('Failed to load beers');
      } finally {
        setLoading(false);
      }
    };

    fetchBeers();
  }, []);

  useEffect(() => {
    setFilteredBeers(
      beers.filter(beer => beer.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, beers]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Beers"
        onChangeText={setSearch}
        value={search}
      />
      <FlatList
        data={filteredBeers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.beerName}>{item.name}</Text>
            <Rating
              imageSize={20}
              fractions={2}
              readonly
              startingValue={item.avg_rating}
              style={styles.rating}
            />
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.buttonContainer}>
              <Button title="View Reviews" onPress={() => navigation.navigate('BeerReviews', { beerId: item.id })} />
              <Button title="Add Review" onPress={() => navigation.navigate('ReviewForm', { beerId: item.id })} />
              <Button title="See Details" onPress={() => navigation.navigate('BeerDetail', { beerId: item.id })} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    borderRadius: 8,
  },
  card: {
    padding: 16,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  beerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rating: {
    marginVertical: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BeerList;