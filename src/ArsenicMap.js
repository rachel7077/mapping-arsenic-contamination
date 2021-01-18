import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import wind from './data/windv2.json'
import trees from './data/trees.geo.json'
mapboxgl.accessToken = 'pk.eyJ1IjoiZWR3YXJkYWhheW5lcyIsImEiOiJjanB0dHdveWswNW04NDJwYm03ZmZ6NDc3In0.10VT-xDTQPGS6yZLHP-xHw';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;


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

      //add code between here 
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-120, 50],
        zoom: 3
      });

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
      })


      //add code for heat map
      map.on('load', function () {
        map.addSource('trees', {
          type: 'geojson',
          data: trees
        });

        map.addLayer({
          id: 'trees-heat',
          type: 'heatmap',
          source: 'trees',
          maxzoom: 15,
          paint: {
            // increase weight as diameter breast height increases
            'heatmap-weight': {
              property: 'dbh',
              type: 'exponential',
              stops: [
                [1, 0],
                [62, 1]
              ]
            },
            // increase intensity as zoom level increases
            'heatmap-intensity': {
              stops: [
                [11, 1],
                [15, 3]
              ]
            },
            // assign color values be applied to points depending on their density
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(236,222,239,0)',
              0.2, 'rgb(208,209,230)',
              0.4, 'rgb(166,189,219)',
              0.6, 'rgb(103,169,207)',
              0.8, 'rgb(28,144,153)'
            ],
            // increase radius as zoom increases
            'heatmap-radius': {
              stops: [
                [11, 15],
                [15, 20]
              ]
            },
            // decrease opacity to transition into the circle layer
            'heatmap-opacity': {
              default: 1,
              stops: [
                [14, 1],
                [15, 0]
              ]
            },
          }
        }, 'waterway-label');
        map.addLayer({
  id: 'trees-point',
  type: 'circle',
  source: 'trees',
  minzoom: 14,
  paint: {
    // increase the radius of the circle as the zoom level and dbh value increases
    'circle-radius': {
      property: 'dbh',
      type: 'exponential',
      stops: [
        [{ zoom: 15, value: 1 }, 5],
        [{ zoom: 15, value: 62 }, 10],
        [{ zoom: 22, value: 1 }, 20],
        [{ zoom: 22, value: 62 }, 50],
      ]
    },
    'circle-color': {
      property: 'dbh',
      type: 'exponential',
      stops: [
        [0, 'rgba(236,222,239,0)'],
        [10, 'rgb(236,222,239)'],
        [20, 'rgb(208,209,230)'],
        [30, 'rgb(166,189,219)'],
        [40, 'rgb(103,169,207)'],
        [50, 'rgb(28,144,153)'],
        [60, 'rgb(1,108,89)']
      ]
    },
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    'circle-opacity': {
      stops: [
        [14, 0],
        [15, 1]
      ]
    }
  }
}, 'waterway-label');

      });
      //and here


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