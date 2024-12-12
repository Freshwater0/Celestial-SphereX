import React from "react";
import "./TemplateStyles.css";

const CryptoTransactionHistoryTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Crypto Transaction History"}</h1>
      <section>
        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions?.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.date}</td>
                <td>{transaction.type}</td>
                <td>{transaction.asset}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.status}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="5">No transaction data available.</td>
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

export default CryptoTransactionHistoryTemplate;
