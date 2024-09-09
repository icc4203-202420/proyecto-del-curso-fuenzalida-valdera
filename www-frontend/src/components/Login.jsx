import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Typography, Container, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/register')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    if (!validateForm()) {
      return
    }

    try {
      const response = await axios.post('http://localhost:3001/api/v1/login', formData)
      setIsAuthenticated(true)
      setSuccessMessage('Welcome back!')
      navigate('/')
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ apiError: error.response.data.message || 'Invalid email or password' })
      } else {
        setErrors({ apiError: 'Something went wrong. Please try again later.' })
      }
      console.error('Login error:', error)
    }
  }

  return (
    <Container component={Paper} maxWidth="xs" style={{ padding: '2rem', marginTop: '2rem', backgroundColor: '#fff' }}>
      <Typography variant="h5" align="center" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '1rem' }}>Login</Button>
        {errors.apiError && <Typography color="error" align="center" style={{ marginTop: '1rem' }}>{errors.apiError}</Typography>}
        {successMessage && <Typography color="primary" align="center" style={{ marginTop: '1rem' }}>{successMessage}</Typography>}
        <Button variant="contained" color="primary" fullWidth style={{ marginTop: '1rem' }} onClick={handleClick}>
          Register
        </Button>
      </form>
    </Container>
  )
}

export default Login
