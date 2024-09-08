import axios from 'axios'

export const loginUser = async (email, password) => {
  const response = await axios.post('/api/v1/login', {
    user: {
      email,
      password,
    },
  })
  localStorage.setItem('token', response.headers.authorization)
  return response.data
}

export const registerUser = async (email, password, passwordConfirmation) => {
  const response = await axios.post('/api/v1/signup', {
    user: {
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
  })
  localStorage.setItem('token', response.headers.authorization)
  return response.data
}

export const logoutUser = async () => {
  await axios.delete('/api/v1/logout', {
    headers: {
      Authorization: localStorage.getItem('token'),
    },
  })
  localStorage.removeItem('token')
}