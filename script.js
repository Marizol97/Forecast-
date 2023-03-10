const APIKey = "666c40ab42930b07f519d78cc4e3c3b4"
let city = "";

const searchBox = $("#search-city");
const searchButton = $("#search-button");
const clearButton = $("#clear-history");
const currentCitySection = $("#current-city-section");
const currentCity = $("#current-city");
const currentTemperature = $("#temperature");
const currentHumidity = $("#humidity");
const currentWindSpeed = $("#wind-speed");
let sCity = [];

// searches the city to see if it exists in the entries from the storage
function findCityIndex(city) {
  return sCity.findIndex((c) => c.toUpperCase() === city.toUpperCase());
}

function currentWeather(city) {
  const weatherEndPoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${APIKey}`;

  $.ajax({
    url: weatherEndPoint,
    method: "GET",
  })
    .then(function (resp) {
      currentCitySection.show();
      console.log(resp);

      const weatherIcon = resp.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

      const date = new Date(resp.dt * 1000).toLocaleDateString();
      $(currentCity).html(`${resp.name}, ${resp.sys.country} (${date}) <img src="${iconUrl}">`);

      const tempF = resp.main.temp.toFixed(2);
      $(currentTemperature).html(`${tempF}&#8457;`);

      $(currentHumidity).html(`${resp.main.humidity}%`);

      const formattedWindSpeed = resp.wind.speed.toFixed(1);
      $(currentWindSpeed).html(`${formattedWindSpeed} MPH`);

      forecast(resp.id);

      if (resp.cod == 200) {
        sCity = JSON.parse(localStorage.getItem("cityname")) || [];
        if (findCityIndex(city) === -1) {
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        }
      }
    })
    .fail(function (err) {
      if (err.status == 404) {
        window.alert(`City not found. Double check the city name and spelling and try again. You can do the full name or part of the name. (e.g. "Vegas" for "Las Vegas")`);
      } else {
        window.alert("Something went wrong. Please try again.");
      }
    });
}

function displayWeather(event) {
  event.preventDefault();
  const inputCity = searchBox.val().trim();
  if (inputCity !== "") {
    city = inputCity;
    currentWeather(city);
  }
}

function addToList(city) {
  const listEl = $("<li>").addClass("list-group-item").text(city);
  $(".list").append(listEl);
}

function loadlastCity() {
  $("ul").empty();
  const sCity = JSON.parse(localStorage.getItem("cityname")) || [];
  if (sCity.length > 0) {
    currentWeather(sCity[sCity.length - 1]);
    for (let i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
  }
}

function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}

$("#search-button").on("click", displayWeather);
$(document).on("click", addToList);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);

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

const addToList = (city) => {
  const listEl = $(`<li>${city.toUpperCase()}</li>`);
  listEl.attr("class", "list-group-item");
  listEl.attr("data-value", city.toUpperCase());
  $(".list-group").append(listEl);
};

const invokePastSearch = (event) => {
  if (event.target.matches("li")) {
    searchBox.val("");
    const city = event.target.textContent.trim();
    currentWeather(city);
  }
};

const loadlastCity = () => {
  $("ul").empty();
  const sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity.forEach(city => addToList(city));
    currentWeather(sCity[sCity.length - 1]);
  } else {
    currentCitySection.hide();
  }
};

const clearHistory = (event) => {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
};

function searchOnEnter(event) {
  const isEnterKeyPressed = event.key === "Enter";

  if (isEnterKeyPressed) {
    event.preventDefault();
    displayWeather(event);
  }
}


searchBox.on("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    displayWeather(event);
  }
});

searchBox.on("click", displayWeather);
searchBox.on("keypress", searchOnEnter);
console.log ("hi")
searchButton.on("click", displayWeather);
clearButton.on("click", clearHistory);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);