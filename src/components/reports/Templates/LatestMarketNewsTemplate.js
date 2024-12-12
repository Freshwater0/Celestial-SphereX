import React from "react";
import "./TemplateStyles.css";

const LatestMarketNewsTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Latest Market News"}</h1>
      <section>
        <h2>Top News Stories</h2>
        <ul>
          {data.news?.map((story, index) => (
            <li key={index}>
              <strong>{story.headline}</strong>: {story.summary}
            </li>
          )) || <li>No news stories available.</li>}
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

export default LatestMarketNewsTemplate;
