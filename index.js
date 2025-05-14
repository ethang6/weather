const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Serve index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Handle form submission
app.post("/", function (req, res) {
  const cityId = req.body.cityIdInput;
  const lat = req.body.latInput;
  const lon = req.body.lonInput;
  const units = "imperial";
  const apiKey = "7bd0f3dfa769a0108247a91a4b5d3a0b";
  let url = "";

  if (cityId) {
    url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&units=${units}&appid=${apiKey}`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  } else {
    res.send(
      "<h1>Please enter either City ID or both Latitude and Longitude</h1>"
    );
    return;
  }

  https.get(url, function (response) {
    let dataChunks = "";

    response.on("data", function (chunk) {
      dataChunks += chunk;
    });

    response.on("end", function () {
      const weatherData = JSON.parse(dataChunks);

      if (!weatherData.main) {
        res.send("<h1>No weather data found. Please check your inputs.</h1>");
        return;
      }

      const temp = weatherData.main.temp;
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind.speed;
      const windDeg = weatherData.wind.deg;
      const cloudiness = weatherData.clouds.all;
      const city = weatherData.name;
      const description = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const imageURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.write(`<h1>Weather in ${city}</h1>`);
      res.write(`<h2>${description}</h2>`);
      res.write(`<h3>Temperature: ${temp} °F</h3>`);
      res.write(`<h3>Humidity: ${humidity}%</h3>`);
      res.write(`<h3>Wind: ${windSpeed} mph at ${windDeg}&deg;</h3>`);
      res.write(`<h3>Cloudiness: ${cloudiness}%</h3>`);
      res.write(`<img src="${imageURL}" alt="Weather Icon">`);
      res.send();
    });
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
