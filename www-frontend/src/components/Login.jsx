import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Typography, Container, Paper } from '@mui/material'

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors('')
    setSuccessMessage('')

    try {
      const response = await axios.post('/api/v1/login', formData)
      setIsAuthenticated(true)
      setSuccessMessage('Welcome back pal!')
      window.location.href = '/'
    } catch (error) {
      setErrors('Invalid email or password')
    }
  }

  return (
    <Container component={Paper} maxWidth="xs" style={{ padding: '2rem', marginTop: '2rem' }}>
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
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
        {errors && <Typography color="error" align="center" style={{ marginTop: '1rem' }}>{errors}</Typography>}
        {successMessage && <Typography color="primary" align="center" style={{ marginTop: '1rem' }}>{successMessage}</Typography>}
      </form>
    </Container>
  )
}

export default Login