
/**
 * https://www.npmjs.com/package/geolib#computedestinationpointpoint-distance-bearing-radius--earthradius
 */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { computeDestinationPoint } from 'geolib';


import wind from './data/windv2.json'


import "mapbox-gl/dist/mapbox-gl.css";
// import circles from './data/circles.geo.json'
mapboxgl.accessToken = 'pk.eyJ1IjoiZWR3YXJkYWhheW5lcyIsImEiOiJjanB0dHdveWswNW04NDJwYm03ZmZ6NDc3In0.10VT-xDTQPGS6yZLHP-xHw';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;


const styles = {
  width: "100vw",
  height: "calc(100vh - 80px)",
  position: "absolute"
};

const HeatmapSample = () => {

  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {


    const initializeMap = ({ setMap, mapContainer }) => {

      const point = wind[0];

      //add code between here 
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [point.longitude, point.latitude,],
        zoom: 3
      });

      //and here


      //draws power plants
      wind.forEach(data => {
        try {
          if (data.latitude && data.longitude) {
            var el = document.createElement('div');
            el.className = 'fas fa-industry fa-2x';

            const popup = new mapboxgl.Popup({ offset: 25 })
              .setText(data.powerPlants);

            new mapboxgl.Marker({ element: el })
              .setLngLat([data.longitude, data.latitude])
              .setPopup(popup)
              .addTo(map);
          }

        } catch (err) {
          console.log(err);
          console.log(`bad data for ${data.powerPlants}; long ${data.longitude} lat ${data.latitude}`);
        }
      });



      map.on("load", () => {



        const features = [];

        wind.forEach(data => {
          const p1 = computeDestinationPoint(
            { latitude: data.latitude, longitude: data.longitude },
            15000,
            45
          );
  
          const p2 = computeDestinationPoint(
            { latitude: data.latitude, longitude: data.longitude },
            15000,
            135
          );
  
          const allPoints = [
            [data.longitude, data.latitude],
            [p1.longitude, p1.latitude],
            [p2.longitude, p2.latitude],
          ]


          const feature = {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [allPoints]
            }
          };

          features.push(feature);

        });

        const polysource = {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": features
          }
        };

        map.addSource("polygon", polysource);

        map.addLayer({
          "id": "polygon",
          "type": "fill",
          "source": "polygon",
          "layout": {},
          "paint": {
            "fill-color": "blue",
            "fill-opacity": 0.6
          }
        });

        setMap(map);
        map.resize();
      });


    };



    if (!map) initializeMap({ setMap, mapContainer });


  }, [map]);

  return <div ref={el => (mapContainer.current = el)} style={styles} />;
};

export default HeatmapSample;