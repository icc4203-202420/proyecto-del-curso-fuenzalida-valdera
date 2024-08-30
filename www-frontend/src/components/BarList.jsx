import React, { useEffect, useState } from 'react';
import { TextField, Card, CardContent, CardActions, Typography, Button, Grid } from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';

const BarList = () => {
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredBars, setFilteredBars] = useState([]);

  useEffect(() => {
    const exampleBars = [
      {
        id: 1,
        name: 'Golden Pub',
        description: '1234 Ale Street, Brewtown, BE 56789'
      },
      {
        id: 2,
        name: 'The Crafty Pint',
        description: '5678 Brew Lane, Hopsville, BE 98765'
      }
    ];
    setBars(exampleBars);
    setFilteredBars(exampleBars);
  }, []);

  useEffect(() => {
    setFilteredBars(
      bars.filter(bar => bar.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, bars]);

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
        {filteredBars.map(bar => (
          <Grid item xs={12} sm={6} md={4} key={bar.id}>
            <Card style={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  <LocalBarIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  {bar.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bar.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">Go to bar</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default BarList;
