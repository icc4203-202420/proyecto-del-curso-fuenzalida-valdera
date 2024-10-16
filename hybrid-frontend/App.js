import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text } from 'react-native';
import Home from './components/Home'; // Asegúrate de que Home se refiere a la pantalla que quieres
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import BeerList from './components/BeerList';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
  };

  return (
    <PaperProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <Tab.Navigator>
            <Tab.Screen name="Map" component={Map} />
            <Tab.Screen name="BeerList" component={BeerList} />
            <Tab.Screen 
              name="Logout" 
              component={LogoutScreen} 
              options={{
                tabBarButton: (props) => (
                  <LogoutButton {...props} onLogout={handleLogout} />
                )
              }}
            />
          </Tab.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Login">
              {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {props => <Register {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
};

const LogoutButton = ({ onLogout }) => {
  return (
    <View style={styles.logoutButton}>
      <Text onPress={onLogout} style={styles.logoutText}>Logout</Text>
    </View>
  );
};

const LogoutScreen = () => {
  return null; // No renderiza nada
};

const styles = StyleSheet.create({
  logoutButton: {
    padding: 10,
    backgroundColor: '#FF5733', // Cambia el color según tu preferencia
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;