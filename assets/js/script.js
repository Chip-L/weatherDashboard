// API for this site: https://home.openweathermap.org/
const storageKey = "weatherCityList";
const maxInHistoryList = 10;
const degreeSymbol = String.fromCharCode(176);

let getCityList = () => JSON.parse(localStorage.getItem(storageKey)) || [];

function getAPIByCity() {
  let requestUrl;
  let cityList = getCityList();
  let cityName = $("#city-input").val();

  console.log("getAPIByCity()", cityName);
  if (cityName === "") {
    return; // no entry no reason to execut any further
  }

  // api.openweathermap.org/data/2.5/weather?q={city name}{,{state code}{,{country code}}}&units={standard|metric|imperial}&appid={API key}
  requestUrl =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial&appid=feff70f8d612132ecb7ca03754f46b78";
  // console.log(requestUrl);

  fetch(requestUrl)
    .then(function (response) {
      // Use the console to examine the response
      console.log(response.status);
      return response.json();
    })
    .then(function (data) {
      // create a city object to keep information together
      // data.name will have proper capitalization of the name
      let objCity = {
        city: data.name,
        latitude: data.coord.lat,
        longitude: data.coord.lon,
      };

      // call function to display the forcast
      getWeather(objCity);

      console.log(objCity);
      // if the cityList does not include the cityName, then add it to the list else do nothing
      if (!cityList.some((city) => city.city === objCity.city)) {
        cityList.unshift(objCity);
        if (cityList.length > maxInHistoryList) {
          cityList.length = maxInHistoryList;
        }
        localStorage.setItem(storageKey, JSON.stringify(cityList));
      }

      // call function to add buttons on to the  city list
      showCityList();
    });
}

function showCityList() {
  let cityList = getCityList();
  let searchHistory = $("#search-history");

  console.log("showCityList()");

  // clear the history section
  searchHistory.text("");

  for (let i = 0; i < cityList.length; i++) {
    let newButton =
      "<button class='btn btn-secondary mb-3' data-latitude='" +
      cityList[i].latitude +
      "' data-longitude='" +
      cityList[i].longitude +
      "'>" +
      cityList[i].city +
      "</button>";

    searchHistory.append(newButton);
  }

  searchHistory.children().on("click", function () {
    let objCity = {
      city: $(this).text(),
      latitude: $(this).data("latitude"),
      longitude: $(this).data("longitude"),
    };

    // console.log("click", objCity);

    // call function to display the forcast
    getWeather(objCity);
  });
  // console.log(searchHistory.children());
}

function getWeather(objCity) {
  console.log("getWeather(", objCity, ")");

  // https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={current,minutely,hourly,daily,alerts}&units={units}&appid={APIKey}
  let requestUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    objCity.latitude +
    "&lon=" +
    objCity.longitude +
    "&exclude=minutely,hourly&units=imperial&appid=feff70f8d612132ecb7ca03754f46b78";

  fetch(requestUrl)
    .then(function (response) {
      // Use the console to examine the response
      console.log(response.status);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      let imageSrc =
        "http://openweathermap.org/img/wn/" +
        data.current.weather[0].icon +
        "@2x.png";

      $("#current-city").text(objCity.city);
      $("#current-date").text(moment(data.dt).format("(MM/DD/YYYY)"));
      $("#current-icon")
        .attr("src", imageSrc)
        .attr("alt", data.current.weather[0].description);
      $("#current-temp").text(data.current.temp + degreeSymbol + "F");
      $("#current-wind").text(data.current.wind_speed + "MPH");
      $("#current-humidity").text(data.current.humidity + "%");
      $("#current-uvi").text(data.current.uvi);

      $("#current-uvi").removeClass(
        "lowUV moderateUV highUV veryHighUV extremeUV"
      );
      // https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage
      if (data.current.uvi <= 2) {
        $("#current-uvi").addClass("lowUV");
      } else if (data.current.uvi <= 5) {
        $("#current-uvi").addClass("moderateUV");
      } else if (data.current.uvi <= 7) {
        $("#current-uvi").addClass("highUV");
      } else if (data.current.uvi <= 10) {
        $("#current-uvi").addClass("veryHighUV");
      } else {
        $("#current-uvi").addClass("extremeUV");
      }
    });
}

$(document).ready(function () {
  let citySearchForm = $("form");

  citySearchForm.on("submit", function (event) {
    event.preventDefault();
    getAPIByCity();
    $("#city-input").val("");
  });

  showCityList();
});
