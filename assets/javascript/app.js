
var map, infoWindow, myLatLng, myCity, geocoder;
var markers = [];
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 12
    });
    geocoder = new google.maps.Geocoder;
    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log(position);
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            myLatLng = pos;

            // infoWindow.setPosition(pos);
            // infoWindow.setContent('Location found.');
            // infoWindow.open(map);
            //change this to reverse geocoded location for manual input field locations
            map.setCenter(pos);

            myCity = findCity(geocoder, myLatLng);

        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    function findCity(geocoder, position) {
        console.log(position);
        geocoder.geocode({ 'location': position }, function (results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    //infowindow.setContent(results[0].formatted_address);
                    //infowindow.open(map, marker);
                    console.log(results);
                    //loop through results, check type for "locality", return it
                    for (var i = 0; i < results[0].address_components.length; i++) {
                        if (results[0].address_components[i].types[0] === "locality") {
                            var city = results[0].address_components[i].short_name;
                        }
                        if (results[0].address_components[i].types[0] === "administrative_area_level_1") {
                            var state = results[0].address_components[i].short_name;
                        }
                    }
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
            console.log(city + ", " + state)
            $("#currentLocationBtn").on("click", function (evt) {
                console.log("click");
                $("#location-input").val(city + ", " + state);
            });
            return city + ", " + state;
        });
    }

}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}
// Initialize Firebase
// var config = {
//     apiKey: "AIzaSyAxB1QrnVyWKjDfWvck3AdlbuLwrcy-fGI",
//     authDomain: "beerhunter-3f306.firebaseapp.com",
//     databaseURL: "https://beerhunter-3f306.firebaseio.com",
//     projectId: "beerhunter-3f306",
//     storageBucket: "beerhunter-3f306.appspot.com",
//     messagingSenderId: "494172587100"
// };
// firebase.initializeApp(config);

// API call URL format vvv
// https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET

var clientID = "10D59DD4FF07B414B2EBE33E1845EEDE0F4637DF";
var clientSecret = "18DD8FCA36FB7B4BCD6D311586718A663D15EFB3";

var untappdEndpoint = "https://api.untappd.com/v4/";

var venueInfoMethod = "venue/info/";
var beerSearchMethod = "search/beer/";

//var venueID = "1222"; //default Untappd HQ
//var beerID = "172056";
//var searchString = "revolver blood and honey";

var barSearchResult = {
    bars: [],
};

var inputs = 1;

//var venueDemoURL = untappdEndpoint + venueInfoMethod + venueID + "?" + params;


var searchBeer = function (searchString, inputIndex) {
    var column = inputIndex % 2 ? 1 : 2;
    var beerParams = $.param({
        client_id: clientID,
        client_secret: clientSecret,
        q: searchString,
        sort: "checkin"
    });

    var beerSearchURL = untappdEndpoint + beerSearchMethod + "?" + beerParams;

    $.ajax({
        url: beerSearchURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        result = response.response.beers.items[0];

        var newCard = $(`
                <div class="card w-100 bg-secondary">
                    <div class="card-body">
                        <h2 class="card-title">${result.brewery.brewery_name}</h2>
                        <div class="media">
                            <img class="mr-3 beer-label" src="${result.beer.beer_label}" alt="${result.beer.beer_name}">
                            <div class="media-body">
                                <h5 class="card-text">${result.beer.beer_name}</h5>
                                <a href="${result.brewery.contact.url}" class="brewery" target="_blank">
                                    <em>${result.brewery.brewery_name}</em>
                                </a>
                                <p class="beer-style">${result.beer.beer_style}</p>
                                <a class="btn btn-primary text-dark" data-toggle="collapse" href="#multiCollapse${inputIndex}" role="button" aria-expanded="false" aria-controls="multiCollapse1">
                                    Read More
                                </a>
                                <div class="collapse multi-collapse" id="multiCollapse${inputIndex}">
                                    <div class="card card-body">
                                        <p class="beer-description">
                                            <em>${result.beer.beer_description}</em>
                                        </p>
                                        <div class="row">
                                            <div class="col-sm-6 col-lg-5 abv">${result.beer.beer_abv}% ABV</div>
                                            <div class="col-sm-6 col-lg-5 ibu">${result.beer.beer_ibu} IBU</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        $(`#beer-column${column}`).append(newCard);
        console.log(result);
    }, function (err) {
        console.log(err);
    });
}

var searchVenues = function (searchString) {
    var params = $.param({
        q: searchString
    });
    var searchResult;


    $.ajax({
        //change this to hosted address
        url: "https://fathomless-island-52308.herokuapp.com/scrape?" + params,
        method: "GET"
    }).then(function (response) {
        //console.log(response);
        searchResult = response;
        service = new google.maps.places.PlacesService(map);
        //for every bar in response object bars array, use google Places search to get address
        $.each(searchResult.bars, function (index, bar) {
            //google maps api places text search function
            service.textSearch({
                query: bar.barName,
                //change this to a position based on search field
                location: myLatLng
            }, function (response) {
                if (response && response[0]) {
                    var address = response[0].formatted_address;
                    var name = response[0].name;
                    //for every bar with a found address, use google geocoding API to find coordinates
                    $.ajax({
                        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${response[0].formatted_address.split(" ").join("+")}&key=AIzaSyBmpG4-hKDAnfa_ZunuAKsdEBReaa8G0rc`,
                        method: "GET"
                    }).then(function (response) {
                        //console.log(response.results[0].geometry.location);
                        barSearchResult.bars.push({ name: name, address: address, location: response.results[0].geometry.location });
                    });
                }

            });
        });
    });

}

$("#beer-search-btn").on("click", function (evt) {

    clearMarkers();
    deleteMarkers();
    $(".jumbotron").hide();
    $("#beer-column1").html("");
    $("#beer-column2").html("");

    for (var i = 1; i <= inputs; i++) {
        var beerSearchString = $(`#beer-input${i}`).val().trim();
        //don't run for empty inputs
        if (beerSearchString) {
            searchBeer(beerSearchString, i);
        }
    }

    //sanitize input to remove commas and any special characters
    var locationString = $("#location-input").val().trim().split(" ").join("+");
    searchVenues(locationString);

    $("#inputModal").modal("hide");
    var setMarkers = function () {
        console.log(barSearchResult)
        for (var i = 0; i < barSearchResult.bars.length; i++) {

            marker = new google.maps.Marker({
                position: barSearchResult.bars[i].location,
                map: map,
                icon: './assets/images/beer.png',
                animation: google.maps.Animation.BOUNCE
            });
            marker.name = barSearchResult.bars[i].name;
            marker.address = barSearchResult.bars[i].address;

            // newInfo.setContent("<p>" + barSearchResult.bars[i].name + "<br />" + barSearchResult.bars[i].address  + "</p>");
            marker.addListener('click', function (evt) {
                // newInfo.open(map, marker);
                console.log(evt);
                console.log(this);
                console.log(this.name);
                var newInfo = new google.maps.InfoWindow({
                    content: `<div>${this.name}<br>${this.address}</div>`
                });
                newInfo.open(map, this);
                //this.setAnimation(null);
            });

            markers.push(marker);
        }
    }
    setTimeout(setMarkers, 2000);


});

$("#moreBeerBtn").on("click", function (evt) {
    inputs++;
    var btn = $("#moreBeerBtn");
    var newInput = $(`<input type="text" class="form-control" id="beer-input${inputs}" placeholder="Beer name" aria-label="Recipient's username" aria-describedby="basic-addon2">`);
    $("#beer-input-grp").append(newInput, btn);
});




//$("#inputModal").modal("show");

