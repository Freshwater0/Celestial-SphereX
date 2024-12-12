import React from "react";
import "./TemplateStyles.css";

const ProfitAndLossStatementTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Profit & Loss Statement"}</h1>
      <section>
        <h2>Summary</h2>
        <p>{data.summary || "Profit and loss summary goes here."}</p>
      </section>
      <section>
        <h2>Detailed Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Profit</th>
              <th>Loss</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {data.breakdown?.map((entry, index) => (
              <tr key={index}>
                <td>{entry.period}</td>
                <td>{entry.profit}</td>
                <td>{entry.loss}</td>
                <td>{entry.net}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="4">No profit and loss data available.</td>
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

export default ProfitAndLossStatementTemplate;
