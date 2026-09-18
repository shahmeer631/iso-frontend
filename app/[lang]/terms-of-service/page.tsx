

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-lg text-[#A1A1A6] leading-relaxed">
              Welcome to Isobrain ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website (https://isobrain.ai/), the student dashboard, AI tools, and all related services (collectively, the "Services").
              <br /><br />
              By creating an account, starting a free trial, or using our Services, you agree to be bound by these Terms. If you do not agree, please do not use Isobrain.
            </p>
          </div>

          <div className="space-y-12 text-[#A1A1A6] leading-relaxed">

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">1. Description of Service</h2>
              <p>
                Isobrain provides AI-powered educational and productivity tools accessed via a web-based student dashboard. Our Services are designed to generate text, solve problems, and provide information based on user inputs ("Prompts"). The Services are continually evolving, and we may add, modify, or remove features at our discretion.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">2. Account Registration & Security</h2>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong className="text-white">Eligibility:</strong> You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use our Services.</li>
                <li><strong className="text-white">Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration.</li>
                <li><strong className="text-white">Security:</strong> You are responsible for safeguarding your password and account credentials. You agree to notify us immediately of any unauthorized use of your account. Isobrain is not liable for any losses caused by unauthorized access to your account.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">3. Subscriptions, Billing, and Cancellations</h2>
              <p className="mb-4">By subscribing to a paid plan or entering a free trial, you agree to our strictly enforced billing policies:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong className="text-white">7-Day Free Trial:</strong> We offer a 7-day free trial for new users. By providing your payment information, you authorize our payment processor (Stripe) to automatically charge you for your selected subscription package immediately upon the trial's expiration.</li>
                <li><strong className="text-white">Strict No Refund Policy:</strong> All charges are 100% non-refundable. We do not provide refunds or prorated credits for unused time, forgotten cancellations, or mid-cycle terminations.</li>
                <li>
                  <strong className="text-white">Cancellations:</strong> It is entirely your responsibility to manage your subscription. You can cancel your trial or active subscription at any time using one of two methods:
                  <ol className="list-decimal pl-6 mt-2 space-y-1">
                    <li>Via the bottom section of your Student Dashboard on Isobrain.</li>
                    <li>Via the secure Stripe Subscription Page link provided to you.</li>
                  </ol>
                </li>
                <li><strong className="text-white">Post-Cancellation Access:</strong> If you cancel, you will not be billed again, but you will retain full access to your availed package until the end of your current billing cycle.</li>
                <li><strong className="text-white">Please note:</strong> Disputing valid subscription charges with your bank after failing to cancel via the provided methods constitutes a breach of these Terms.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">4. Artificial Intelligence & Output Disclaimer</h2>
              <p className="mb-4">Due to the nature of machine learning and artificial intelligence, the outputs generated by Isobrain ("Outputs") are not guaranteed to be accurate, complete, or reliable.</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong className="text-white">No Professional Advice:</strong> Isobrain is an educational tool. Outputs do not constitute professional medical, legal, financial, or psychological advice.</li>
                <li><strong className="text-white">Verification:</strong> You are solely responsible for evaluating the accuracy and appropriateness of any Output before relying on it or sharing it.</li>
                <li><strong className="text-white">Similar Outputs:</strong> You acknowledge that AI may generate the same or similar Outputs for other Isobrain users who enter similar Prompts.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use Policy</h2>
              <p className="mb-4">You agree not to use Isobrain to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Generate, promote, or distribute illegal, violent, harmful, or sexually explicit content.</li>
                <li>Harass, bully, defame, or discriminate against others.</li>
                <li>Generate malware, spam, or engage in deceptive practices (e.g., phishing).</li>
                <li>Attempt to reverse-engineer, decompile, or scrape the Isobrain platform or its underlying AI models.</li>
                <li>Bypass or manipulate subscription limits, API rate limits, or platform security features.</li>
                <li>Infringe upon the intellectual property rights of any third party.</li>
              </ul>
              <p>We reserve the right to suspend or terminate your account immediately, without notice or refund, if you violate this Acceptable Use Policy.</p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property Rights</h2>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong className="text-white">Our Property:</strong> Isobrain owns all rights, title, and interest in the platform, the student dashboard, original website content, branding, and underlying software.</li>
                <li><strong className="text-white">Your Inputs and Outputs:</strong> To the extent permitted by law, you retain ownership of the Prompts you input into the Service. Isobrain claims no ownership over the Outputs generated specifically for you, allowing you to use them for your personal or commercial educational purposes, provided they comply with these Terms.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">7. Third-Party Services</h2>
              <p>Isobrain utilizes third-party services, such as Stripe for payment processing and external cloud/AI infrastructure providers. Your interactions with these third parties are governed by their respective Terms of Service and Privacy Policies. Isobrain is not responsible for the availability or performance of these external services.</p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="uppercase text-sm tracking-wide leading-relaxed">
                ISOBRAIN IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE FROM HARMFUL COMPONENTS.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p className="uppercase text-sm tracking-wide leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ISOBRAIN, ITS FOUNDERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL RESULTING FROM (A) YOUR USE OF OR INABILITY TO USE THE SERVICE; (B) ANY INACCURATE OUTPUT GENERATED BY THE AI; OR (C) UNAUTHORIZED ACCESS TO YOUR ACCOUNT. IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO ISOBRAIN IN THE PAST 12 MONTHS.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications to the Terms</h2>
              <p>We reserve the right to modify these Terms at any time. If we make material changes, we will provide notice by updating the "Effective Date" at the top of this page or by sending an email to registered users. Your continued use of Isobrain after changes are published constitutes your acceptance of the new Terms.</p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law provisions.</p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
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
