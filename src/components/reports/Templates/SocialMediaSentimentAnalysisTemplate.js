import React from "react";
import "./TemplateStyles.css";

const SocialMediaSentimentAnalysisTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Social Media Sentiment Analysis Report"}</h1>
      <section>
        <h2>Sentiment Overview</h2>
        <p>{data.overview || "Sentiment analysis overview goes here."}</p>
      </section>
      <section>
        <h2>Sentiment Breakdown</h2>
        <ul>
          <li>Positive Mentions: {data.positive || "N/A"}</li>
          <li>Neutral Mentions: {data.neutral || "N/A"}</li>
          <li>Negative Mentions: {data.negative || "N/A"}</li>
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

export default SocialMediaSentimentAnalysisTemplate;
