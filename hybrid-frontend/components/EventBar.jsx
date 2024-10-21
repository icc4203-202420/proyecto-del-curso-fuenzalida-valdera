import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Image, TextInput, ScrollView, Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Importa SecureStore
import { useRoute } from '@react-navigation/native';

const EventBar = () => {
  const route = useRoute();
  const { id: barId } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageDescription, setImageDescription] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId'); // Cambia a SecureStore
        if (storedUserId) {
          setUserId(Number(storedUserId));
        } else {
          setError('User ID not found in SecureStore');
          setSnackbarVisible(true);
        }
      } catch (error) {
        console.error('Error fetching user ID from SecureStore:', error);
        setError('Failed to retrieve User ID');
        setSnackbarVisible(true);
      }
    };

    const fetchEvents = async () => {
      try {
        const eventsResponse = await axios.get(`http://localhost:3001/api/v1/bars/${barId}/events`);
        setEvents(eventsResponse.data.events || []);
      } catch (err) {
        setError('Failed to load events');
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
    fetchEvents();
  }, [barId]);

  const handleCloseSnackbar = () => {
    setSnackbarVisible(false);
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Back to Bar Details" onPress={() => navigation.goBack()} />

      <Text style={{ fontSize: 24, marginVertical: 16 }}>Events at this Bar</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: event }) => (
          <View style={{ marginVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16 }}>
            <Text style={{ fontSize: 18 }}>{event.name}</Text>
            <Text>{event.description}</Text>
            <Text>
              {new Date(event.date).toLocaleDateString()} {' '}
              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <Text style={{ marginTop: 10 }}>Attendees</Text>
            <ScrollView horizontal style={{ paddingVertical: 10 }}>
              {event.attendees && event.attendees.length > 0 ? (
                event.attendees.map((attendee) => (
                  <TouchableOpacity key={attendee.id} style={{ marginRight: 10, alignItems: 'center' }}>
                    <Avatar.Image size={40} source={{ uri: attendee.avatar_url }} />
                    <Text>{attendee.handle}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No attendees for this event</Text>
              )}
            </ScrollView>

            {event.user_has_checked_in ? (
              <Button title="You're in!" disabled />
            ) : (
              <Button title="Check In" onPress={() => handleCheckIn(event.id)} />
            )}

            <TextInput
              placeholder="Image description"
              value={imageDescription}
              onChangeText={setImageDescription}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 10 }}
            />

            {/* File input is not supported in React Native, consider using a library like react-native-image-picker */}
            {/* Replace this with an image picker */}
            <Button title="Upload Image" onPress={() => handleUploadImage(event.id)} disabled={!selectedFile || !imageDescription} />

            {/* Image gallery */}
            {event.event_pictures && event.event_pictures.length > 0 && (
              <ScrollView horizontal style={{ maxHeight: 200, marginTop: 10 }}>
                {event.event_pictures.map((picture) => (
                  <View key={picture.id} style={{ marginRight: 10 }}>
                    <Image source={{ uri: picture.image_url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                    <Text>{picture.description}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      />

      <Snackbar visible={snackbarVisible} onDismiss={handleCloseSnackbar} duration={6000}>
        <Text>{error}</Text>
      </Snackbar>
    </View>
  );
};

export default EventBar;