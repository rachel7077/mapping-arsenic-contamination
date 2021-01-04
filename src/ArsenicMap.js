import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import wind from './data/wind.json'
mapboxgl.accessToken = 'pk.eyJ1IjoiZWR3YXJkYWhheW5lcyIsImEiOiJjanB0dHdveWswNW04NDJwYm03ZmZ6NDc3In0.10VT-xDTQPGS6yZLHP-xHw';



const styles = {
  width: "100vw",
  height: "calc(100vh - 80px)",
  position: "absolute"
};

const ArsenicMap = () => {

  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-120, 50],
        zoom: 3
      });


      wind.forEach(data => {
        try {
          if (data.latitude && data.longitude) {
            var el = document.createElement('div');
            el.className = 'fas fa-industry fa-2x';

            const popup = new mapboxgl.Popup({ offset: 25  })
            .setText(data.powerPlants);

            new mapboxgl.Marker({element: el})
              .setLngLat([data.longitude, data.latitude])
              .setPopup(popup)
              .addTo(map);
          }

        } catch (err) {
          console.log(err);
          console.log(`bad data for ${data.powerPlants}; long ${data.longitude} lat ${data.latitude}`);
        }


      })

      map.on("load", () => {
        setMap(map);
        map.resize();
      });
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);

  return <div ref={el => (mapContainer.current = el)} style={styles} />;
};

export default ArsenicMap;