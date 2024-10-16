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
import BeerReviews from './components/BeerReviews'; // Asegúrate de que la ruta sea correcta
import BeerDetail from './components/Beer/BeerDetail';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica si el usuario está autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      setIsAuthenticated(!!token); // Si hay token, el usuario está autenticado
    };
    checkAuth();
  }, []);

  // Lógica de logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken'); // Elimina el token de autenticación
    setIsAuthenticated(false); // Cambia el estado para indicar que el usuario no está autenticado
  };

  // Crear un stack separado para BeerList y BeerReviews
  const BeerStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="BeerList" component={BeerList} />
      <Stack.Screen name="BeerReviews" component={BeerReviews} />
    </Stack.Navigator>
  );

  return (
    <PaperProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <Tab.Navigator>
            <Tab.Screen name="Map" component={Map} />
            {/* Usa BeerStack para manejar la navegación entre BeerList y BeerReviews */}
            <Tab.Screen name="Beers" component={BeerStack} />
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
