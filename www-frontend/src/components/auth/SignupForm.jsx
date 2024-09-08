import React, { useState } from 'react'
import axios from 'axios'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Please use a valid email')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords did not match, try again')
      return
    }

    try {
      const response = await axios.post('/api/v1/signup', {
        user: {
          email,
          password,
        },
      })

      setSuccess('Welcome to PintPals!')
      setError('')
    } catch (err) {
      setError('Something went wrong :/')
      setSuccess('')
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  )
}

export default Signup