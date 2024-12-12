import React from "react";
import "./TemplateStyles.css";

const BreakingNewsAlertsTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Breaking News Alerts"}</h1>
      <section>
        <h2>Important News Alerts</h2>
        <ul>
          {data.alerts?.map((alert, index) => (
            <li key={index}>
              <strong>{alert.headline}</strong>: {alert.details}
            </li>
          )) || <li>No breaking news alerts available.</li>}
        </ul>
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

export default BreakingNewsAlertsTemplate;
