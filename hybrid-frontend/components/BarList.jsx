import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BarList = () => {
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/bars');
        if (Array.isArray(response.data)) {
          setBars(response.data);
        } else {
          setError('Unexpected data format');
        }
      } catch (err) {
        console.error('Failed to load bars:', err);
        setError('Failed to load Bars');
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, []);

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bar List</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Bars"
        onChangeText={setSearch}
        value={search}
      />
      <FlatList
        data={filteredBars}
        keyExtractor={bar => bar.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.name}</Title>
              <Paragraph>
                {item.address.line1}, {item.address.line2}, {item.address.city}, {item.address.country.name}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                onPress={() => navigation.navigate('BarDetail', { barId: item.id })} // Cambia "BarDetails" al nombre de tu pantalla de detalles
                mode="contained"
                style={styles.button}
              >
                See Details
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text>No bars found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
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
});

export default BarList;