import React from "react";

const NeonInput = ({ label, type = "text", placeholder, icon, value, onChange, name }) => {
  return (
    <div className="mb-5 group">
      {label && (
        <label className="block text-xs uppercase tracking-widest text-[#A0A0A0] mb-2 font-semibold group-focus-within:text-cyan-400 transition-colors duration-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#1A1A1A] border border-white/5 py-4 ${
            icon ? "pl-12" : "pl-5"
          } pr-5 rounded-xl text-white placeholder:text-gray-600 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300`}
        />
      </div>
    </div>
  );
};

export default NeonInput;
