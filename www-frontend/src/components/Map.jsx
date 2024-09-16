import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Función para calcular la distancia entre dos puntos geográficos
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

const Map = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultPosition, setSearchResultPosition] = useState(null);
  const mapRef = useRef(null);
  const markerClusterRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const navigate = useNavigate();

  const fetchBars = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/v1/bars');
      return response.data;
    } catch (error) {
      console.error('Error fetching bars:', error);
      setError('Error fetching bars');
      return [];
    }
  };

  const addMarker = (location, name, id, map, markerClusterer) => {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });

    marker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-size: 14px; background-color: #fff; border: 2px solid #000; border-radius: 5px; padding: 10px;">
            <h4 style="margin: 0; color: #1D1B20;">${name}</h4>
            <p style="margin: 5px 0; color: #1D1B20;">${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}</p>
            <button id="info-window-button-${id}" 
              style="background-color: #3f51b5; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              See more
            </button>
          </div>`,
        position: location,
      });
      infoWindow.open(map, marker);
      infoWindowRef.current = infoWindow;

      google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        const button = document.getElementById(`info-window-button-${id}`);
        if (button) {
          button.addEventListener('click', () => {
            navigate(`/bars/${id}`);
          });
        }
      });
    });

    markerClusterer.addMarker(marker);
    markersRef.current.push(marker);
  };

  useEffect(() => {
    const initializeMap = async () => {
      setLoading(true);
      const fetchedBars = await fetchBars();
      setBars(fetchedBars);
      setFilteredBars(fetchedBars);
      setLoading(false);
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
      version: 'weekly',
    });

    loader
      .importLibrary('maps')
      .then((lib) => {
        const { Map } = lib;
        const map = new Map(mapRef.current, {
          center: userLocation || { lat: 0, lng: 0 },
          zoom: 12,
        });

        const markerClusterer = new MarkerClusterer(map, [], {});
        markerClusterRef.current = markerClusterer;

        return { map, markerClusterer };
      })
      .then(({ map, markerClusterer }) => {
        filteredBars.forEach(({ name, latitude, longitude, id }) => {
          const position = { lat: latitude, lng: longitude };
          addMarker(position, name, id, map, markerClusterer);
        });

        if (searchResultPosition) {
          map.setCenter(searchResultPosition);
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps library:', error);
      });
  }, [filteredBars, userLocation, searchResultPosition]);

  const handleSearch = () => {
    const filtered = bars.filter(bar => {
      const nameMatch = bar.name.toLowerCase().includes(searchTerm.toLowerCase());
      const addressMatch = bar.address.line1.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bar.address.line2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bar.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bar.address.country.name.toLowerCase().includes(searchTerm.toLowerCase());

      return nameMatch || addressMatch;
    });

    setFilteredBars(filtered);

    if (userLocation && filtered.length > 0) {
      // Encuentra el bar más cercano a la ubicación del usuario
      const closestBar = filtered.reduce((closest, bar) => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, bar.latitude, bar.longitude);
        if (distance < closest.distance) {
          return { ...bar, distance };
        }
        return closest;
      }, { distance: Infinity });

      const closestPosition = { lat: closestBar.latitude, lng: closestBar.longitude };
      setSearchResultPosition(closestPosition);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(userPos);

          if (mapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
              center: userPos,
              zoom: 12,
            });
            markerClusterRef.current.setMap(map);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', marginTop: '16px' }}>
        <TextField
          label="Search Bars"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          style={{ backgroundColor: 'white', marginRight: '8px' }} // Set background color and margin for spacing
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </div>
      <div ref={mapRef} style={{ width: '98vw', height: '78vh' }} />
    </div>
  );
};

export default Map;
