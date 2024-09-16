"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  height: "93vh",
  width: "99vw",
};

const defaultZoom = 12;

export default function Intro() {
  const [position, setPosition] = useState(null); // Posición del usuario
  const [hasLoaded, setHasLoaded] = useState(false); // Si el mapa ha sido cargado
  const mapRef = useRef(null); // Referencia al mapa

  const fetchLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          sessionStorage.setItem("mapLoaded", "true");
          setHasLoaded(true);
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error);
          setHasLoaded(true);
        }
      );
    } else {
      console.error("Geolocalización no es soportada por este navegador.");
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("mapLoaded")) {
      fetchLocation();
    } else {
      setHasLoaded(true);
    }
  }, [fetchLocation]);

  // Centrar el mapa solo una vez cuando se monte y se tenga la posición
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (position) {
      map.panTo(position); // Centra el mapa manualmente
    }
  }, [position]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyDPrIIA-Oy7AGgPFGXQ4nP0LOQ3TnIcI6U">
      <div style={mapContainerStyle}>
        {hasLoaded ? (
          position ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={defaultZoom}
              center={position}
              onLoad={onMapLoad}
            />
          ) : (
            <div>Loading map...</div>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </LoadScript>
  );
}
