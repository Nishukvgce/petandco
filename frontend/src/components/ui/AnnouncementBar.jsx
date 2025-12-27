import React, { useState } from 'react';
import Icon from '../AppIcon';

const AnnouncementBar = ({ isVisible = true, onClose }) => {
  const [isOpen, setIsOpen] = useState(isVisible);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 relative z-[1000]">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="font-caption text-sm font-medium">
            <span className="hidden sm:inline">🎉 Free shipping on orders above ₹499 | Use code </span>
            <span className="font-data font-bold">FLAT10</span>
            <span className="hidden sm:inline"> for 10% off on first order</span>
            <span className="sm:hidden">Free shipping ₹499+ | Code: FLAT10</span>
          </p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 p-1 hover:bg-primary/80 rounded-full transition-colors duration-200"
          aria-label="Close announcement"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;