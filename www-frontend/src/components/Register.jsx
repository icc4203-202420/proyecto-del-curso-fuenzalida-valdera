import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Typography, Container, Paper } from '@mui/material'

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    handle: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
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
      const response = await axios.post('/api/v1/signup', { user: formData })
      setSuccessMessage('Welcome to pintpals')
      window.location.href = '/login'
    } catch (error) {
      setErrors(`User couldn't be created successfully. ${error.response.data.status.message}`)
    }
  }

  return (
    <Container component={Paper} maxWidth="xs" style={{ padding: '2rem', marginTop: '2rem' }}>
      <Typography variant="h5" align="center" gutterBottom>Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="First Name"
          name="first_name"
          fullWidth
          margin="normal"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Last Name"
          name="last_name"
          fullWidth
          margin="normal"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Handle"
          name="handle"
          fullWidth
          margin="normal"
          value={formData.handle}
          onChange={handleChange}
          required
        />
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
        <TextField
          label="Confirm Password"
          name="password_confirmation"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>Register</Button>
        {errors && <Typography color="error" align="center" style={{ marginTop: '1rem' }}>{errors}</Typography>}
        {successMessage && <Typography color="primary" align="center" style={{ marginTop: '1rem' }}>{successMessage}</Typography>}
      </form>
    </Container>
  )
}

export default Register