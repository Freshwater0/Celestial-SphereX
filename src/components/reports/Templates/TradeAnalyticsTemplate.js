import React from "react";
import "./TemplateStyles.css";

const TradeAnalyticsTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Trade Analytics Report"}</h1>
      <section>
        <h2>Analytics Overview</h2>
        <p>{data.overview || "Analytics overview goes here."}</p>
      </section>
      <section>
        <h2>Performance Metrics</h2>
        <ul>
          <li>Win/Loss Ratio: {data.winLossRatio || "N/A"}</li>
          <li>Average Return: {data.averageReturn || "N/A"}</li>
          <li>Average Trade Duration: {data.averageDuration || "N/A"}</li>
          <li>Other Metrics: {data.otherMetrics || "N/A"}</li>
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

export default TradeAnalyticsTemplate;
