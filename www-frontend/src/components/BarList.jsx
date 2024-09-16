import React, { useEffect, useState } from 'react'
import { TextField, Card, CardContent, CardActions, Typography, Button, Grid, CircularProgress } from '@mui/material'
import axios from 'axios'
import { Link } from 'react-router-dom'

const BarList = () => {
  const [bars, setBars] = useState([])
  const [search, setSearch] = useState('')
  const [filteredBars, setFilteredBars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/bars')
        if (Array.isArray(response.data)) {
          setBars(response.data)
          setFilteredBars(response.data)
        } else {
          setError('Unexpected data format')
        }
      } catch (err) {
        console.error('Failed to load bars:', err)
        setError('Failed to load Bars')
      } finally {
        setLoading(false)
      }
    }

    fetchBars()
  }, [])

  useEffect(() => {
    if (Array.isArray(bars)) {
      setFilteredBars(
        bars.filter(bar => bar.name.toLowerCase().includes(search.toLowerCase()))
      )
    }
  }, [search, bars])

  if (loading) return <CircularProgress />
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <div>
      <h1>Bar List</h1>
      <TextField
        label="Search Bars"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        style={{ marginBottom: '16px' }}
        sx={{ backgroundColor: 'white' }}
      />
      <Grid container spacing={3}>
        {filteredBars.length > 0 ? (
          filteredBars.map(bar => (
            <Grid item xs={12} sm={6} md={4} key={bar.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{bar.name}</Typography>
                  <Typography color="textSecondary">
                    {bar.address.line1}, {bar.address.line2}, {bar.address.city}, {bar.address.country.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" style={{ marginTop: '8px' }}>
                    <Link to={`/bars/${bar.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      See Details
                    </Link>
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No bars found</Typography>
        )}
      </Grid>
    </div>
  )
}

export default BarList