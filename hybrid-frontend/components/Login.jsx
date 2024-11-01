import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { backend_url } from '@env'

const Login = ({ setIsAuthenticated, navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLoginSuccess = async (data) => {
    const token = data.status.data.token
    const userId = data.status.data.user.id

    try {
      await AsyncStorage.setItem('jwtToken', token)
      await AsyncStorage.setItem('userId', userId.toString())
      setIsAuthenticated(true)
      navigation.navigate('Map')
    } catch (e) {
      console.error('Failed to save token or userId in AsyncStorage:', e)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    try {
      const response = await fetch(`${backend_url}/api/v1/login`, {
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
        setError(errorData.message || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleSubmit} />
      <View style={styles.registerTextContainer}>
        <Text style={styles.registerText}>
          Don't have an account yet?{' '}
        </Text>
        <Text 
          onPress={() => navigation.navigate('Register')} 
          style={styles.registerButton}>
          Register
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 400,
    marginHorizontal: 'auto',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#343a40',
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
  registerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerText: {
    color: '#ffffff',
  },
  registerButton: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
})

export default Login
