
/**
 * https://www.npmjs.com/package/geolib#computedestinationpointpoint-distance-bearing-radius--earthradius
 */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { computeDestinationPoint } from 'geolib';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


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

const ArsenicHeatmap = () => {

  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {


    const initializeMap = ({ setMap, mapContainer }) => {

      const point = wind[0];



      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [point.longitude, point.latitude,],
        zoom: 3
      });

      //add code between here 
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      });

      map.addControl(geocoder);
      map.addControl(new mapboxgl.NavigationControl());


      //and here


      //draws power plants
      wind.forEach(data => {
        try {
          if (data.latitude && data.longitude) {
            var el = document.createElement('div');
            el.className = 'fas fa-industry fa-2x';

            let retirement = '';
            if (data.retirement){
              retirement = `${data.retirement}`;
            }


            const popup = new mapboxgl.Popup({ offset: 25 })
              // .setText(data.powerPlants + "\n" + data.retirement); 
              .setHTML(`<div><strong>${data.powerPlants}</strong><div>${retirement}</div></div>`)

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
            68278.0285,
            data.annualDirection
          );

          const p2 = computeDestinationPoint(
            { latitude: data.latitude, longitude: data.longitude },
            68278.0285,
            data.direction
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

export default ArsenicHeatmap;