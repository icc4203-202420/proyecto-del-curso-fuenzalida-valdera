import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Image, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { backend_url } from '@env';

const UserSearch = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [bars, setBars] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendToAdd, setFriendToAdd] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setCurrentUserId(Number(storedUserId)); // Cambiado a setCurrentUserId
        } else {
          setError('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user ID from SecureStore:', error);
        setError('Failed to retrieve User ID');
      }
    };

    fetchUserId();

    const fetchUsers = async () => {
      if (search.length > 2) {
        try {
          const response = await axios.get(`${backend_url}/api/v1/users?handle=${search}`);
          setUsers(response.data);
          setError(null);
        } catch (err) {
          setError('Failed to fetch users. Please try again.');
          console.error(err);
        }
      } else {
        setUsers([]);
      }
    };

    fetchUsers();
  }, [search]);

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/v1/bars`); // Usar backticks aquí
        setBars(response.data);
      } catch (err) {
        console.error('Failed to fetch bars:', err);
      }
    };

    fetchBars();
  }, []);

  const handleAddFriendClick = (friendId) => {
    setFriendToAdd(friendId);
    setModalVisible(true);
  };

  const handleBarSelect = async (barId) => {
    setSelectedEvent(barId);
    setModalVisible(false); // Cierra el menú después de seleccionar un bar
    await addFriend(friendToAdd, barId); // Llama a addFriend con el ID del amigo y el ID del bar
  };

  const addFriend = async (friendId, barId) => {
    const token = SecureStore.getItem('jwtToken');

    const data = {
      bar_id: barId || null,
      user: currentUserId.toString(), // ID del usuario actual
      friend_id: friendId, // ID de la persona que quieres agregar
    };

    try {
      await axios.post(
        `${backend_url}/api/v1/users/${currentUserId}/friendships`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Friend added');
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Error', 'Unauthorized. Please check your token.');
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Search User @"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          padding: 10,
          marginBottom: 16,
        }}
        onChangeText={setSearch}
        value={search}
      />

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <FlatList
        data={users}
        keyExtractor={(user) => user.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ flex: 1 }}>{item.handle}</Text>
            <Button title="Add Friend" onPress={() => handleAddFriendClick(item.id)} />
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text>Select a Bar</Text>
            {bars.map((bar) => (
              <TouchableOpacity key={bar.id} onPress={() => handleBarSelect(bar.id)} style={{ padding: 10 }}>
                <Text>{bar.name}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserSearch;