import React, { useEffect, useState } from 'react'
import axios from 'axios'

const BeerList = () => {
  const [beers, setBeers] = useState([]);

  useEffect(() => {
    axios.get('/api/v1/beers').then(response => setBeers(response.data)).catch(error => console.error('Error fetching beers:', error))
  }, [])

  return (
    <div>
      <h1>Beer List</h1>
      <ul>
        {beers.map(beer => (<li key={beer.id}>{beer.name}</li>))}
      </ul>
    </div>
  )
}

export default BeerList
