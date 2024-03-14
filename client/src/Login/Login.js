import React, { useState } from 'react';
import './Login.css';
import icon from '../images/icon.png';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); 

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleNextStep = (event) => {
    event.preventDefault();
    setStep(2); 
  };

  const handlePinChange = (index, event) => {
    const newPin = [...pin];
    newPin[index] = event.target.value;
    setPin(newPin);
    if (event.target.value.length === 1 && index < 5) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const enteredPin = pin.join('');

  };

  const handleGoBack = () => {
    setStep(1); 
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
      {step === 2 && ( <button onClick={handleGoBack} className="back-button">&larr;</button> ) }
      <img src={icon} alt='icon' className="icon"/>
        {step === 1 && (
          <>
            <div className='enter-heading'>Enter phone number:</div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              maxLength="10"
              required
            />
            <button onClick={handleNextStep} className='submit-button' disabled={phoneNumber.length !== 10}>Next</button>
          </>
        )}
        {step === 2 && (
          <>
            <div className='enter-heading'>Enter PIN:</div>
            <div className="input-pin">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  value={digit}
                  maxLength="1"
                  onChange={(event) => handlePinChange(index, event)}
                  className="pin-input"
                  required
                />
              ))}
            </div>
            <button type="submit" className='submit-button' disabled={pin.some(digit => digit === '')}>Login</button>
          </>
        )}
      </form>
    </div>
  );
}

export default Login;
