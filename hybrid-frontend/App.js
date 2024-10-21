import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'; // Add ActivityIndicator here
import Home from './components/Home'; 
import Login from './components/Login';
import Register from './components/Register';
import Map from './components/Map';
import BeerList from './components/BeerList';
import BeerReviews from './components/BeerReviews';
import BeerDetail from './components/BeerDetail';
import ReviewForm from './components/ReviewForm';
import BarList from './components/BarList';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        setIsAuthenticated(!!token);  // Si no hay token, isAuthenticated será false
      } catch (error) {
        console.error('Error fetching token', error);
        setIsAuthenticated(false);  // Si ocurre algún error, desautentica
      } finally {
        setLoading(false);  // Termina la verificación, sea cual sea el resultado
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwtToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    // Muestra un indicador de carga mientras se verifica el token
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <Tab.Navigator>
            <Tab.Screen name="Map" component={Map} />
            {/* Usa BeerStack para manejar la navegación entre BeerList y BeerReviews */}
            <Tab.Screen name="Beers" component={BeerStack} 
            options={{
              tabBarLabel: 'Beers',
              headerShown: false,
            }}
            />
            <Tab.Screen name="Bar" component={BarList} />
            <Tab.Screen 
              name="Logout" 
              component={() => null} // No necesitamos renderizar nada en esta pantalla
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

// Botón personalizado para hacer logout desde la pestaña
const LogoutButton = ({ onLogout }) => {
  return (
    <View style={styles.logoutButton}>
      <Text onPress={onLogout} style={styles.logoutText}>Logout</Text>
    </View>
  );
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
