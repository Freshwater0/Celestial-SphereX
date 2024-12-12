import React from "react";
import "./TemplateStyles.css";

const FinancialAnalysisTemplate = ({ data }) => {
  return (
    <div className="template-container">
      <h1>{data.title || "Financial Analysis Report"}</h1>
      <section>
        <h2>Financial Highlights</h2>
        <p>{data.highlights || "Highlight key financial metrics here."}</p>
      </section>
      <section>
        <h2>Detailed Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.breakdown?.map((item, index) => (
              <tr key={index}>
                <td>{item.category}</td>
                <td>{item.amount}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="2">Enter breakdown data here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <footer>
        <h4>Appendix</h4>
        <p>{data.appendix || "Supporting documents go here."}</p>
      </footer>
    </div>
  );
};

export default FinancialAnalysisTemplate;
