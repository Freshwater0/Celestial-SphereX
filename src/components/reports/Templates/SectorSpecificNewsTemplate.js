import React from "react";
import "./TemplateStyles.css";

const SectorSpecificNewsTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Sector-Specific News"}</h1>
      <section>
        <h2>News by Sector</h2>
        {data.sectors?.map((sector, index) => (
          <div key={index}>
            <h3>{sector.name}</h3>
            <ul>
              {sector.news?.map((story, i) => (
                <li key={i}>
                  <strong>{story.headline}</strong>: {story.summary}
                </li>
              )) || <li>No news available for this sector.</li>}
            </ul>
          </div>
        )) || <p>No sector-specific news available.</p>}
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

export default SectorSpecificNewsTemplate;
