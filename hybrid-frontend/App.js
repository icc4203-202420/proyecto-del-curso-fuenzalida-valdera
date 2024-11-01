import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text } from 'react-native';
import Home from './components/Home'; 
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import BeerList from './components/BeerList';
import BeerReviews from './components/BeerReviews';
import BeerDetail from './components/BeerDetail';
import ReviewForm from './components/ReviewForm';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componente vacío para la pantalla "Logout"
const EmptyScreen = () => <Text>Logging out...</Text>;


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

  const BeerStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="BeerList" component={BeerList} />
      <Stack.Screen name="BeerDetail" component={BeerDetail} />
      <Stack.Screen name="BeerReviews" component={BeerReviews} />
      <Stack.Screen name="ReviewForm" component={ReviewForm} />
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
              options={{
                tabBarLabel: 'Beers',
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="Logout"
              component={EmptyScreen}
              options={{
                tabBarButton: () => (
                  <Text onPress={handleLogout} style={{ color: 'red', padding: 10 }}>Logout</Text>
                ),
              }}
            />

          </Tab.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <Register {...props} setIsAuthenticated={setIsAuthenticated} />}
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
      <Text onPress={onLogout} style={styles.logoutText}>
        Logout
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
