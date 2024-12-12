import React from "react";
import "./TemplateStyles.css";

const CryptoNewsAndSentimentTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Crypto News & Sentiment Report"}</h1>
      <section>
        <h2>Latest News</h2>
        <ul>
          {data.news?.map((newsItem, index) => (
            <li key={index}>
              <strong>{newsItem.headline}</strong>: {newsItem.summary}
            </li>
          )) || <li>No news available.</li>}
        </ul>
      </section>
      <section>
        <h2>Market Sentiment</h2>
        <p>{data.sentiment || "Sentiment analysis details here."}</p>
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

export default CryptoNewsAndSentimentTemplate;
