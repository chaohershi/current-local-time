let loc = "Montreal";
let lat = 45.4972159;
let lng = -73.6103642;
let timezoneOffset = 240;
let map = new google.maps.Map(document.getElementById("map"), {
  center: {"lat": lat, "lng": lng},
  zoom: 10
});

function httpGetAsync(url, callback) {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(xmlHttp.responseText);
    } else if (xmlHttp.readyState === 4 && xmlHttp.status === 0) {
      alert("Chrome geolocation sensors break CORS. Disable sensors and try again."); // https://stackoverflow.com/questions/62405596/chrome-geolocation-sensors-breaking-cors
    }
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send();
}

function getGeoFromInput() {
  let api = "59bf82af87f441009dedb211d00a7337";
  let url = "https://timezone.abstractapi.com/v1/current_time/?api_key=" + api + "&location=" + document.getElementById("location").value;
  httpGetAsync(url, updateGeo);
}

function updateGeo(geo) {
  let geoInfo = JSON.parse(geo);
  if (Object.keys(geoInfo).length === 0) { // if returned geoInfo is empty
    alert("Please input a valid location, e.g. Montreal, QC.");
  } else {
    loc = geoInfo.requested_location;
    lat = geoInfo.latitude
    lng = geoInfo.longitude;
    timezoneOffset = -geoInfo.gmt_offset * 60; // KNOWN ISSUE: The Abstract Timezone API returns an integer for the gmt_offset in hours, so it can't used for half time zone (e.g. time zone in Iran is GMT+4:30). Use Google Timezone API in production instead.
    showTime();
    updateMap();
  }
}

function getGeoFromClient() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getGeoSuccess, getGeoError, {enableHighAccuracy: true, timeout: 60000, maximumAge: 0});
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function getGeoSuccess(geo) {
  lat = geo.coords.latitude
  lng = geo.coords.longitude;
  loc = lat + ", " + lng;
  timezoneOffset = new Date().getTimezoneOffset();
  showTime();
  updateMap();
}

function getGeoError(error) {
  switch(error.code) {
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred. Error code: " + error.code);
      break;
    case error.PERMISSION_DENIED:
      alert("The request for geolocation has been denied. Error code: " + error.code);
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable. Error code: " + error.code);
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out. Error code: " + error.code);
      break;
  }
}

function updateMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {"lat": lat, "lng": lng},
    zoom: 10
  });
}

function showTime() {
  let timestamp = Math.floor(Date.now() / 1000); // UTC timestamp in seconds
  let date = new Date();
  let h = date.getUTCHours(); // 0 - 23
  let m = date.getUTCMinutes(); // 0 - 59
  let s = date.getUTCSeconds(); // 0 - 59
  let hm = (h * 60 + m - timezoneOffset + 1440) % 1440; // total minutes of the day in local time
  h = Math.floor(hm / 60);
  m = hm - h * 60;
  // add leading zeros
  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;
  s = (s < 10) ? "0" + s : s;
  let time = h + ":" + m + ":" + s;
  document.getElementById("requested-location").innerText = loc;
  document.getElementById("local-time").innerText = time;
  document.getElementById("local-time").textContent = time;
  document.getElementById("utc-timestamp").innerText = timestamp;
  setTimeout(showTime, 1000);
}

showTime();
updateMap();
