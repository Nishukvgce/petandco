import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const PincodeModal = ({ isOpen, onClose, onSave }) => {
    const [pincode, setPincode] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pincode.trim().length === 6) {
            onSave(pincode.trim());
            setPincode('');
        }
    };

    const handleLogin = () => {
        onClose();
        navigate('/user-login');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-md p-6 relative animate-in slide-in-from-bottom duration-200 sm:fade-in sm:zoom-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <Icon name="X" size={24} />
                </button>

                <div className="text-center space-y-4 pt-2">
                    <h2 className="text-lg text-gray-800 font-medium sm:font-normal">
                        Choose a delivery location to check product<br className="hidden sm:block" /> availability and find your nearest store.
                    </h2>

                    <div className="py-2">
                        <button
                            onClick={handleLogin}
                            className="text-[#ff7a00] hover:underline font-medium"
                        >
                            Log in to see your address
                        </button>
                        <div className="text-[#ff7a00] my-2">or</div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2 pb-4 sm:pb-0">
                        <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff7a00]">
                                <Icon name="MapPin" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter pin code"
                                value={pincode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setPincode(val);
                                }}
                                className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] bg-gray-50/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={pincode.length !== 6}
                            className="bg-[#ff7a00] text-white px-6 sm:px-8 py-3 sm:py-2 rounded-lg hover:bg-[#ff7a00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                        >
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PincodeModal;
