import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardActions, Typography, Button, Grid, Avatar } from '@mui/material';
import EventIcon from '@mui/icons-material/Event'; // Ícono del evento

const Events = () => {
  const { id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Datos de ejemplo para eventos
    const exampleEvents = [
      {
        id: 1,
        name: 'Summer Beer Festival',
        bar: {
          name: 'The Hoppy Pint',
          address: '123 Brew Street, Beer City'
        },
        description: 'A fun festival showcasing a variety of local craft beers with live music and food trucks.',
        date: '2024-09-15T18:00:00Z',
      }
    ];
    setEvents(exampleEvents);
  }, []);

  return (
    <div>
      <h1>Events for Bar {id}</h1>
      <Grid container spacing={3}>
        {events.length > 0 ? (
          events.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar>
                        <EventIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
                        {event.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Bar:</strong> {event.bar.name} - {event.bar.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Description:</strong> {event.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="outlined">View bar</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No events available for this bar.
          </Typography>
        )}
      </Grid>
    </div>
  );
};

export default Events;
