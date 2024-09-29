import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { TextField, Card, CardContent, CardActions, Typography, Button, Grid, Rating, CircularProgress } from '@mui/material'
import BeerIcon from '@mui/icons-material/LocalBar'
import { Link } from 'react-router-dom'

const BeerList = () => {
  const [beers, setBeers] = useState([])
  const [search, setSearch] = useState('')
  const [filteredBeers, setFilteredBeers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/beers')
        setBeers(response.data.beers)
        setFilteredBeers(response.data.beers)
      } catch (err) {
        setError('Failed to load beers')
      } finally {
        setLoading(false)
      }
    }

    fetchBeers()
  }, [])

  useEffect(() => {
    setFilteredBeers(
      beers.filter(beer => beer.name.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, beers])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  if (!Array.isArray(filteredBeers)) {
    return <Typography color="error">Unexpected data format</Typography>
  }

  return (
    <div>
      <h1>Beer List</h1>
      <TextField
        label="Search Beers"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        style={{ marginBottom: '16px' }}
        sx={{ backgroundColor: 'white' }}
      />
      <Grid container spacing={3}>
        {filteredBeers.map(beer => (
          <Grid item xs={12} sm={6} md={4} key={beer.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  <BeerIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  {beer.name}
                </Typography>
                <Rating
                  name="read-only"
                  value={beer.avg_rating}
                  readOnly
                  style={{ marginBottom: '8px' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {beer.description}
                </Typography>
              </CardContent>
              <CardActions style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Button size="small" variant="outlined" style={{ marginTop: '8px' }}>
                  <Link to={`/beers/${beer.id}/reviews`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    View Reviews
                  </Link>
                </Button>
                <Button size="small" variant="outlined" style={{ marginTop: '8px' }}>
                  <Link to={`/beers/${beer.id}/add-review`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    Add Review
                  </Link>
                </Button>
                <Button size="small" variant="contained" style={{ marginTop: '8px' }}>
                  <Link to={`/beers/${beer.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    See Details
                  </Link>
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

export default BeerList