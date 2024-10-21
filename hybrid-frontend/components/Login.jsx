import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import * as SecureStore from 'expo-secure-store';

const Login = ({ setIsAuthenticated, navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLoginSuccess = (data) => {
    const token = data.status.data.token
    const userId = data.status.data.user.id; // ObtÃ©n el ID del usuario de la respuesta
    SecureStore.setItemAsync('jwtToken', token); // Almacena el token en sessionStorage
    SecureStore.setItemAsync('userId', userId) // Almacena el ID del usuario en sessionStorage
    setIsAuthenticated(true)
    navigation.navigate('Map') // Redirige al mapa tras login exitoso
  }

  const handleSubmit = async () => {
    setError(null)

    try {
      const response = await fetch('http://localhost:3001/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: email,
            password: password,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        handleLoginSuccess(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed') // Manejo de error
      }
    } catch (error) {
      setError('An error occurred. Please try again.') // Error en caso de fallo de red
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error && <Text style={styles.error}>{error}</Text>} {/* Muestra error si existe */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
        required
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        required
      />
      <Button title="Login" onPress={handleSubmit} />
      <Text style={styles.registerText}>
        Don't have an account yet? 
        <Text 
          onPress={() => navigation.navigate('Register')} 
          style={styles.registerButton}>
          Register
        </Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#343a40',
    color: '#ffffff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
    color: '#ffffff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#495057',
    color: '#ffffff',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#ffffff',
  },
  registerButton: {
    marginLeft: 5,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
})

export default Login