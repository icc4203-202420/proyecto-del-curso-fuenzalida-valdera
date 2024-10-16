import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import BeerList from './components/BeerList';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

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
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.safeArea}>
          <Appbar.Header style={styles.header}>
            {isAuthenticated && <Appbar.Content title="Pintpals" />}
          </Appbar.Header>
          <Drawer.Navigator>
            {isAuthenticated ? (
              <>
                <Drawer.Screen name="Home" component={Home} />
                <Drawer.Screen name="Map" component={Map} />
                <Drawer.Screen name="BeerList" component={BeerList} />
                <Drawer.Screen 
                  name="Logout" 
                  component={() => {
                    handleLogout();
                    return null; // Podrías redirigir a Login aquí
                  }} 
                />
              </>
            ) : (
              // Asegúrate de encapsular el Stack.Navigator en un Screen
              <Drawer.Screen name="Auth">
                {() => (
                  <Stack.Navigator>
                    <Stack.Screen name="Login">
                      {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                    <Stack.Screen name="Register">
                      {props => <Register {...props} setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                  </Stack.Navigator>
                )}
              </Drawer.Screen>
            )}
          </Drawer.Navigator>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFEB3B',
  },
  header: {
    backgroundColor: '#FFEB3B',
  },
});

export default App;