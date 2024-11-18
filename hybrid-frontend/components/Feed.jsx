import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { backend_url } from '@env';
import { useNavigation } from '@react-navigation/native';

const Feed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ friend_id: null, bar_id: null, country: null, beer_id: null });
  const [friends, setFriends] = useState([]);
  const [bars, setBars] = useState([]);
  const [beers, setBeers] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBarFilterModal, setShowBarFilterModal] = useState(false);
  const [showBeerFilterModal, setShowBeerFilterModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Función para obtener las publicaciones del feed
    const fetchFeed = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        const userId = await SecureStore.getItemAsync('userId');
        if (token && userId) {
          let url = `${backend_url}/api/v1/feed?user_id=${userId}`;
          
          // Agregar filtros a la URL si están presentes
          if (filter.friend_id) {
            url += `&friend_id=${filter.friend_id}`;
          }
          if (filter.bar_id) {
            url += `&bar_id=${filter.bar_id}`;
          }
          if (filter.country) {
            url += `&country=${filter.country}`;
          }
          if (filter.beer_id) {
            url += `&beer_id=${filter.beer_id}`;
          }

          const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setFeed(data);
            setLoading(false);
          } else {
            console.error('Failed to fetch feed');
            setLoading(false);
          }
        }

        const socket = new WebSocket(`${backend_url.replace('http', 'ws')}/cable`);
        socket.onopen = () => {
          console.log('WebSocket connected');
          socket.send(JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'FeedChannel',
              user_id: userId
            })
          }));
        };
        
        socket.onmessage = (e) => {
          const data = JSON.parse(e.data);
          if (data.message && data.message.type === 'new_feed_item') {
            fetchFeed();
          }
        };
        
        socket.onerror = (e) => {
          console.error('WebSocket Error:', e);
        };
        
        socket.onclose = (e) => {
          console.log('WebSocket closed:', e);
        };
        
        return () => {
          socket.close();
        };
      } catch (error) {
        console.error('Error fetching feed:', error);
        setLoading(false);
      }
    };

    // Función para obtener la lista de amigos
    const fetchFriends = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        const userId = await SecureStore.getItemAsync('userId');
        if (token && userId) {
          const response = await fetch(`${backend_url}/api/v1/feed/friends?user_id=${userId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setFriends(data);
          } else {
            console.error('Failed to fetch friends');
          }
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    // Función para obtener la lista de bares
    const fetchBars = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        const userId = await SecureStore.getItemAsync('userId');
        if (token && userId) {
          const response = await fetch(`${backend_url}/api/v1/bars?user_id=${userId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setBars(data);
          } else {
            console.error('Failed to fetch bars');
          }
        }
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    const fetchBeers = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        const userId = await SecureStore.getItemAsync('userId');
        if (token && userId) {
          const response = await fetch(`${backend_url}/api/v1/beers?user_id=${userId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const beer_data = await response.json();
            setBeers(beer_data.beers);
          } else {
            console.error('Failed to fetch beers:', response.status);
          }
        }
      } catch (error) {
        console.error('Error fetching beers:', error);
      }
    };
    


    fetchFeed();
    fetchFriends();
    fetchBars();
    fetchBeers();
  }, [filter]);

  const handleFilterByFriend = (friendId) => {
    setFilter((prevFilter) => ({ ...prevFilter, friend_id: friendId })); // Actualizar el filtro con el ID del amigo
    setShowFilterModal(false);
  };

  const handleFilterByBar = (barId) => {
    setFilter((prevFilter) => ({ ...prevFilter, bar_id: barId })); // Actualizar el filtro con el ID del bar
    setShowBarFilterModal(false);
  };

  const handleFilterByBeer = (beerId) => {
    setFilter((prevFilter) => ({ ...prevFilter, beer_id: beerId })); // Actualizar el filtro con el ID del bar
    setShowBeerFilterModal(false);
  };

  // Función para limpiar el filtro
  const handleClearFilter = () => {
    setFilter({ friend_id: null, bar_id: null, country: null, beer_id: null }); // Limpiar todos los filtros
  };

  // Mostrar el cargador mientras se obtienen los datos
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Filter by Friend" onPress={() => setShowFilterModal(true)} />
      <Button title="Filter by Bar" onPress={() => setShowBarFilterModal(true)} /> {/* Botón para filtro por bar */}
      <Button title="Filter by Beer" onPress={() => setShowBeerFilterModal(true)} />
      
      {/* Botón para limpiar el filtro */}
      <Button title="Clear Filter" onPress={handleClearFilter} />
      
      {/* Modal de selección de amigos */}
      <Modal visible={showFilterModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select a Friend</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleFilterByFriend(item.id)} style={styles.friendItem}>
                <Text>{item.handle}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setShowFilterModal(false)} />
        </View>
      </Modal>


      <Modal visible={showBeerFilterModal} animationType="slide">
        <View style={styles.modalContainer}>
        <Button title="Close" onPress={() => setShowBeerFilterModal(false)} />
          <Text style={styles.modalTitle}>Select a Beer</Text>
          <FlatList
            data={beers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleFilterByBeer(item.id)} style={styles.friendItem}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setShowBeerFilterModal(false)} />
        </View>
      </Modal>

      {/* Modal de selección de bar */}
      <Modal visible={showBarFilterModal} animationType="slide">
        <View style={styles.modalContainer}>
        <Button title="Close" onPress={() => setShowBarFilterModal(false)} />
          <Text style={styles.modalTitle}>Select a Bar</Text>
          <FlatList
            data={bars}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleFilterByBar(item.id)} style={styles.friendItem}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setShowBarFilterModal(false)} />
        </View>
      </Modal>



      {/* Mostrar las publicaciones filtradas o completas */}
      {feed.length === 0 ? (
        <Text>No posts found for this filter</Text>
      ) : (
        feed.map((post, index) => {
          const formattedDate = new Date(post.created_at).toLocaleString();

          return (
            <View key={index} style={styles.post}>
              {post.type === 'event_picture' && (
                <TouchableOpacity onPress={() => navigation.navigate('EventBar', { id: post.bar_id, featured_event_id: post.event_id })}>
                  <Text style={styles.title}>{post.event_name || 'No Name Assigned'}</Text>
                  <Text style={styles.title}>{post.bar_id || 'No Name Assigned'}</Text>
                  <Text>Posted by: {post.user_name}</Text>
                  <Image source={{ uri: post.image_url }} style={styles.image} />
                  <Text>{post.description}</Text>
                  <Text style={styles.date}>Date: {formattedDate}</Text>
                </TouchableOpacity>
              )}
              {post.type === 'beer_review' && (
                <TouchableOpacity onPress={() => navigation.navigate('BeerDetail', { beerId: post.beer_id })}>
                  <Text style={styles.title}>{post.beer_name || 'No Beer Name'}</Text>
                  <Text>Reviewed by: {post.user_name}</Text>
                  <Text style={styles.rating}>Rating: {post.rating}</Text>
                  <Text>{post.review_text}</Text>
                  <Text style={styles.date}>Date: {formattedDate}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  post: { marginBottom: 20 },
  title: { fontWeight: 'bold', fontSize: 16 },
  image: { width: '100%', height: 200, marginVertical: 10 },
  date: { fontSize: 12, color: 'gray' },
  modalContainer: { padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  friendItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});

export default Feed;
