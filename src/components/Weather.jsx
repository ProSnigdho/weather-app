import React, { useEffect, useState, useRef } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import humidity_icon from '../assets/humidity.png'

const Weather = () => {
  const inputRef = useRef()
  const [weatherData, setWeatherData] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
    "50d": drizzle_icon,
    "50n": drizzle_icon
  }

  const search = async (city) => {
    if (city === "") {
      alert("Enter City Name")
      return
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        alert("City Not Found")
        return
      }

      const icon = allIcons[data.weather[0].icon] || clear_icon
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: (data.wind.speed * 3.6).toFixed(1),
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon
      })
      setSuggestions([]) 
    } catch (error) {
      console.log("Error fetching weather data:", error)
      setWeatherData(false)
    }
  }

  const getSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    try {
      const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${import.meta.env.VITE_APP_ID}`
      const res = await fetch(url)
      const data = await res.json()
      setSuggestions(data.map(item => `${item.name}, ${item.country}`))
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }


useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
        const response = await fetch(url);
        const data = await response.json();


        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const geoData = await geoRes.json();

        const cityName =
          geoData.address.city ||
          geoData.address.town ||
          geoData.address.village ||
          geoData.address.state ||
          data.name; 

        if (response.ok) {
          const icon = allIcons[data.weather[0].icon] || clear_icon;
          setWeatherData({
            humidity: data.main.humidity,
            windSpeed: (data.wind.speed * 3.6).toFixed(1),
            temperature: Math.floor(data.main.temp),
            location: cityName, 
            icon: icon,
          });
        }
      } catch (error) {
        console.log("Error fetching location weather:", error);
      }
    });
  }
}, []);


  return (
    <div className='weather'>
      <div className='search-bar'>
        <input
          ref={inputRef}
          type='text'
          placeholder='Search'
          onChange={(e) => getSuggestions(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search(inputRef.current.value)}
        />
        <img src={search_icon} alt="" onClick={() => search(inputRef.current.value)} />
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((city, index) => (
            <li key={index} onClick={() => {
              search(city)
              inputRef.current.value = city
              setSuggestions([])
            }}>
              {city}
            </li>
          ))}
        </ul>
      )}

      {weatherData ? <>
        <img src={weatherData.icon} alt="" className='weather-icon' />
        <p className='temperature'>{weatherData.temperature}°C</p>
        <p className='location'>{weatherData.location}</p>
        <div className="weather-data">
          <div className="col">
            <img src={humidity_icon} alt="" />
            <div>
              <p>{weatherData.humidity}%</p>
              <span>Humidity</span>
            </div>
          </div>
          <div className="col">
            <img src={wind_icon} alt="" />
            <div>
              <p>{weatherData.windSpeed} km/h</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </div>
      </> : <></>}
    </div>
  )
}

export default Weather
