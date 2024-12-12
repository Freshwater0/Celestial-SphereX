import React from "react";
import "./TemplateStyles.css";

const MarketMovementTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Market Movement Report"}</h1>
      <section>
        <h2>Price Movements</h2>
        <table>
          <thead>
            <tr>
              <th>Cryptocurrency</th>
              <th>Current Price</th>
              <th>24h Change</th>
              <th>Volume</th>
              <th>Support/Resistance</th>
            </tr>
          </thead>
          <tbody>
            {data.movements?.map((movement, index) => (
              <tr key={index}>
                <td>{movement.crypto}</td>
                <td>{movement.currentPrice}</td>
                <td>{movement.change24h}</td>
                <td>{movement.volume}</td>
                <td>{movement.supportResistance}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No market movement data available.</td>
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

export default MarketMovementTemplate;
