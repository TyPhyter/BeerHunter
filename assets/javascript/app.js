
var map, infoWindow, position, city, geocoder;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 10
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

            position = pos;

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            //change this to reverse geocoded location for manual input field locations
            map.setCenter(pos);
            city = findCity(geocoder, position);
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
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    $("#currentLocationBtn").on("click", function (evt) {
        findCity(geocoder);
    });

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


var searchBeer = function (searchString) {

    //TO DO: Change this function to dynamically render the entire beer card
    //  rather than replacing the text of a placeholder card

    var beerParams = $.param({
        client_id: clientID,
        client_secret: clientSecret,
        q: searchString,
        sort: "checkin"
    });

    var beerSearchURL = untappdEndpoint + beerSearchMethod + "?" + beerParams;
    //must return result of ajax function for $.when to work
    return $.ajax({
        url: beerSearchURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        result = response.response.beers.items[0];
        //Use jQuery to put info from response into HTML
        $(".beer-label").attr("src", result.beer.beer_label);
        $(".card-title").text(result.brewery.brewery_name);
        $(".card-text").text(result.beer.beer_name);
        $(".brewery").html(`<em>${result.brewery.brewery_name}</em>`);
        $(".brewery").attr("href", result.brewery.contact.url);
        $(".beer-style").text(result.beer.beer_style);
        $(".beer-description").html(`<em>${result.beer.beer_description}</em>`);
        $(".abv").text(`${result.beer.beer_abv} ABV`);
        $(".ibu").text(`${result.beer.beer_ibu} IBU`);
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
        url: "http://localhost:8080/scrape?" + params,
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
                location: position
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
    //TO DO: loop through inputs and caputer values in an array
    //append new cards to the beer card div
    //add logic to handle location search
    var beerSearchString = $("#beer-input1").val().trim();
    searchBeer(beerSearchString);

    //sanitize input to remove commas and any special characters
    var locationString = $("#location-input").val().trim().split(" ").join("+");
    searchVenues(locationString);

    $("#inputModal").modal("hide");
    var markers = function () {
        console.log(barSearchResult)
        for (var i = 0; i < barSearchResult.bars.length; i++) {

            marker = new google.maps.Marker({
                position: barSearchResult.bars[i].location,
                map: map,
                icon: './assets/images/beer.png'
            });

        }
    }
    setTimeout(markers, 2000);


});

$("#moreBeerBtn").on("click", function (evt) {
    inputs++;
    var btn = $("#moreBeerBtn");
    var newInput = $(`<input type="text" class="form-control" id="beer-input${inputs}" placeholder="Beer name" aria-label="Recipient's username" aria-describedby="basic-addon2">`);
    $("#beer-input-grp").append(newInput, btn);
});




//$("#inputModal").modal("show");

