import React, { useState } from 'react';
import './HomePage.css';
import { MdHistory } from 'react-icons/md';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { TransactionCard } from '../TransactionCard/TransactionCard';

const optionAmounts = {
  Wallet: 1000.00,
  ICICI: 1500.00,
  SBI: 2000.00
};

const transactions = [
  {
    "to": "9810405419@wallet",
    "amount": 2000,
    "timestamp": "1710401120917"
  },
  {
    "from": "9818865785@icici",
    "amount": 1000,
    "timestamp": "1710403203861"
  }
];

function HomePage() {
  const [selectedOption, setSelectedOption] = useState('Wallet');
  const [showDropdown, setShowDropdown] = useState(false);
  const [fromVPA, setFromVPA] = useState();
  const [toPrefix, setToPrefix] = useState();
  const [toSuffix, setToSuffix] = useState();
  const [amount, setAmount] = useState();
  const [showTransactions, setShowTransactions] = useState(false);

  const handleToSuffixChange = (event) => {
    setToSuffix(event.target.value);
  }

  const handleOptionChange = (event) => {
    const selected = event.target.value;
    setSelectedOption(selected);
  };

  const handleSendClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFromDropdownChange = (event) => {
    setFromVPA(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleToInputChange = (event) => {
    setToPrefix(event.target.value);
  }

  const handleHistoryClick = () => {
    setShowTransactions(true);
  };

  return (
    <div className="home-container">
      <div className="card">
        <div className="card-header">&#x20B9; {optionAmounts[selectedOption].toFixed(2)}</div>
        <div className="dropdown-container">
          <select className="dropdown-select" value={selectedOption} onChange={handleOptionChange}>
            <option value="Wallet">RBI Wallet</option>
            <option value="ICICI">ICICI Bank</option>
            <option value="SBI">SBI Bank</option>
          </select>
        </div>
      </div>
      <div className="button-container">
        <button className="action-btn" onClick={handleSendClick}>
          <FaArrowUp className="send-icon" />
          Send
        </button>
        <button className="action-btn">
          <FaArrowDown className="receive-icon" />
          Receive
        </button>
        <button className="action-btn" onClick={handleHistoryClick}>
          <MdHistory className="history-icon" />
          History
        </button>
      </div>
      {showDropdown && (
        <div className="card">
          <div className="input-container">
            <div className="label">From:</div>
            <select className="dropdown-select" value={fromVPA} onChange={handleFromDropdownChange}>
              <option value="9810405419@wallet">9810405419@wallet</option>
              <option value="9810405419@icici">9810405419@icici</option>
              <option value="9810405419@sbi">9810405419@sbi</option>
            </select>
          </div>
          <div className="input-container">
            <div className="label">To:</div>
            <input
              type="text"
              value={toPrefix}
              onChange={handleToInputChange}
              placeholder="Enter recipient"
              className="to-input"
            />
            <select
              className="dropdown-select"
              value={toSuffix}
              onChange={handleToSuffixChange}
            >
              <option value="@icici">@icici</option>
              <option value="@wallet">@wallet</option>
              <option value="@sbi">@sbi</option>
            </select>
          </div>
          <div className="input-container">
            <div className="label">Amount:</div>
            <input
              type="number"
              className="to-input"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
            />
          </div>
          <button type="submit" className='submit-button' disabled={!toPrefix || !amount}>Pay</button>
        </div>
      )}
      {showTransactions && transactions.map((transaction, index) => (
        <TransactionCard key={index} transaction={transaction} />
      ))}
    </div>
  );
}

export default HomePage;
