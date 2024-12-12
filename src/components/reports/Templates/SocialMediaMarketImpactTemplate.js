import React from "react";
import "./TemplateStyles.css";

const SocialMediaMarketImpactTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Social Media Market Impact Report"}</h1>
      <section>
        <h2>Market Impact Overview</h2>
        <p>{data.overview || "Market impact overview goes here."}</p>
      </section>
      <section>
        <h2>Impact Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Trend</th>
              <th>Asset</th>
              <th>Price Change</th>
            </tr>
          </thead>
          <tbody>
            {data.impacts?.map((impact, index) => (
              <tr key={index}>
                <td>{impact.date}</td>
                <td>{impact.trend}</td>
                <td>{impact.asset}</td>
                <td>{impact.priceChange}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="4">No impact data available.</td>
              </tr>
            )}
          </tbody>
        </table>
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

export default SocialMediaMarketImpactTemplate;
