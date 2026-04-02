import React from "react";

const NeonButton = ({ children, onClick, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full relative group overflow-hidden py-4 px-6 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-widest uppercase text-sm shadow-xl shadow-cyan-500/20 active:scale-95 transition-all duration-300 ${className}`}

    >
      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>

      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default NeonButton;
