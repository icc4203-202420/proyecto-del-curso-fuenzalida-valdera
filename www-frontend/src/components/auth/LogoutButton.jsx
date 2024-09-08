import axios from 'axios'
import { useHistory } from 'react-router-dom'

const Logout = () => {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await axios.delete('/api/v1/logout')
      history.push('/login')
    } catch (err) {
      console.error('Error trying to logout')
    }
  }

  return (
    <button onClick={handleLogout}>Logout</button>
  )
}

export default Logout