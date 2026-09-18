import Link from 'next/link'
import React from 'react'
import image1 from '@/public/library/Container1.png'
import image2 from '@/public/library/Container2.png'
import image3 from '@/public/library/Container3.png'
import image4 from '@/public/library/Container4.png'

import image5 from '@/public/library/Margin.png'
import image6 from '@/public/library/Margin (1).png'
import image7 from '@/public/library/Background.png'
import Image from 'next/image'


const QualityManagement = () => {
  return (
    <div className="text-gray-100">
      {/* Header / Back bar */}
      <div className="pt-16 bg-[#111827] border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Link
              href="/library"
              className="inline-flex items-center text-white  text-sm font-medium transition-colors"
            >
              ← Back to Platform
            </Link>
          </div>
        </div>
        {/* Hero / Title Section */}
      <div className="bg-[#111827] ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            ISO 9001 — Quality Management
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl">
            Master quality management systems that meet customer and regulatory requirements.
          </p>
        </div>
      </div>
      </div>

      

      {/* Main Content - Course Modules */}
      <div className="max-w-7xl bg-white mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1 */}
          <div className="flex backdrop-blur-sm border border-[#E5E7EB] rounded-xl p-6  transition-all duration-300 group">
            <div className="flex  mb-4 gap-5">
              <div className="w-12 h-12 mr-4 rounded-lg bg-indigo-600/20 flex items-center justify-center text-2xl">
               <Image 
              src={image1}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
              
            </div>
              <div>
                <h3 className="text-xl font-semibold text-black">Requirements</h3>
            <p className=" mb-5 text-black">
              Understand the core requirements and clauses of the standard
            </p>
              <span className="text-sm  text-black">8 lessons</span>
               <div className="flex items-center justify-end">
              <Link
                href='/lessons'
                className="text-indigo-600  font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Start Course →
              </Link>
            </div>
              </div>
           
          </div>

          {/* Card 2 */}
          <div className="flex backdrop-blur-sm border border-[#E5E7EB] rounded-xl p-6  transition-all duration-300 group">
            <div className="flex  mb-4 gap-5">
              <div className="w-12 h-12 mr-4 rounded-lg bg-indigo-600/20 flex items-center justify-center text-2xl">
              <Image 
              src={image2}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
            </div>
              <div>
                <h3 className="text-xl font-semibold text-black">Requirements</h3>
            <p className=" mb-5 text-black">
              Understand the core requirements and clauses of the standard
            </p>
              <span className="text-sm  text-black">8 lessons</span>
               <div className="flex items-center justify-end">
              <Link
                href="/lessons"
                className="text-indigo-600  font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Start Course →
              </Link>
            </div>
              </div>
           
          </div>

          {/* Card 3 */}
          <div className="flex backdrop-blur-sm border border-[#E5E7EB] rounded-xl p-6  transition-all duration-300 group">
            <div className="flex  mb-4 gap-5">
              <div className="w-12 h-12 mr-4 rounded-lg bg-indigo-600/20 flex items-center justify-center text-2xl">
                <Image 
              src={image3}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
            </div>
              <div>
                <h3 className="text-xl font-semibold text-black">Requirements</h3>
            <p className=" mb-5 text-black">
              Understand the core requirements and clauses of the standard
            </p>
              <span className="text-sm  text-black">8 lessons</span>
               <div className="flex items-center justify-end">
              <Link
                 href="/lessons"
                className="text-indigo-600  font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Start Course →
              </Link>
            </div>
              </div>
           
          </div>

          {/* Card 4 */}
           <div className="flex backdrop-blur-sm border border-[#E5E7EB] rounded-xl p-6  transition-all duration-300 group">
            <div className="flex  mb-4 gap-5">
              <div className="w-12 h-12 mr-4 rounded-lg bg-indigo-600/20 flex items-center justify-center text-2xl">
               <Image 
              src={image4}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
            </div>
              <div>
                <h3 className="text-xl font-semibold text-black">Requirements</h3>
            <p className=" mb-5 text-black">
              Understand the core requirements and clauses of the standard
            </p>
              <span className="text-sm  text-black">8 lessons</span>
               <div className="flex items-center justify-end">
              <Link
                 href="/lessons"
                className="text-indigo-600  font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Start Course →
              </Link>
            </div>
              </div>
           
          </div>
        </div>

        {/* Explore More Section */}
        <div className="mt-16 md:mt-20">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-black text-center mb-3 leading-[1.2] tracking-tight">
            Explore More ISOBrain Features
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Discover additional tools designed to support your journey.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className=" border text-left border-gray-200 rounded-xl p-6  hover:border-indigo-700/40 transition-all duration-300">
              <div className="w-14 h-14  mb-5 rounded-full bg-indigo-900/30 flex items-center justify-center text-3xl">
                <Image 
              src={image5}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">ISO Platform</h3>
              <p className="text-gray-400 mb-5 text-sm">
                Browse structured ISO standards and learning paths.
              </p>
              <Link
                 href="/library"
                className="text-indigo-400  font-medium text-sm inline-flex items-center gap-1"
              >
                Explore Platform →
              </Link>
            </div>

            {/* Feature 2 */}
           <div className=" border text-left border-gray-200 rounded-xl p-6  hover:border-indigo-700/40 transition-all duration-300">
              <div className="w-14 h-14  mb-5 rounded-full bg-indigo-900/30 flex items-center justify-center text-3xl">
                <Image 
              src={image6}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">ISO Assistant</h3>
              <p className="text-gray-400 mb-5 text-sm">
               Use AI to interpret clauses, generate
insights and simplify compliance.
              </p>
              <Link
                href="/lesson"
                className="text-indigo-400  font-medium text-sm inline-flex items-center gap-1"
              >
                Open ISO Assistant →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className=" border text-left border-gray-200 rounded-xl p-6  hover:border-indigo-700/40 transition-all duration-300">
              <div className="w-14 h-14  mb-5 rounded-full bg-indigo-900/30 flex items-center justify-center text-3xl">
                <Image 
              src={image7}
              alt='icon'
              width={56}
              height={56}
              />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">ISO Assessment</h3>
              <p className="text-gray-400 mb-5 text-sm">
                Take role-based assessments and measure
your competency.
              </p>
              <Link
                href="/mastery-lab"
                className="text-indigo-400  font-medium text-sm inline-flex items-center gap-1"
              >
                Start Assessment →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QualityManagement
