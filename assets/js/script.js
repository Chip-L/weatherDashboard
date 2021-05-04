// API for this site: https://home.openweathermap.org/
const storageKey = "weatherCityList";
const maxInHistoryList = 10;
const degreeSymbol = String.fromCharCode(176);

let getCityList = () => JSON.parse(localStorage.getItem(storageKey)) || [];

function getAPIByCity() {
  let requestUrl;
  let cityList = getCityList();
  let cityName = $("#city-input").val();

  if (cityName === "") {
    return; // no entry no reason to execute any further
  }

  // api.openweathermap.org/data/2.5/weather?q={city name}{,{state code}{,{country code}}}&units={standard|metric|imperial}&appid={API key}
  requestUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial&appid=feff70f8d612132ecb7ca03754f46b78";

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log("data:", data);

      //error catch for bad data returned
      if (data.cod != 200) {
        if (data.cod == 404) {
          displayError('"' + cityName + '" could not be found.');
          return;
        } else {
          displayError(data.cod + ": " + data.message);
          return;
        }
      }

      // data.name will have proper capitalization of the name
      let objCity = {
        city: data.name,
        latitude: data.coord.lat,
        longitude: data.coord.lon,
      };

      // call function to display the forecast
      getWeather(objCity);

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

function displayError(msg) {
  $("#error").removeClass("hide");
  $("#weather").addClass("hide");

  $("#error-message").text(msg);
}

function showCityList() {
  let cityList = getCityList();
  let searchHistory = $("#search-history");

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

    // call function to display the forecast
    getWeather(objCity);
  });
}

function getWeather(objCity) {
  // https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={current,minutely,hourly,daily,alerts}&units={units}&appid={APIKey}
  let requestUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    objCity.latitude +
    "&lon=" +
    objCity.longitude +
    "&exclude=minutely,hourly&units=imperial&appid=feff70f8d612132ecb7ca03754f46b78";

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log("data:", data);

      // set up current section
      $("#error").addClass("hide");
      $("#weather").removeClass("hide");
      $("#current-city").text(objCity.city);
      $("#current-date").text(
        moment.unix(data.current.dt).format("(MM/DD/YYYY)")
      );
      $("#current-icon")
        .attr(
          "src",
          `https://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`
        )
        .attr("alt", data.current.weather[0].description);
      $("#current-temp").text(data.current.temp + degreeSymbol + "F");
      $("#current-wind").text(data.current.wind_speed + " MPH");
      $("#current-humidity").text(data.current.humidity + "%");
      $("#current-uvi").text(data.current.uvi);

      $("#current-uvi").removeClass(
        "lowUV moderateUV highUV veryHighUV extremeUV"
      );
      // values from: https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage
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

      // set up 5 day forecast cards
      let fiveDayForecast = data.daily.slice(1, 6); // 0 is today's forecast
      let cardList = $(".card-body");

      for (let i = 0; i < fiveDayForecast.length; i++) {
        $(cardList[i])
          .find(".fdf-date")
          .text(moment.unix(fiveDayForecast[i].dt).format("MM/DD/YYYY"));
        $(cardList[i])
          .find(".fdf-icon")
          .attr(
            "src",
            `https://openweathermap.org/img/wn/${fiveDayForecast[i].weather[0].icon}.png`
          )
          .attr("alt", data.current.weather[0].description);
        $(cardList[i])
          .find(".fdf-highTemp")
          .text(fiveDayForecast[i].temp.max + degreeSymbol + "F");
        $(cardList[i])
          .find(".fdf-lowTemp")
          .text(fiveDayForecast[i].temp.min + degreeSymbol + "F");
        $(cardList[i])
          .find(".fdf-wind")
          .text(fiveDayForecast[i].wind_speed + " MPH");
        $(cardList[i])
          .find(".fdf-humidity")
          .text(fiveDayForecast[i].humidity + "%");
      }
    });
} // end getWeather function

$("form").on("submit", function (event) {
  event.preventDefault();
  getAPIByCity();
  $("#city-input").val("");
});

showCityList();
