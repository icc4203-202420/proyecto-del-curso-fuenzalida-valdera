import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLoginSuccess = (data) => {
    const token = data.status.data.token
    sessionStorage.setItem('jwtToken', token)
    setIsAuthenticated(true)
    navigate('/map')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
            password: password
          }
        })
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
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login