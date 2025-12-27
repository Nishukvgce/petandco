import React from "react";
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FranchiseBanner() {
  return (
    <motion.section
      className="bg-orange-500 text-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      {/* Left Section */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">Become a Franchisee</h2>
        <p className="text-base md:text-lg opacity-90">Lead the pet care movement in your city</p>
      </div>

      {/* Right Section */}
      <motion.button
        className="bg-white text-orange-500 font-semibold px-5 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 shadow-md hover:bg-orange-100 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = '/franchise-details')}
      >
        Know More <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </motion.section>
  );
}
