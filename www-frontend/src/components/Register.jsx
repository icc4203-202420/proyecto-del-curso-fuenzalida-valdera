import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { TextField, Button, Typography, Container, Paper } from '@mui/material'
import useAxios from 'axios-hooks'
import qs from 'qs'
import { useNavigate } from 'react-router-dom'

const initialValues = {
  first_name: '',
  last_name: '',
  handle: '',
  email: '',
  password: '',
  password_confirmation: ''
}

const validationSchema = Yup.object({
  first_name: Yup.string().required('Please insert a name'),
  last_name: Yup.string().required('Please insert a lastname'),
  handle: Yup.string().required('Please insert a handle'),
  email: Yup.string().email('Invalid email').required('Email must be used'),
  password: Yup.string().required('Password needed').min(6, 'Password must contain at least six characters'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords not matching')
    .required('Must repeat your password'),
})

const RegistrationForm = () => {
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const [{ loading }, executePost] = useAxios(
    {
      url: '/api/v1/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    { manual: true }
  )

  const handleClick = () => {
    navigate('/login')
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await executePost({
        data: qs.stringify({
          user: values
        })
      })
      setServerError('')
      navigate('/login')
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setServerError('Oops this email is already in use')
      } else {
        setServerError('Server error :c. Try again later.')
      }
      console.error('Form submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container component={Paper} maxWidth="xs" style={{ padding: '2rem', marginTop: '2rem', backgroundColor: '#fff' }}>
      <Typography variant="h5" align="center" gutterBottom>Register</Typography>
      <Formik
        initialValues={initialValues}
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
            />
            <Field
              name="last_name"
              as={TextField}
              label="Last Name"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="last_name" />}
            />
            <Field
              name="handle"
              as={TextField}
              label="Handle"
              fullWidth
              margin="normal"
              variant="outlined"
              helperText={<ErrorMessage name="handle" />}
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
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting || loading}
              style={{ marginTop: '1rem' }}
            >
              Register
            </Button>
            {serverError && (
              <Typography color="error" align="center" style={{ marginTop: '1rem' }}>
                {serverError}
              </Typography>
            )}
            <Button variant="contained" color="primary" fullWidth onClick={handleClick}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  )
}

export default RegistrationForm