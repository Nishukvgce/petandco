import React, { useState } from 'react';

const LoginModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handleMobileSubmit = () => {
    // Simulate sending OTP
    setStep(2);
  };

  const handleOtpSubmit = () => {
    // Simulate OTP verification
    alert('OTP Verified!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-lg hover:text-gray-400"
        >
          &times;
        </button>

        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">HEADS UP FOR TAILS</h2>
          <p className="text-sm text-gray-400">Register to avail the best deals!</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <span className="text-yellow-400 text-lg">★</span>
            <p className="text-sm">Exclusive Deals and Discount</p>
          </div>
          <div className="text-center">
            <span className="text-yellow-400 text-lg">★</span>
            <p className="text-sm">Swift Checkout Experience</p>
          </div>
          <div className="text-center">
            <span className="text-yellow-400 text-lg">★</span>
            <p className="text-sm">Easy Orders Tracking</p>
          </div>
        </div>

        {step === 1 && (
          <div>
            <label className="block text-sm mb-2">Login / Signup</label>
            <div className="flex items-center border border-gray-700 rounded-lg px-4 py-2 mb-4">
              <span className="text-green-500 mr-2">+91</span>
              <input
                type="text"
                placeholder="Enter Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center mb-4">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-400">Notify me for any updates & offers</span>
            </div>
            <button
              onClick={handleMobileSubmit}
              className="w-full bg-blue-500 text-white rounded-lg px-4 py-2"
            >
              Submit
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              I accept that I have read & understood Gokwik's <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-400 hover:underline">T&Cs</a>.
            </p>
            <p className="text-xs text-gray-400 mt-2 text-center">
              <a href="#" className="text-blue-400 hover:underline">Trouble logging in?</a>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-gray-400 mb-4">We have sent a verification code to {mobileNumber}</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[...Array(4)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-full text-center border border-gray-700 rounded-lg px-2 py-2 bg-transparent text-white focus:outline-none"
                  value={otp[index] || ''}
                  onChange={(e) => {
                    const newOtp = otp.split('');
                    newOtp[index] = e.target.value;
                    setOtp(newOtp.join(''));
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleOtpSubmit}
              className="w-full bg-green-500 text-white rounded-lg px-4 py-2"
            >
              Verify
            </button>
            <p className="text-sm text-gray-400 mt-4 text-center">
              <button className="text-blue-400 hover:underline">Resend OTP</button>
            </p>
            <p className="text-xs text-gray-400 mt-2 text-center">
              <a href="#" className="text-blue-400 hover:underline">Trouble logging in?</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;