import React, { useState } from 'react'
import axios from 'axios'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { TextField, Button, Typography, Container, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

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
      navigate('/login')
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
    <Container component={Paper} maxWidth="xs" style={{ padding: '2rem', marginTop: '2rem', backgroundColor: '#fff' }}>
      <Typography variant="h5" align="center" gutterBottom>Register</Typography>
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
        {({ isSubmitting }) => (
          <Form>
            <Field
              name="first_name"
              as={TextField}
              label="First Name"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="first_name" />}
              error={Boolean(<ErrorMessage name="first_name" />)}
            />
            <Field
              name="last_name"
              as={TextField}
              label="Last Name"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="last_name" />}
              error={Boolean(<ErrorMessage name="last_name" />)}
            />
            <Field
              name="handle"
              as={TextField}
              label="Handle"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="handle" />}
              error={Boolean(<ErrorMessage name="handle" />)}
            />
            <Field
              name="email"
              as={TextField}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="email" />}
              error={Boolean(<ErrorMessage name="email" />)}
            />
            <Field
              name="password"
              as={TextField}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="password" />}
              error={Boolean(<ErrorMessage name="password" />)}
            />
            <Field
              name="password_confirmation"
              as={TextField}
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="password_confirmation" />}
              error={Boolean(<ErrorMessage name="password_confirmation" />)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              style={{ marginTop: '1rem' }}
            >
              Register
            </Button>
            {serverError && (
              <Typography color="error" align="center" style={{ marginTop: '1rem' }}>
                {serverError}
              </Typography>
            )}
            {successMessage && (
              <Typography color="primary" align="center" style={{ marginTop: '1rem' }}>
                {successMessage}
              </Typography>
            )}
            <Button variant="contained" color="primary" fullWidth style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  )
}

export default Register