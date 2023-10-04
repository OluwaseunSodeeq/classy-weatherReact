import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

// console.log(getWeatherIcon, formatDay);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "abuja",
      // location: "",
      isLoading: false,
      displayLocation: "",
      weather: {},
    };
    this.fetchWeather = this.fetchWeather.bind(this);
  }
  fetchWeather = async () => {
    if (this.state.location.length < 2) return this.setState({ weather: {} });

    try {
      this.setState({ isLoading: true });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      // console.log(geoData);
      // this.setState({ displayLocation: geoData });

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);

      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  };
  setLocation = (e) => this.setState({ location: e.target.value });
  // use effect
  componentDidMount() {
    // this.fetchWeather();
    this.setState({ location: localStorage.getItem("location") || "" });
  }

  //useEffect [Location]
  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      this.fetchWeather();

      localStorage.setItem("location", this.state.location);
    }
  }
  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <Input
          onChangeLocation={this.setLocation}
          location={this.state.location}
        />
        {/* <button onClick={this.fetchWeather}>Get weather</button> */}
        {this.state.isLoading && <p className="loader">Loading...</p>}
        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        )}
      </div>
    );
  }
}
export default App;

class Input extends React.Component {
  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="Search for Location..."
          value={this.props.location}
          onChange={this.props.onChangeLocation}
        />
      </div>
    );
  }
}
class Weather extends React.Component {
  componentWillUnmount() {
    // console.log("Hello World");
  }
  render() {
    const {
      temperature_2m_min: min,
      temperature_2m_max: max,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    // const { location } = this.props.location;
    // console.log(this.props.location);
    return (
      <div>
        <h2>Weather {this.props.location}</h2>
        <ul className="weather">
          {dates.map((date, i) => (
            <Day
              key={date}
              date={date}
              max={max.at(i)}
              min={min.at(i)}
              code={codes.at(i)}
              isToday={i === 0}
            />
          ))}
        </ul>
      </div>
    );
  }
}
class Day extends React.Component {
  render() {
    const { date, min, max, code, isToday } = this.props;
    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    );
  }
}
// class Counter extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = { count: 5 };
//     this.handleDecrememnt = this.handleDecrememnt.bind(this);
//     this.handleIncrememnt = this.handleIncrememnt.bind(this);
//   }

//   handleDecrememnt() {
//     this.setState((curState) => {
//       if (curState.count < 1) return;
//       return { count: curState.count - 1 };
//     });
//   }
//   handleIncrememnt() {
//     this.setState((curState) => {
//       return { count: curState.count + 1 };
//     });
//   }
//   render() {
//     const date = new Date("june 21 2027");
//     date.setDate(date.getDate() + this.state.count);
//     return (
//       <div>
//         <button onClick={this.handleDecrememnt}>-</button>
//         <span>
//           {date.toDateString()} [{this.state.count}]
//         </span>
//         <button on onClick={this.handleIncrememnt}>
//           +
//         </button>
//       </div>
//     );
//   }
// }
// export default Counter;
