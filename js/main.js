/*global console, document, navigator, window, google, maps */
window.addEventListener('load', function () {
    'use strict';

    var map,
        direction,
        panel,
        btn = document.getElementById('travel');

    /**
     *
     * @param browserHasGeolocation
     * @param pos
     */
    function handleLocationError(browserHasGeolocation, pos) {
        var infoWindow = new google.maps.InfoWindow({map: map});

        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }

    /**
     *
     */
    function initialize() {

        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 10
        });

        new AutocompleteDirectionsHandler(map);

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

        // Try HTML5 places
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: {lat: -34.397, lng: 150.644},
            radius: 500
        }, callback);
    }

    /**
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
    }

    /**
     *
     * @param place
     */
    function createMarker(place) {
        var placeLoc = place.geometry.location,
            marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                title: "Hello World"
            });
        console.log(placeLoc);
        console.log('Je suis la ');
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(place.name);
            infoWindow.open(map, this);
        });
    }

    /**
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
        this.travelMode = 'WALKING';

        originInput = document.getElementById('from_travel');
        destinationInput = document.getElementById('end_travel');

        console.log(originInput);
        console.log(destinationInput);

        this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(map);

        originAutocomplete = new google.maps.places.Autocomplete(
            originInput, {placeIdOnly: true}
        );

        destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput, {placeIdOnly: true}
        );

        /*this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');*/

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    }

    /*AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {

    }*/

    /**
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
      if (!this.originPlaceId || !this.destinationPlaceId) {
          return false;
      }

      var self = this;

      this.directionsService.route({
          origin: {'placeId': this.originPlaceId},
          destination: {'placeId': this.destinationPlaceId},
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

    btn.addEventListener('click', function() {
        console.log('Je click');
        calculate();
    });

    initialize();
});