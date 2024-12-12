import React from "react";
import "./TemplateStyles.css";

const TradePerformanceTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Trade Performance Report"}</h1>
      <section>
        <h2>Trade Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Price</th>
              <th>Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {data.trades?.map((trade, index) => (
              <tr key={index}>
                <td>{trade.date}</td>
                <td>{trade.asset}</td>
                <td>{trade.type}</td>
                <td>{trade.price}</td>
                <td>{trade.profitLoss}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No trade data available.</td>
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

export default TradePerformanceTemplate;
