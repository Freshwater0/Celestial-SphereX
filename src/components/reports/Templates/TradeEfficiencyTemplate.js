import React from "react";
import "./TemplateStyles.css";

const TradeEfficiencyTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Trade Efficiency Report"}</h1>
      <section>
        <h2>Efficiency Overview</h2>
        <p>{data.overview || "Efficiency overview goes here."}</p>
      </section>
      <section>
        <h2>Efficiency Metrics</h2>
        <ul>
          <li>Average Time to Profit: {data.timeToProfit || "N/A"}</li>
          <li>Average Time to Stop Loss: {data.timeToStopLoss || "N/A"}</li>
          <li>Trade Volume: {data.tradeVolume || "N/A"}</li>
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

export default TradeEfficiencyTemplate;
