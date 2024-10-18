import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import * as Yup from 'yup'
import { Formik } from 'formik'
import axios from 'axios'

const Register = ({ navigation }) => {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validationSchema = Yup.object({
    first_name: Yup.string().required('Please insert a first name'),
    last_name: Yup.string().required('Please insert a last name'),
    handle: Yup.string().required('Please insert a handle'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must contain at least six characters'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  })

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post('http://localhost:3001/api/v1/signup', {
        user: values
      })
      setSuccessMessage('Welcome to PintPals! Please log in.')
      setServerError('')
      navigation.navigate('Login')
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setServerError('Oops! This email is already in use.')
      } else {
        setServerError('Server error. Please try again later.')
      }
      console.error('Form submit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          handle: '',
          email: '',
          password: '',
          password_confirmation: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              onChangeText={handleChange('first_name')}
              onBlur={handleBlur('first_name')}
              value={values.first_name}
            />
            {touched.first_name && errors.first_name && (
              <Text style={styles.errorText}>{errors.first_name}</Text>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              onChangeText={handleChange('last_name')}
              onBlur={handleBlur('last_name')}
              value={values.last_name}
            />
            {touched.last_name && errors.last_name && (
              <Text style={styles.errorText}>{errors.last_name}</Text>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Handle"
              onChangeText={handleChange('handle')}
              onBlur={handleBlur('handle')}
              value={values.handle}
            />
            {touched.handle && errors.handle && (
              <Text style={styles.errorText}>{errors.handle}</Text>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              onChangeText={handleChange('password_confirmation')}
              onBlur={handleBlur('password_confirmation')}
              value={values.password_confirmation}
            />
            {touched.password_confirmation && errors.password_confirmation && (
              <Text style={styles.errorText}>{errors.password_confirmation}</Text>
            )}
            
            <Button title="Register" onPress={handleSubmit} />
            {serverError ? (
              <Text style={styles.errorText}>{serverError}</Text>
            ) : successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}
            
            <Button title="Login" onPress={() => navigation.navigate('Login')} />
          </>
        )}
      </Formik>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginVertical: 10,
    textAlign: 'center',
  },
})

export default Register