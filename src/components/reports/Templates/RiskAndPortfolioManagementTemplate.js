import React from "react";
import "./TemplateStyles.css";

const RiskAndPortfolioManagementTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Risk and Portfolio Management Report"}</h1>
      <section>
        <h2>Portfolio Overview</h2>
        <p>{data.overview || "Portfolio overview goes here."}</p>
      </section>
      <section>
        <h2>Asset Allocation</h2>
        <ul>
          {data.allocation?.map((asset, index) => (
            <li key={index}>
              {asset.name}: {asset.percentage}%
            </li>
          )) || <li>No asset allocation data available.</li>}
        </ul>
      </section>
      <section>
        <h2>Risk Assessment</h2>
        <p>{data.riskAssessment || "Risk assessment details here."}</p>
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

export default RiskAndPortfolioManagementTemplate;
