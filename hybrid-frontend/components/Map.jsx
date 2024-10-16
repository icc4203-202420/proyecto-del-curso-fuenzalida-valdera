import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import axios from 'axios'
import { Input, Button } from 'react-native-elements'

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distancia en kilómetros
}

const Map = ({ navigation }) => {
  const [bars, setBars] = useState([])
  const [filteredBars, setFilteredBars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResultPosition, setSearchResultPosition] = useState(null)
  const mapRef = useRef(null)

  const fetchBars = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/v1/bars')
      return response.data
    } catch (error) {
      console.error('Error fetching bars:', error)
      setError('Error fetching bars')
      return []
    }
  }

  useEffect(() => {
    const initializeMap = async () => {
      setLoading(true)
      const fetchedBars = await fetchBars()
      setBars(fetchedBars)
      setFilteredBars(fetchedBars)
      setLoading(false)
    }

    initializeMap()
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setUserLocation(userPos)
        },
        (error) => {
          console.error('Error getting user location:', error)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }, [])

  const handleSearch = () => {
    const filtered = bars.filter((bar) => {
      const nameMatch = bar.name.toLowerCase().includes(searchTerm.toLowerCase())
      const addressMatch =
        bar.address.line1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bar.address.line2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bar.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bar.address.country.name.toLowerCase().includes(searchTerm.toLowerCase())

      return nameMatch || addressMatch
    })

    setFilteredBars(filtered)

    if (userLocation && filtered.length > 0) {
      const closestBar = filtered.reduce((closest, bar) => {
        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, bar.latitude, bar.longitude)
        if (distance < closest.distance) {
          return { ...bar, distance }
        }
        return closest
      }, { distance: Infinity })

      const closestPosition = { latitude: closestBar.latitude, longitude: closestBar.longitude }
      setSearchResultPosition(closestPosition)
    }
  }

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />
  if (error) return <Text>{error}</Text>

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search Bars"
          onChangeText={setSearchTerm}
          value={searchTerm}
          containerStyle={styles.input}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
      {userLocation && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {filteredBars.map(({ name, latitude, longitude, id }) => (
            <Marker
              key={id}
              coordinate={{ latitude, longitude }}
              title={name}
              description={`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`}
              onPress={() => navigation.navigate('BarDetails', { id })}
            />
          ))}
          {searchResultPosition && (
            <Marker
              coordinate={searchResultPosition}
              pinColor="blue" // Color para la marca de resultado de búsqueda
            />
          )}
        </MapView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  map: {
    flex: 1,
  },
})

export default Map