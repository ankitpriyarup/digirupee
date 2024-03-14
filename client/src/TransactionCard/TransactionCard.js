import React from 'react';
import './TransactionCard.css';

export function TransactionCard({ transaction }) {
  const isToTransaction = transaction.hasOwnProperty('to');
  const amountBackgroundColor = isToTransaction ? '#ff3233' : '#18ce4d';
  const amountTextColor = 'white';

  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};


  return (
    <div className="card transaction-card">
      <div className="label">{isToTransaction ? 'To' : 'From'}: {isToTransaction ? transaction.to : transaction.from}</div>
      <div className="amount-container">
        Amount: 
        <span style={{ backgroundColor: amountBackgroundColor, color: amountTextColor }} className="amount-bg label">
          {transaction.amount}
        </span>
      </div>
      <div className="timestamp">{formatTimestamp(transaction.timestamp)}</div>
    </div>
  );
};
