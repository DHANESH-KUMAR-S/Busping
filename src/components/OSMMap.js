import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import WebMap from './WebMap';

// Leaflet + OpenStreetMap rendered inside a WebView so it works in Expo Go without API keys
const OSMMap = ({ region, userLocation, busLocation, pinLocation = null, autoFit = false, style, onMapTap }) => {
  const webRef = useRef(null);

  // Compute the initial center once: prefer student's saved pin, then region, else default
  const initialStateRef = useRef(null);
  if (!initialStateRef.current) {
    const baseLat = (pinLocation && typeof pinLocation.latitude === 'number')
      ? pinLocation.latitude
      : (region?.latitude ?? 37.78825);
    const baseLon = (pinLocation && typeof pinLocation.longitude === 'number')
      ? pinLocation.longitude
      : (region?.longitude ?? -122.4324);
    const zoom = region?.latitudeDelta ? Math.max(4, 16 - Math.log2(region.latitudeDelta / 0.01)) : 14;
    initialStateRef.current = { lat: baseLat, lon: baseLon, zoom };
  }

  const [mapReady, setMapReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 10000); // wait longer for CDN
    return () => clearTimeout(t);
  }, []);

  const html = useMemo(() => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" onerror="" />
        
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .leaflet-container { background: #f0f0f0; }
          .bus-pin {
            width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
            font-size: 20px; line-height: 28px; border-radius: 50%;
            background: #1976d2; color: #fff; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          }
          </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function loadScript(urls, cb){
            let i=0; function next(){
              if(i>=urls.length){ cb(new Error('All Leaflet CDNs failed')); return; }
              var s=document.createElement('script'); s.src=urls[i++]; s.onload=function(){cb(null)}; s.onerror=next; document.head.appendChild(s);
            } next();
          }

          const initial = ${JSON.stringify(initialStateRef.current)};
          const initialBus = null;
          const initialUser = null;
          function init(){
            try{
              var map = L.map('map').setView([initial.lat, initial.lon], initial.zoom);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);

              const busIcon = L.divIcon({
                html: '<div class="bus-pin">🚌</div>',
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });
              const userIcon = L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
                iconSize: [28, 28],
                iconAnchor: [14, 28],
              });

              let busMarker = null;
              let userMarker = null;
              let didFit = false;
              let routeLine = null;
              let lastRouteKey = '';
              let pinMarker = null;

              function setBus(lat, lon) {
                if (busMarker) { busMarker.setLatLng([lat, lon]); }
                else { busMarker = L.marker([lat, lon], { icon: busIcon, title: 'Bus Location' }).addTo(map); }
              }
              function setUser(lat, lon) {
                if (userMarker) { userMarker.setLatLng([lat, lon]); }
                else { userMarker = L.marker([lat, lon], { icon: userIcon, title: 'Your Location' }).addTo(map); }
              }
              function fitBoundsIfBoth() {
                if (busMarker && userMarker) {
                  const group = L.featureGroup([busMarker, userMarker]);
                  map.fitBounds(group.getBounds().pad(0.25));
                  didFit = true;
                }
              }

              async function updateRoute(bus, pin) {
                if (!bus || !pin) return;
                try {
                  const key = bus.latitude.toFixed(5) + ',' + bus.longitude.toFixed(5) + '->' + pin.latitude.toFixed(5) + ',' + pin.longitude.toFixed(5);
                  if (key === lastRouteKey) return;
                  lastRouteKey = key;
                  const url = 'https://router.project-osrm.org/route/v1/driving/' + bus.longitude + ',' + bus.latitude + ';' + pin.longitude + ',' + pin.latitude + '?overview=full&geometries=geojson';
                  const res = await fetch(url);
                  const json = await res.json();
                  var coords = null;
                  if (json && json.routes && json.routes.length > 0 && json.routes[0].geometry && json.routes[0].geometry.coordinates) {
                    coords = json.routes[0].geometry.coordinates;
                  }
                  if (!coords) return;
                  const latlngs = coords.map(([lng, lat]) => [lat, lng]);
                  if (routeLine) { routeLine.setLatLngs(latlngs); }
                  else { routeLine = L.polyline(latlngs, { color: '#1976d2', weight: 5, opacity: 0.85 }).addTo(map); }
                } catch (_) { /* ignore routing errors */ }
              }

              // Signal ready
              try { if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' })); } } catch(_) {}

              // Optional: report taps to RN
              try {
                map.on('click', function(e){
                  if (!window.ReactNativeWebView) return;
                  const p = { type: 'tap', latitude: e.latlng.lat, longitude: e.latlng.lng };
                  window.ReactNativeWebView.postMessage(JSON.stringify(p));
                });
              } catch(_) {}

              // Expose a global function for RN to call via injectJavaScript
              window.__updateFromRN = function(payload) {
                try {
                  var data = payload || {};
                  if (data.bus && typeof data.bus.latitude === 'number' && typeof data.bus.longitude === 'number') {
                    setBus(data.bus.latitude, data.bus.longitude);
                  }
                  if (data.user && typeof data.user.latitude === 'number' && typeof data.user.longitude === 'number') {
                    setUser(data.user.latitude, data.user.longitude);
                  }
                  if (data.pin && typeof data.pin.latitude === 'number' && typeof data.pin.longitude === 'number') {
                    if (pinMarker) { pinMarker.setLatLng([data.pin.latitude, data.pin.longitude]); }
                    else { pinMarker = L.marker([data.pin.latitude, data.pin.longitude]).addTo(map); }
                  }
                  // draw/update route line if both bus and pin exist
                  if (data.bus && data.pin) { updateRoute(data.bus, data.pin); }
                  if (data.fit && !didFit) fitBoundsIfBoth();
                } catch (e) { /* ignore */ }
              }
            } catch(err){
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: String(err) }));
              }
            }
          }

          loadScript([
            'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          ], function(e){ if(e){ if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Leaflet failed to load' })); } } else { init(); } });
        </script>
      </body>
    </html>
  `, []);

  useEffect(() => {
    // Send updates to the WebView by invoking the exposed function
    const payload = {
      bus: busLocation || null,
      user: userLocation || null,
      fit: Boolean(autoFit),
    };
    if (pinLocation) payload.pin = pinLocation;
    if (webRef.current && payload) {
      const escaped = JSON.stringify(payload).replace(/\\/g, '\\\\').replace(/`/g, '\\`');
      const js = `window.__updateFromRN && window.__updateFromRN(${escaped}); true;`;
      try {
        webRef.current.injectJavaScript(js);
      } catch (_) { /* ignore */ }
    }
  }, [busLocation?.latitude, busLocation?.longitude, userLocation?.latitude, userLocation?.longitude, pinLocation?.latitude, pinLocation?.longitude]);

  if (Platform.OS === 'web' || (timedOut && !mapReady)) {
    // Web already has WebMap placeholder; keep behavior the same
    return <WebMap region={region} style={style} />;
  }

  return (
    <WebView
      ref={webRef}
      style={[{ flex: 1 }, style]}
      originWhitelist={["*"]}
      source={{ html }}
      domStorageEnabled
      allowFileAccess
      allowUniversalAccessFromFileURLs
      mixedContentMode="always"
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data || '{}');
          if (data.type === 'ready') {
            setMapReady(true);
            return;
          }
          if (data.type === 'error') {
            // Keep WebView, but allow outer timeout to fallback if not ready
            return;
          }
          if (data.type === 'tap' && typeof onMapTap === 'function') {
            onMapTap({ latitude: data.latitude, longitude: data.longitude });
            return;
          }
        } catch (_) { /* ignore */ }
      }}
    />
  );
}

export default OSMMap;
