import React, { useEffect, useState } from 'react'
import axios from 'axios'

const BarList = () => {
  const [bars, setBars] = useState([])

  useEffect(() => {
    axios.get('/api/v1/bars').then(response => setBars(response.data)).catch(error => console.error('Error fetching bars:', error))
  }, [])

  return (
    <div>
      <h1>Bar List</h1>
      <ul>
        {bars.map(bar => (<li key={bar.id}>{bar.name}</li>))}
      </ul>
    </div>
  )
}

export default BarList;