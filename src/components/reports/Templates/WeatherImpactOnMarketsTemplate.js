import React from "react";
import "./TemplateStyles.css";

const WeatherImpactOnMarketsTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Weather Impact on Markets Report"}</h1>
      <section>
        <h2>Weather and Market Correlation</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Weather Event</th>
              <th>Market Impact</th>
              <th>Commodity</th>
              <th>Price Change</th>
            </tr>
          </thead>
          <tbody>
            {data.impactData?.map((impact, index) => (
              <tr key={index}>
                <td>{impact.date}</td>
                <td>{impact.weatherEvent}</td>
                <td>{impact.marketImpact}</td>
                <td>{impact.commodity}</td>
                <td>{impact.priceChange}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No impact data available.</td>
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

export default WeatherImpactOnMarketsTemplate;
