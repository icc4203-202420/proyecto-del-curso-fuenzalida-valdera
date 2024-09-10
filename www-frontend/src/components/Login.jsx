import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { TextField, Button, Typography, Container, Paper } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
})

const initialValues = {
  email: '',
  password: '',
}

const Login = () => {
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post('http://localhost:3001/api/v1/login', {
        user: values
      })
      
      if (response.status === 200) {
        const receivedToken = response.data.token
        sessionStorage.setItem('jwtToken', receivedToken)
        setServerError('')
        setIsAuthenticated(true)
        
        // Verificar si el token se guarda correctamente
        const storedToken = sessionStorage.getItem('jwtToken')
        if (storedToken) {
          navigate('/map')
        } else {
          console.error('Token not stored in sessionStorage')
        }
      }
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setServerError('Incorrect password or email')
      } else {
        setServerError('Server error. Please try again later.')
      }
      console.error('Form submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container component={Paper} maxWidth="xs" style={{ padding: '2rem', marginTop: '2rem', backgroundColor: '#fff' }}>
      <Typography variant="h5" align="center" gutterBottom>Login</Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              style={{ marginTop: '1rem' }}
            >
              {isSubmitting ? 'Loading...' : 'Login'}
            </Button>
            {serverError && (
              <Typography color="error" align="center" style={{ marginTop: '1rem' }}>
                {serverError}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  )
}

export default Login