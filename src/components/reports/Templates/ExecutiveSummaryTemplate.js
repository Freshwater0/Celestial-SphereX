import React from "react";
import "./TemplateStyles.css";

const ExecutiveSummaryTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Executive Summary"}</h1>
      <section>
        <h2>Summary</h2>
        <p>{data.summary || "Enter the executive summary details here."}</p>
      </section>
      <section>
        <h2>Key Metrics</h2>
        <ul>
          {data.metrics?.map((metric, index) => (
            <li key={index}>{metric}</li>
          )) || <li>Metrics go here.</li>}
        </ul>
      </section>
      <section>
        <h2>Recommendations</h2>
        <p>{data.recommendations || "Provide actionable steps here."}</p>
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

export default ExecutiveSummaryTemplate;
