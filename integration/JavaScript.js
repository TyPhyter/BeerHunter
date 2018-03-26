var map, infoWindow;
function initMap(data) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }












// +Array Start+ 
function initialize() {
// +Array+
var data = [
  {
      name: "Braindead Brewing",
      address: "123 Fake",
      coordinates: 
      {
        "lat": 32.7838021,
        "lng": -96.7854149
        },
  },
  {
      name: "Common Table",
      address: "888 fake st",
      coordinates: 
      {
        "lat": 32.7981432,
        "lng": -96.8062781
        },
  },
  {
      name: "Deep Ellum Brewing Company",
      address: "111 no real st.",
      coordinates:
      {
        "lat": 32.7807541,
        "lng": -96.7817329
        },
  },
  {
      name: "Peticolas Brewing Company",
      address: "777 maybe fake st",
      coordinates:
      {
        "lat": 32.7969137,
        "lng": -96.8291541
        },
  },
  {
      name: "Luck",
      address: "777 fake st.",
      coordinates:      
      {
        "lat": 32.779372,
        "lng": -96.8289867
        },
  }];
// +Array+



//bounce code to target animation on marker. 
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.DROP);
  }


}

// function for adding a listener to each marker
var markerListener = function(mark) {
  google.maps.event.addListener(mark, 'click', function() {
    console.log(mark);
  })
}


// foor loop going thru data, but making new marker every time, new marker variable. for some reason we not using that marker



// for loop create new marker with each one. 
for (var i = 0; i < data.length; i++) {

  //added var marker
  var marker = {}; 
  marker = new google.maps.Marker({ //contructor. 
    position: data[i].coordinates,
    map: map ,
    title: data[i].name, 
    animation: google.maps.Animation.BOUNCE, //animation added. Change DROP to BOUNCE to force the animation to bounce 
    
    icon: './Assets/Images/beer.png', //this will target every address on the map.
    address: "example"
    
    //++ adding event listener. 
  
  });


  // Comment out the event listener for now because we aren't using it
  
  // marker.addListener('click', toggleBounce);
  // the event listener needed for animation. Based on google maps. 

  // Makes a unique listener for each marker passing in the current marker as an argument
  markerListener(marker);


 
// click intel below. 
  var infowindow =  new google.maps.InfoWindow({
		content: ''
	});
  





// this is what puts intel inside. 
  bindInfoWindow(marker,map,infowindow,"<p>" + data[i].name + "<br />" + data[i].address  + "</p>");
  console.log(bindInfoWindow);
// 





  }
} // this is to close the function initialize() {

function bindInfoWindow(marker, map, infowindow, html) { 
	google.maps.event.addListener(marker, 'click', function() { 
    //event.addListener is the one that listens to the click. 
		infowindow.setContent(html); 
		infowindow.open(map, marker); 
	}); 
} 

google.maps.event.addDomListener(window, 'load', initialize);











// regular google code below. 
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}