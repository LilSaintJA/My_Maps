/*global console, document, navigator, window, google, maps */
window.addEventListener('load', function () {
    'use strict';

    var map,
        latLng,
        marker,
        direction,
        btn = document.getElementById('travel'),
        infoWindow = new google.maps.InfoWindow({map: map});

    /**
     * Permet de récupérer la position de l'utilisateur
     *
     * @param position
     */
    function getMyPosition(position) {

        var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        latLng = new google.maps.LatLng(pos);

        // Ajout d'un marqueur à la position trouvée
        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: 'img/Place_Optimization_copie.png'
        });

        // Permet de centrer la carte sur la position latlng
        map.setCenter(latLng);
    }

    /**
     * Initialise les places impoortantes
     * dans un rayon de 5000km
     *
     */
    function monumentPlaces() {
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: latLng,
            radius: 5000,
            type: ['museum']
        }, callback);
    }

    /**
     * Fonction de rappel, pour l'appel asynchrone
     *
     * @param results
     * @param status
     */
    function callback(results, status) {
        var i;

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (i = 0; i < results.length; i += 1) {
                createMarker(results[i]);
            }
        }

        // Créé un marqueur au click sur la carte
        google.maps.event.addListener(map, 'click', function (event) {
            new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng())
            });
        });
    }

    /**
     * Créé un marqueur pour les emplacements
     * spécifiés dans monumentsPlaces()
     *
     * @param place
     */
    function createMarker(place) {
        var placeLoc = place.geometry.location,
            marker = new google.maps.Marker({
                map: map,
                position: placeLoc
            });

        // Affiche des informations sur le marqueur cliquer
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(place.name);
            infoWindow.open(map, this);
        });
    }

    /**
     * Gère l'autocompletion des inputs
     *
     * @param map
     * @constructor
     */
    function AutocompleteDirectionsHandler(map) {
        var originInput,
            destinationInput,
            originAutocomplete,
            destinationAutocomplete;

        this.map = map;
        this.originPlaceId = null;
        this.destinationPlaceId = null;
        this.travelMode = 'DRIVING';

        originInput = document.getElementById('from_travel');
        destinationInput = document.getElementById('end_travel');

        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer();
        this.directionsDisplay.setMap(map);
        this.directionsDisplay.setPanel(document.getElementById("map-panel"));

        originAutocomplete = new google.maps.places.Autocomplete(
            originInput, {placeIdOnly: true}
        );

        destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput, {placeIdOnly: true}
        );

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
    }

    /**
     * Initialise les
     *
     * @param autocomplete
     * @param mode
     */
    AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
        var self = this;

        autocomplete.bindTo('bounds', this.map);

        autocomplete.addListener('place_changed', function () {
            var place = autocomplete.getPlace();

            if (!place.place_id) {
                window.alert('Please select an option from the dropdown list');
                return false;
            }

            if (mode === 'ORIG') {
                console.log(self.originPlaceId = place.place_id);
                self.originPlaceId = place.place_id;
            } else {
                self.destinationPlaceId = place.place_id;
            }
            self.route();
        });
    };

    /**
     *
     * @returns {boolean}
     */
    AutocompleteDirectionsHandler.prototype.route = function () {
        var self = this;
        latLng = new google.maps.LatLng(48.866667, 2.333333);

        var values = [latLng],
            waypts = [],
            i;
        console.log(values[0]);

        for (i = 0; i < values.length; i += 1) {
            console.log(values[i]);
            waypts.push({
                location: values[i],
                stopover: true
            });
        }
        console.log(waypts);

        if (!this.originPlaceId || !this.destinationPlaceId) {
            return false;
        }

        this.directionsService.route({
            origin: {'placeId': this.originPlaceId},
            destination: {'placeId': this.destinationPlaceId},
            waypoints: waypts,
            optimizeWaypoints: false,
            travelMode: this.travelMode
        }, function (response, status) {
            if (status === 'OK') {
                self.directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    };

    /**
     * Calcule de l'itinéraire
     *
     */
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

    /**
     * Initialisation de la map
     * Appel des fonctions secondaires
     */
    function initMap() {
        latLng = new google.maps.LatLng(48.866667, 2.333333);

        // Construction de la map
        map = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            zoom: 10,
            maxZoom: 20,
            fullscreenControl: true
        });

        // Try HTML geolocalisation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getMyPosition);
        } else {
            alert('Votre navigateur ne supporte pas la géolocation');
        }

        // Try HTML5 places
        // monumentPlaces();

        // Autocomplete
        new AutocompleteDirectionsHandler(map);

        direction = new google.maps.DirectionsRenderer({
            map: map,
            panel: panel
        });

        calculate();
    }

    btn.addEventListener('click', function() {
        console.log('Je click');
        calculate();
    });

    initMap();
});