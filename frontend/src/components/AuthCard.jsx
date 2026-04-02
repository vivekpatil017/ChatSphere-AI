import React from "react";

const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-cyan-500/5 transition-all duration-500 hover:shadow-cyan-500/10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

          {title}
        </h2>
        <p className="text-gray-400 mt-2 font-light">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

export default AuthCard;
