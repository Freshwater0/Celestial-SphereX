import React from "react";
import "./TemplateStyles.css";

const SentimentAnalysisTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Sentiment Analysis Report"}</h1>
      <section>
        <h2>Sentiment Overview</h2>
        <p>{data.overview || "Sentiment analysis overview goes here."}</p>
      </section>
      <section>
        <h2>Article Sentiment</h2>
        <ul>
          {data.articles?.map((article, index) => (
            <li key={index}>
              <strong>{article.headline}</strong>: {article.sentiment}
            </li>
          )) || <li>No articles analyzed.</li>}
        </ul>
      </section>
      <section>
        <h2>Social Media Sentiment</h2>
        <p>{data.socialMedia || "Social media sentiment details here."}</p>
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

export default SentimentAnalysisTemplate;
