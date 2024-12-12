import React from "react";
import "./TemplateStyles.css";

const CryptoTaxReportTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Crypto Tax Report"}</h1>
      <section>
        <h2>Capital Gains and Losses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset</th>
              <th>Proceeds</th>
              <th>Cost Basis</th>
              <th>Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {data.taxDetails?.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.asset}</td>
                <td>{entry.proceeds}</td>
                <td>{entry.costBasis}</td>
                <td>{entry.gainLoss}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No tax data available.</td>
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

export default CryptoTaxReportTemplate;
