import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material'; // Import TextField for search
import { useNavigate } from 'react-router-dom'; // Ensure useNavigate is imported

const Map = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // State for user location
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const mapRef = useRef(null);
  const markerClusterRef = useRef(null);
  const infoWindowRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation

  // Fetch bar data from the API
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

  // Add marker to the map and marker clusterer
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
          <div style="
            font-size: 14px; 
            background-color: #fff; 
            border: 2px solid #000; 
            border-radius: 5px; 
            padding: 10px; 
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);">
            <h4 style="margin: 0; color: #1D1B20;">${name}</h4>
            <p style="margin: 5px 0; color: #1D1B20;">${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}</p>
            <button 
              style="background-color: #3f51b5; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;"
              onclick="window.location.href='${window.location.origin}/bars/${id}'">
              See more
            </button>
          </div>`,
        position: location,
      });
      infoWindow.open(map, marker);
      infoWindowRef.current = infoWindow;
    });

    // Add marker to the marker clusterer
    markerClusterer.addMarker(marker);
  };

  // Initialize map and markers
  useEffect(() => {
    const initializeMap = async () => {
      setLoading(true);
      const fetchedBars = await fetchBars();
      setBars(fetchedBars);
      setFilteredBars(fetchedBars); // Initialize filtered bars with all bars
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
          center: userLocation || { lat: 0, lng: 0 }, // Default center
          zoom: 12,
        });

        const markerClusterer = new MarkerClusterer(map, [], {});
        markerClusterRef.current = markerClusterer;

        return { map, markerClusterer };
      })
      .then(({ map, markerClusterer }) => {
        loader.importLibrary('marker').then((lib) => {
          const { AdvancedMarkerElement, PinElement } = lib;

          filteredBars.forEach(({ name, latitude, longitude, id }) => {
            const position = { lat: latitude, lng: longitude };
            addMarker(position, name, id, map, markerClusterer);
          });
        });
      })
      .catch((error) => {
        console.error('Error loading Google Maps library:', error);
      });
  }, [filteredBars, userLocation]);

  // Filter bars based on search term
  const handleSearch = () => {
    const filtered = bars.filter(bar => bar.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredBars(filtered);
  };

  // Get user location and center map
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(userPos);

          // Re-center the map based on the user location
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
      <TextField
        label="Search Bars"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
        style={{ marginBottom: '16px' }}
      />
      <Button variant="contained" onClick={handleSearch}>
        Search
      </Button>
      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
    </div>
  );
};

export default Map;
