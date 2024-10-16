import React, { useState, useEffect } from 'react'
import 'react-native-gesture-handler'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { Appbar } from 'react-native-paper'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Map from './components/Map'
import BeerList from './components/BeerList'

const Stack = createStackNavigator()

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwtToken')
      setIsAuthenticated(!!token)
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken')
    setIsAuthenticated(false)
  }

  const DrawerContent = ({ navigation }) => (
    <View style={styles.drawer}>
      <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('Map')}>
        <Text style={styles.drawerText}>Home/Map</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('BeerList')}>
        <Text style={styles.drawerText}>Beers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem} onPress={() => { handleLogout(); navigation.navigate('Login') }}>
        <Text style={styles.drawerText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <Appbar.Header style={styles.header}>
          {isAuthenticated && (
            <>
              <Appbar.Action icon="menu" onPress={() => setDrawerOpen(true)} />
              <Appbar.Content title="Pintpals" />
            </>
          )}
        </Appbar.Header>
        <Drawer.Section>
          {drawerOpen && <DrawerContent navigation={useNavigation()} />}
        </Drawer.Section>
        <Stack.Navigator>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Map" component={Map} />
              <Stack.Screen name="BeerList" component={BeerList} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login">
                {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {props => <Register {...props} setIsAuthenticated={setIsAuthenticated} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFEB3B',
  },
  header: {
    backgroundColor: '#FFEB3B',
  },
  drawer: {
    flex: 1,
    backgroundColor: '#FFEB3B',
    padding: 20,
  },
  drawerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  drawerText: {
    fontSize: 18,
    color: 'black',
  },
})

export default App