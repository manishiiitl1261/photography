// components/Map.jsx
import React from 'react';

const Map = ({ lat, lng }) => {
    const mapUrl = `https://www.google.com/maps/embed/v1/view?zoom=10&center=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`;

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={mapUrl}
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default Map;
