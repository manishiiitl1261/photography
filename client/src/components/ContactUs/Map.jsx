"use client";
import React, { useEffect } from "react";

const Map = () => {
    useEffect(() => {
        // Initialize Google Maps and Places Autocomplete
        const initMap = () => {
            const map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 30.5038626, lng: 77.8277151 },
                zoom: 8,
            });

            const input = document.getElementById("pac-input");
            const autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo("bounds", map);

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) {
                    console.error("No details available for the input: " + place.name);
                    return;
                }

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17); // Zoom to 17 if no viewport is available
                }

                // Place a marker on the selected location
                new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                });
            });
        };

        // Load the Google Maps script
        const googleMapsScript = document.createElement("script");
        googleMapsScript.src =
            "https://maps.gomaps.pro/maps/api/js?key=AlzaSyrffjwp16x2o8BcoDKBa8nuhF2i2tCle4k&libraries=geometry,places&callback=initMap";
        googleMapsScript.async = true;
        googleMapsScript.defer = true;

        window.initMap = initMap;
        document.head.appendChild(googleMapsScript);

        return () => {
            // Cleanup script
            document.head.removeChild(googleMapsScript);
        };
    }, []);

    return (
        <div className="flex flex-col items-center space-y-4 p-12" >

            {/* Map Container */}
            < div
                id="map"
                className=" w-full h-svh border border-gray-300 rounded-lg shadow-md"
            ></div >
        </div >
    );
};

export default Map;
