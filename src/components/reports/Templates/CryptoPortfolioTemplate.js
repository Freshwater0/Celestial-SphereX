import React from "react";
import "./TemplateStyles.css";

const CryptoPortfolioTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Crypto Portfolio Report"}</h1>
      <section>
        <h2>Portfolio Overview</h2>
        <ul>
          {data.holdings?.map((holding, index) => (
            <li key={index}>
              <strong>{holding.asset}</strong>: {holding.value} ({holding.percentage}%)
            </li>
          )) || <li>No holdings data available.</li>}
        </ul>
      </section>
      <section>
        <h2>Total Portfolio Value</h2>
        <p>{data.totalValue || "N/A"}</p>
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

export default CryptoPortfolioTemplate;
