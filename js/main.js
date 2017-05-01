/*global console, document, navigator, window, google, maps */
window.addEventListener('load', function () {
    'use strict';

    var map,
        direction,
        panel,
        btn = document.getElementById('travel');

    function handleLocationError(browserHasGeolocation, pos) {
        var infoWindow = new google.maps.InfoWindow({map: map});

        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }

    function initialize() {

        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 10
        });

        direction = new google.maps.DirectionsRenderer({
            map: map,
            panel: panel
        });

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
            }, function () {
                handleLocationError(true, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, map.getCenter());
        }
    }

    function calculate() {
        var startTravel,
            endTravel,
            directionService;
        startTravel = document.getElementById('from_travel').value; // Le point de départ
        endTravel = document.getElementById('end_travel').value; // le point d'arrivée

        if (startTravel && endTravel) {
            var request = {
                origin: startTravel,
                destination: endTravel,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };
            directionService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
            directionService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
                }
            });
        }
    }

    btn.addEventListener('click', function() {
        console.log('Je click');
        calculate();
    });

    initialize();
});