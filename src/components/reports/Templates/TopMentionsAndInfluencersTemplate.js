import React from "react";
import "./TemplateStyles.css";

const TopMentionsAndInfluencersTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Top Mentions & Influencers Report"}</h1>
      <section>
        <h2>Top Mentions</h2>
        <ul>
          {data.mentions?.map((mention, index) => (
            <li key={index}>
              <strong>{mention.user}</strong>: {mention.content}
            </li>
          )) || <li>No mentions available.</li>}
        </ul>
      </section>
      <section>
        <h2>Influencers</h2>
        <ul>
          {data.influencers?.map((influencer, index) => (
            <li key={index}>
              <strong>{influencer.name}</strong>: {influencer.impact}
            </li>
          )) || <li>No influencers available.</li>}
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

export default TopMentionsAndInfluencersTemplate;
