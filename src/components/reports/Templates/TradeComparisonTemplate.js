import React from "react";
import "./TemplateStyles.css";

const TradeComparisonTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Trade Comparison Report"}</h1>
      <section>
        <h2>Comparison Overview</h2>
        <p>{data.overview || "Comparison overview goes here."}</p>
      </section>
      <section>
        <h2>Asset/Strategy Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Asset/Strategy</th>
              <th>Performance</th>
              <th>Metrics</th>
            </tr>
          </thead>
          <tbody>
            {data.comparisons?.map((comparison, index) => (
              <tr key={index}>
                <td>{comparison.name}</td>
                <td>{comparison.performance}</td>
                <td>{comparison.metrics}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="3">No comparison data available.</td>
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

export default TradeComparisonTemplate;
