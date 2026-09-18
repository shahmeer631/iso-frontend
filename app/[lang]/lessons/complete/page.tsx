import React from 'react';
import { Award, Download, Search } from 'lucide-react';

const CertificatePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      {/* Outer Dotted Container */}
      <div className="w-full max-w-2xl  p-4 md:p-8 bg-white relative">
        
        {/* Top Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-full mb-4">
            <Award className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Course Completed!</h1>
          <p className="text-gray-500 mt-1">Congratulations on completing all lessons</p>
        </div>

        {/* Inner Certificate Card */}
        <div className="border-2 border-indigo-500 rounded-xl p-6 md:p-12 relative overflow-hidden bg-white shadow-sm">
          
          <div className="flex flex-col items-center text-center">
            {/* Logo Placeholder */}
            <div className="bg-indigo-600 text-white font-bold px-3 py-1 rounded text-sm mb-6">
              IB
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 uppercase tracking-tight">
              Certificate of Completion
            </h2>
            <p className="text-xs text-gray-400 mb-8">Continuing Professional Development (CPD)</p>
            
            <p className="text-sm text-gray-500 italic mb-2">This is to certify that</p>
            <h3 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-4">John Doe</h3>
            <p className="text-sm text-gray-500 mb-2">has successfully completed</p>
            <h4 className="text-lg md:text-xl font-bold text-slate-800 mb-8">
              ISO 9001:2015 Quality Management Systems
            </h4>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Date Completed</p>
                <p className="text-sm font-bold text-gray-700">Feb 14, 2026</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">CPD Hours</p>
                <p className="text-sm font-bold text-gray-700">12 Hours</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Certificate ID</p>
                <p className="text-sm font-bold text-gray-700">IB-2026-0142</p>
              </div>
            </div>

            {/* Bottom Signature Section */}
            <hr className="w-full border-gray-100 mb-8" />
            
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
              <div className="text-center">
                <div className="w-32 border-t-2 border-gray-400 mb-2 mx-auto"></div>
                <p className="text-[10px] font-bold text-gray-700">Course Director</p>
                <p className="text-[10px] text-gray-400 underline italic">ISOBrain.ai</p>
              </div>
              
              <div className="bg-indigo-600 p-2 rounded-full">
                <Award className="text-white w-6 h-6" />
              </div>

              <div className="text-center">
                <div className="w-32 border-t-2 border-gray-400 mb-2 mx-auto"></div>
                <p className="text-[10px] font-bold text-gray-700">Director</p>
                <p className="text-[10px] text-gray-400">February 14, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition">
            <Download size={18} />
            Download Certificate
          </button>
          <button className="flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition">
            Browse More Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;