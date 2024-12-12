import React from "react";
import "./TemplateStyles.css";

const ExtremeWeatherEventTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Extreme Weather Event Report"}</h1>
      <section>
        <h2>Event Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Location</th>
              <th>Impact</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {data.events?.map((event, index) => (
              <tr key={index}>
                <td>{event.date}</td>
                <td>{event.name}</td>
                <td>{event.location}</td>
                <td>{event.impact}</td>
                <td>{event.severity}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No event data available.</td>
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

export default ExtremeWeatherEventTemplate;
