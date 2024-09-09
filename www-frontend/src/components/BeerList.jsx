import React, { useEffect, useState } from 'react'
import { TextField, Card, CardContent, CardActions, Typography, Button, Grid, Rating } from '@mui/material'
import BeerIcon from '@mui/icons-material/LocalBar'
import { Link } from 'react-router-dom'

const BeerList = () => {
  const [beers, setBeers] = useState([])
  const [search, setSearch] = useState('')
  const [filteredBeers, setFilteredBeers] = useState([])

  useEffect(() => {
    const exampleBeers = [
      {
        id: 1,
        name: 'Golden Ale',
        beer_type: 'Ale',
        style: 'Golden Ale',
        ibu: 30,
        alcohol: '5.0%',
        avg_rating: 4.0,
        description: 'A refreshing golden ale with a hint of citrus and a crisp finish.'
      }
    ]
    setBeers(exampleBeers)
    setFilteredBeers(exampleBeers)
  }, [])

  useEffect(() => {
    setFilteredBeers(
      beers.filter(beer => beer.name.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, beers])

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
                <Button size="small" variant="outlined">
                  <Link to={`/beers/${beer.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    View Reviews
                  </Link>
                </Button>
                <Button size="small" variant="outlined">
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