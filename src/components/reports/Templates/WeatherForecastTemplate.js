import React from "react";
import "./TemplateStyles.css";

const WeatherForecastTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Weather Forecast Report"}</h1>
      <section>
        <h2>Upcoming Weather</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Temperature</th>
              <th>Conditions</th>
              <th>Precipitation</th>
              <th>Wind Speed</th>
            </tr>
          </thead>
          <tbody>
            {data.forecast?.map((day, index) => (
              <tr key={index}>
                <td>{day.date}</td>
                <td>{day.temperature}</td>
                <td>{day.conditions}</td>
                <td>{day.precipitation}</td>
                <td>{day.windSpeed}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No forecast data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <footer>
        <h4>References</h4>
        <ul>
          {data.references?.map((ref, index) => (
            <li key={index}>{ref}</li>
          )) || <li>No references provided.</li>}
        </ul>
      </footer>
    </div>
  );
};

export default WeatherForecastTemplate;
