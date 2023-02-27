let city = "";

let searchBox = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCitySection = $("#current-city-section");
let currentCity = $("#current-city");
let currentTemperature = $("#temperature");
let currentHumidty = $("#humidity");
let currentWSpeed = $("#wind-speed");
let sCity = [];
// searches the city to see if it exists in the entries from the storage
function find(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

var APIKey = "666c40ab42930b07f519d78cc4e3c3b4";

function displayWeather(event) {
  event.preventDefault();
  if (searchBox.val().trim() !== "") {
    city = searchBox.val().trim();
    currentWeather(city);
  }
}

function currentWeather(city) {
  var weatherEndPoint =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial" +
    "&APPID=" +
    APIKey;

  $.ajax({
    url: weatherEndPoint,
    method: "GET",
  })
    .then(function (resp) {
      currentCitySection.show();
      console.log(resp);

      let weathericon = resp.weather[0].icon;
      let iconurl =
        "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

      let date = new Date(resp.dt * 1000).toLocaleDateString();
      $(currentCity).html(
        `${resp.name}, ${resp.sys.country} (${date} <img src=${iconurl}>`
      );

      let tempF = resp.main.temp;
      var formattedTemp = tempF.toFixed(2);
      $(currentTemperature).html(`${formattedTemp}&#8457`);
      // Display the Humidity
      $(currentHumidty).html(resp.main.humidity + "%");
      var ws = resp.wind.speed;
      var formattedws = ws.toFixed(1);
      $(currentWSpeed).html(`${formattedws}MPH`);
      forecast(resp.id);
      if (resp.cod == 200) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        console.log(sCity);
        if (sCity == null) {
          sCity = [];
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        } else {
          if (find(city) > 0) {
            sCity.push(city.toUpperCase());
            localStorage.setItem("cityname", JSON.stringify(sCity));
            addToList(city);
          }
        }
      }
    })
    .fail(function (err) {
      if (err.status == 404) {
        window.alert(
          'City not found. Double check the city name and spelling and try again. You can do the full name or part of the name. \n\n (e.g. "Vegas" for "Las Vegas")'
        );
      } else {
        window.alert("Something went wrong. Please try again.");
      }
    });
}

function forecast(cityid) {
  var queryforcastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&units=imperial" +
    "&appid=" +
    APIKey;
  $.ajax({
    url: queryforcastURL,
    method: "GET",
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      var date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      var iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      var tempF = response.list[(i + 1) * 8 - 1].main.temp;
      var formattedTemp = tempF.toFixed(2);
      var humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $("#fDate" + i).html(date);
      $("#fImg" + i).html("<img src=" + iconurl + ">");
      $("#fTemp" + i).html(formattedTemp + "&#8457");
      $("#fHumidity" + i).html(humidity + "%");
    }
  });
}

function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    searchBox.val("");
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

function loadlastCity() {
  $("ul").empty();
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  } else {
    currentCitySection.hide();
  }
}
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}

function searchOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    displayWeather(event);
  }
}

// searchBox.on("click", displayWeather);
searchBox.on("keypress", searchOnEnter);
searchButton.on("click", displayWeather);
clearButton.on("click", clearHistory);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
