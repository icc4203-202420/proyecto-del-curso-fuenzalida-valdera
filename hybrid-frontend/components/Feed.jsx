import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { backend_url } from '@env';
import { useNavigation } from '@react-navigation/native';

const Feed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        if (token) {
          const response = await fetch(`${backend_url}/api/v1/feed`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setFeed(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          } else {
            console.error('Failed to fetch feed');
          }
        }
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const filteredFeed = filter ? feed.filter((post) => /* filter logic here */ true) : feed;

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Filter" onPress={() => setFilter(/* filter logic here, yep, not done yet haha */)} />
      {filteredFeed.map((post, index) => {
        const formattedDate = new Date(post.created_at);
        const date = isNaN(formattedDate) ? 'Invalid Date' : formattedDate.toLocaleString();

        return (
          <View key={index} style={styles.post}>
            {/* Mostrar publicaciones de eventos */}
            {post.type === 'event_picture' && (
              <TouchableOpacity onPress={() => navigation.navigate('EventBar', { eventId: post.event_id })}>
                <Text style={styles.title}>{post.event_name || 'No Name Assigned'}</Text>
                <Image source={{ uri: post.image_url }} style={styles.image} />
                <Text>{post.description}</Text>
                <Text style={styles.date}>Date: {date}</Text>
              </TouchableOpacity>
            )}

            {/* Mostrar reviews de cervezas */}
            {post.type === 'beer_review' && (
              <TouchableOpacity onPress={() => navigation.navigate('BeerDetail', { beerId: post.beer_id })}>
                <Text style={styles.title}>{post.beer_name || 'No Beer Name'}</Text>
                <Text style={styles.rating}>Rating: {post.rating}</Text>
                <Text>{post.review_text}</Text>
                <Text style={styles.date}>Date: {date}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  post: { marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  title: { fontSize: 18, fontWeight: 'bold' },
  image: { width: '100%', height: 200, borderRadius: 5, marginBottom: 10 },
  rating: { color: '#ff9900', fontWeight: 'bold' },
  date: { color: '#888', marginTop: 5 },
});

export default Feed;
