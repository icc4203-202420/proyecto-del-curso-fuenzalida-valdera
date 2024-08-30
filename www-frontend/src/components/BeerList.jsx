import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TextField, Card, CardContent, CardActions, Typography, IconButton, Button, Grid, Rating } from '@mui/material';
import BeerIcon from '@mui/icons-material/LocalBar';

const BeerList = () => {
  const [beers, setBeers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBeers, setFilteredBeers] = useState([]);

  useEffect(() => {
    const exampleBeers = [
      {
        id: 1,
        name: 'Golden Ale',
        rating: 4,
        description: 'A refreshing golden ale with a hint of citrus and a crisp finish.'
      }
    ];
    setBeers(exampleBeers);
    setFilteredBeers(exampleBeers);
  }, []);

  useEffect(() => {
    setFilteredBeers(
      beers.filter(beer => beer.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, beers]);

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
                  value={beer.rating}
                  readOnly
                  style={{ marginBottom: '8px' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {beer.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">View Reviews</Button>
                <Button size="small" variant="outlined">Add Review</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default BeerList;
