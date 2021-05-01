// API for this site: https://home.openweathermap.org/
const storageKey = "weatherCityList";
const maxInHistoryList = 10;

let citySearchForm = $("form");
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
      // call function to display the forcast
      getWeather(cityName, data.coord);

      // store data to local (check to be sure no duplicates)
      let objCity = {
        name: cityName,
        coords: data.coord,
      };

      // if the cityList does not include the cityName, then add it to the list else do nothing
      if (!cityList.some((city) => city.name === objCity.name)) {
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

  console.log(searchHistory);
  console.log("cityList:", cityList);
  for (let i = 0; i < cityList.length; i++) {
    console.log(i);

    // searchHistory
    //   .append("<button>")
    //   .addClass("btn btn-secondary mb-3")
    //   // .dataset("name", cityList[i].name)
    //   // .dataset("coords", cityList[i].coords)
    //   .text(cityList[i].name);

    let newButton =
      "<button class=('btn btn-secondary mb-3') data-name'" +
      cityList[i].name +
      "' data-coord='" +
      cityList[i].coord +
      "'>" +
      cityList[i].name +
      "</button>";
    console.log("newButton text:", newButton);

    searchHistory.append(newButton);
  }
}

function getWeather(strCityName, objCoord) {
  console.log("getWeather()");
}

$(document).ready(function () {
  citySearchForm.on("submit", function (event) {
    event.preventDefault();
    getAPIByCity();
  });

  showCityList();
});
