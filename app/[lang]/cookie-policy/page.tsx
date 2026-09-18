

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-[#050506] text-white selection:bg-indigo-500/30">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-32 lg:px-8 z-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              Cookie Policy
            </h1>
            <p className="text-lg text-[#A1A1A6] leading-relaxed">
              This Cookie Policy explains how Isobrain ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website (https://isobrain.ai/), use our student dashboard, and interact with our AI Services. This policy explains what these technologies are, why we use them, and your rights to control our use of them.
            </p>
          </div>

          <div className="space-y-12 text-[#A1A1A6] leading-relaxed">

            {/* Section 1 */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by online service providers to facilitate and help make websites work efficiently, enhance security, and provide reporting information.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">First-party cookies:</strong> Cookies set by the website owner (Isobrain).</li>
                <li><strong className="text-white">Third-party cookies:</strong> Cookies set by parties other than the website owner (such as our payment processor, Stripe, or analytics providers).</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
              <p className="mb-6">
                We use first-party and third-party cookies for several reasons. Some cookies are strictly necessary for our platform to operate, especially regarding user authentication and secure billing. We classify our cookies into the following categories:
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">A. Essential (Strictly Necessary) Cookies</h3>
                  <p className="mb-3">These cookies are critical to the core operation of Isobrain. They cannot be disabled in our systems. We rely on them to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Keep you securely logged into your Student Dashboard.</li>
                    <li>Maintain your session state as you interact with our AI tools.</li>
                    <li>Process secure subscription transactions through our payment gateway (Stripe).</li>
                    <li>Remember your agreement to our Terms of Service and No Refund Policy during checkout.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">B. Performance and Analytics Cookies</h3>
                  <p className="mb-3">These cookies collect information about how you use our website, such as which pages you visit most often or if you encounter error messages. They help us understand site traffic and usage patterns so we can improve the Isobrain experience.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Note: This data is aggregated and does not personally identify you.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">C. Functionality Cookies</h3>
                  <p>These cookies allow our website to remember choices you make (such as your preferred language, region, or visual preferences) and provide enhanced, more personal features.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">D. Third-Party Cookies</h3>
                  <p className="mb-3">In some cases, we use cookies provided by trusted third parties.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">Stripe:</strong> Our payment processor uses essential cookies to ensure fraud prevention, manage your 7-day free trial, and facilitate secure recurring billing.</li>
                    <li><strong className="text-white">Analytics Providers:</strong> We may use services like Google Analytics to help us understand how users engage with our site.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">3. How to Manage and Control Cookies</h2>
              <p className="mb-4">
                You have the right to decide whether to accept or reject cookies. While you cannot opt out of Essential Cookies (as they are required to provide the service), you can manage your preferences for other types of cookies.
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong className="text-white">Browser Settings:</strong> You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, but your access to certain functionality (like maintaining an active login session on the dashboard) may be severely restricted.
                </li>
                <li>
                  To learn how to manage cookies on popular browsers, visit:
                  <ul className="list-[circle] pl-6 mt-2 space-y-1">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Google Chrome</a></li>
                    <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Apple Safari</a></li>
                    <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Mozilla Firefox</a></li>
                    <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Microsoft Edge</a></li>
                  </ul>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">4. Updates to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                <br /><br />
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
            </section>

            {/* Section 5 */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
              <p className="mb-4">If you have any questions about our use of cookies or other technologies, please contact us at:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <strong className="text-white">Email:</strong>
                  <a href="mailto:hello@isobrain.ai" className="text-indigo-400 hover:text-indigo-300 transition-colors">hello@isobrain.ai</a>
                </li>
                <li className="flex items-center gap-2">
                  <strong className="text-white">Website:</strong>
                  <a href="https://isobrain.ai/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">https://isobrain.ai/</a>
                </li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
