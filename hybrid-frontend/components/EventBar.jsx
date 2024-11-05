import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Image, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Snackbar, Avatar } from 'react-native-paper';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRoute } from '@react-navigation/native';
import { backend_url } from '@env';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Video } from 'expo-av';
import { Linking } from 'react-native';

const EventBar = () => {
  const route = useRoute();
  const { id: barId } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null); // Estado para la URL del video

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        alert('Permission to access media library and camera is required!');
      }
    }
  };

  useEffect(() => {
    requestPermissions();

    const fetchUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
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
        const eventsResponse = await axios.get(`${backend_url}/api/v1/bars/${barId}/events`);
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

  // useEffect para verificar el valor de videoUrl
  useEffect(() => {
    if (videoUrl) {
      console.log('Video URL set:', videoUrl);
    }
  }, [videoUrl]);

  const handleCloseSnackbar = () => {
    setSnackbarVisible(false);
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleUploadImage = async (eventId, userId) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
    
      if (!token) {
        setError('Token not found. Please log in again.');
        setSnackbarVisible(true);
        return;
      }
    
      const formData = new FormData();
      formData.append('event_picture[description]', imageDescription);
      formData.append('event_picture[image]', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: selectedImage.fileName || 'uploaded_image.jpg',
      });
      formData.append('event_picture[user_id]', userId);

      const response = await axios.post(
        `${backend_url}/api/v1/bars/${barId}/events/${eventId}/event_pictures`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setImageDescription('');
      setSelectedImage(null);
  
    } catch (error) {
      console.error('Error during image upload:', error);
      setError('Failed to upload image. Please try again.');
      setSnackbarVisible(true);
    }
  };

  const handleUserSelect = (value) => {
    if (!value) return; // Si no hay valor, salir de la función
  
    setImageDescription((prevDescription) => {
      return prevDescription ? `${prevDescription} @${value}` : `@${value}`;
    });
    setSelectedUser(null);
  };

  const handleCheckIn = async (eventId) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      if (!token) {
        setError('Token not found. Please log in again.');
        setSnackbarVisible(true);
        return;
      }

      const data = {
        user_id: userId,
        event: String(eventId),
      };

      await axios.post(
        `${backend_url}/api/v1/bars/${barId}/events/${eventId}/check_in`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const eventsResponse = await axios.get(`${backend_url}/api/v1/bars/${barId}/events`);
      setEvents(eventsResponse.data.events || []);

    } catch (error) {
      console.error('Error during check-in:', error);
      setError('Failed to check in. Please try again.');
      setSnackbarVisible(true);
    }
  };

  const handleGenerateSummary = async (eventId) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      if (!token) {
        setError('Token not found. Please log in again.');
        setSnackbarVisible(true);
        return;
      }
  
      const response = await axios.post(
        `${backend_url}/api/v1/bars/${barId}/events/${eventId}/generate_summary`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        const videoUrl = response.data.video_url; // Asegúrate de que el backend devuelva esto
        setVideoUrl(videoUrl); // Almacena la URL en el estado
        console.log("Video URL:", videoUrl); // Agregar esta línea para verificar la URL     
      } else {
        setError('Failed to generate summary.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again.');
      setSnackbarVisible(true);
    }
  };  

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginVertical: 16 }}>Events at this Bar</Text>
  
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: event }) => {
          const eventDate = new Date(event.date);
          const isEventPast = eventDate < new Date();
  
          const dropdownItems = event.attendees.map((attendee) => ({
            label: attendee.handle,
            value: attendee.handle
          }));
  
          return (
            <View style={{ marginVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16 }}>
              <Text style={{ fontSize: 18 }}>{event.name}</Text>
              <Text>{event.description}</Text>
              <Text>
                {eventDate.toLocaleDateString()} {' '}
                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
  
              <Text style={{ marginTop: 10 }}>Attendees</Text>
              <ScrollView horizontal style={{ paddingVertical: 10 }}>
                {event.attendees.length > 0 ? (
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
  
              {isEventPast ? (
                <Button title="Summary" onPress={() => handleGenerateSummary(event.id)} />
              ) : (
                <>
                  <Button title="Check In" onPress={() => handleCheckIn(event.id)} />
                  <Button title="Upload Image" onPress={() => handleUploadImage(event.id, userId)} />
                  <Button title="Select Image" onPress={handleSelectImage} />
                </>
              )}
{videoUrl && (
  <View style={{ marginTop: 20 }}>
    <Text style={{ fontSize: 20 }}>Video Ready:</Text>
    <Video
      source={{ uri: videoUrl }} // Utiliza la URL del video
      style={{ width: '100%', height: 200 }} // Ajusta el tamaño según sea necesario
      useNativeControls
      resizeMode="contain"
      isLooping
    />
    <Button title="Play Video" onPress={() => setVideoUrl(videoUrl)} />
  </View>
)}
          </View>
        );
      }}
    />
  
      <Snackbar
        visible={snackbarVisible}
        onDismiss={handleCloseSnackbar}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => {
            handleCloseSnackbar();
          },
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

export default EventBar;
