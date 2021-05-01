// API for this site: https://home.openweathermap.org/

let citySearchForm = $("form");

citySearchForm.on("submit", function (event) {
  event.preventDefault();
  getAPIByCity();
});

function getAPIByCity() {
  let requestUrl;
  let cityName = $("#city-input").val();

  console.log("getAPIByCity()", cityName);

  // api.openweathermap.org/data/2.5/weather?q={city name}{,{state code},{country code}}&units={standard|metric|imperial}&appid={API key}
  requestUrl =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial&appid=feff70f8d612132ecb7ca03754f46b78";
  console.log(requestUrl);

  fetch(requestUrl)
    .then(function (response) {
      // Use the console to examine the response
      console.log(response.status);
      return response.json();
    })
    .then(function (data) {
      // Use the console to examine the response
      console.log("data:", data);

      getWeather(data.coord, cityName);
    });
}

function getWeather(objCoords, strCityName) {
  console.log("getWeather()");
}
