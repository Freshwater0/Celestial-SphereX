import React from "react";
import "./TemplateStyles.css";

const EngagementAndTrendsTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Engagement & Trends Report"}</h1>
      <section>
        <h2>Engagement Overview</h2>
        <p>{data.overview || "Engagement overview goes here."}</p>
      </section>
      <section>
        <h2>Trends</h2>
        <ul>
          {data.trends?.map((trend, index) => (
            <li key={index}>{trend}</li>
          )) || <li>No trends available.</li>}
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

export default EngagementAndTrendsTemplate;
