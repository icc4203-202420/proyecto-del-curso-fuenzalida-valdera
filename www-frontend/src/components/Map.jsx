"use client";

import React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

export default function Intro() {
  const position = { lat: 37.7749, lng: -122.4194 };

  return (
    <APIProvider apiKey="AIzaSyDPrIIA-Oy7AGgPFGXQ4nP0LOQ3TnIcI6U">
      <div style={{ height: "93vh", width: "99vw"}}>
        <Map zoom={9} center={position} style={{ height: "100%", width: "100%" }} />
      </div>
    </APIProvider>
  );
}
