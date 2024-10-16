import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Pintpals</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEB3B', // Puedes cambiar el color de fondo si lo deseas
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
})

export default Home