import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Home from './components/Home'; 
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import BeerList from './components/BeerList';
import BeerReviews from './components/BeerReviews';
import BeerDetail from './components/BeerDetail';
import ReviewForm from './components/ReviewForm';
import BarList from './components/BarList';
import BarDetail from './components/BarDetail';
import EventBar from './components/EventBar';
import UserSearch from './components/UserSearch';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error fetching token', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwtToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const BeerStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="BeerList" component={BeerList} />
      <Stack.Screen name="BeerDetail" component={BeerDetail} />
      <Stack.Screen name="BeerReviews" component={BeerReviews} />
      <Stack.Screen name="ReviewForm" component={ReviewForm} />
    </Stack.Navigator>
  );

  const BarStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="BarList" component={BarList} />
      <Stack.Screen name="BarDetail" component={BarDetail} />
      <Stack.Screen name="EventBar" component={EventBar} />
    </Stack.Navigator>
  );

  return (
    <PaperProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <Tab.Navigator>
            <Tab.Screen name="Map" component={Map} />
            <Tab.Screen 
              name="Beers" 
              component={BeerStack} 
              options={{ tabBarLabel: 'Beers', headerShown: false }}
            />
            <Tab.Screen 
              name="Bar" 
              component={BarStack} 
              options={{ tabBarLabel: 'Bars', headerShown: false }}
            />
            <Tab.Screen 
              name="UserSearch" 
              component={UserSearch} 
              options={{ tabBarLabel: 'Search Users', headerShown: false }}
            />
            <Tab.Screen 
              name="Logout" 
              options={{
                tabBarButton: (props) => (
                  <LogoutButton {...props} onLogout={handleLogout} />
                )
              }}
            >
              {() => null}
            </Tab.Screen>
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

// Botón personalizado para hacer logout desde la pestaña
const LogoutButton = ({ onLogout }) => (
  <View style={styles.logoutButton}>
    <Text onPress={onLogout} style={styles.logoutText}>Logout</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#FF5733',
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;