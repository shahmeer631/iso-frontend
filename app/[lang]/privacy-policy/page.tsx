

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-[#A1A1A6] leading-relaxed">
              Welcome to Isobrain ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal information is handled securely and responsibly. This Privacy Policy outlines how we collect, use, share, and protect your data when you visit our website (https://isobrain.ai/) and use our AI tools, student dashboard, and related services (collectively, the "Services").
              <br /><br />
              By accessing or using Isobrain, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </div>

          <div className="space-y-12 text-[#A1A1A6] leading-relaxed">

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-6">1. Information We Collect</h2>
              <p className="mb-6">We collect information directly from you, automatically through your use of our Services, and from third-party services.</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">A. Information You Provide to Us</h3>
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong className="text-white">Account Information:</strong> When you register for a free trial or subscription, we collect your name, email address, and login credentials.</li>
                    <li><strong className="text-white">Payment Information:</strong> If you upgrade to a paid package, your payment details (credit card information, billing address) are collected and processed securely by our third-party payment processor, Stripe. We do not store your full credit card number on our servers.</li>
                    <li><strong className="text-white">User Inputs & AI Interactions:</strong> We collect the text, prompts, queries, and files you submit to our AI tools via the student dashboard in order to generate the requested outputs.</li>
                    <li><strong className="text-white">Communications:</strong> Information you provide when you contact our support team.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-3">B. Information We Collect Automatically</h3>
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong className="text-white">Usage Data:</strong> We collect system logs detailing how you interact with our platform, including login timestamps, features utilized, and subscription status. (Note: This data may be used as proof of service in the event of a billing dispute).</li>
                    <li><strong className="text-white">Device Information:</strong> We automatically record your IP address, browser type, operating system, and device identifiers.</li>
                    <li><strong className="text-white">Cookies and Tracking Technologies:</strong> We use cookies to keep you logged in, remember your preferences, and analyze site traffic.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">To Provide and Maintain the Service:</strong> To operate your student dashboard, generate AI outputs based on your prompts, and manage your subscription level.</li>
                <li><strong className="text-white">Billing and Transactions:</strong> To process payments, manage your 7-day free trial conversions, and prevent fraudulent transactions.</li>
                <li><strong className="text-white">To Improve Our AI and Platform:</strong> To analyze usage trends, troubleshoot bugs, and enhance the functionality of Isobrain. (We do not use your personal prompts or private data to train our foundational AI models.)</li>
                <li><strong className="text-white">To Communicate With You:</strong> To send transactional emails (e.g., password resets, trial expiration warnings, billing receipts) and updates about new Isobrain features.</li>
                <li><strong className="text-white">Legal & Security:</strong> To protect against unauthorized access, enforce our strictly No Refund & Cancellation Policy, and resolve disputes.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Share Your Information</h2>
              <p className="mb-4">We do not sell your personal information to third parties. We only share your data in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Service Providers:</strong> We share necessary data with trusted third parties who help us operate our business, such as cloud hosting providers and our payment processor (Stripe). These providers are bound by strict data protection agreements.</li>
                <li><strong className="text-white">AI Infrastructure Partners:</strong> Depending on the architecture of our AI, your inputs may be processed by third-party language model APIs (e.g., OpenAI, Anthropic). These partners are restricted from using your data for their own independent purposes.</li>
                <li><strong className="text-white">Legal Compliance:</strong> We may disclose your information if required to do so by law, in response to a subpoena, or to protect the rights, property, and safety of Isobrain, our users, or others (including sharing system logs with Stripe and banks to contest unwarranted chargebacks).</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures, including encryption and secure socket layer (SSL) technology, to protect your data during transmission and at rest. While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">5. Your Data Rights & Choices</h2>
              <p className="mb-4">Depending on your location (such as under the GDPR in Europe or CCPA in California), you may have the following rights regarding your data:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Access and Update:</strong> You can access and update your personal information directly within your student dashboard.</li>
                <li><strong className="text-white">Cancellation:</strong> You can cancel your subscription at any time via the bottom section of your student dashboard or via your Stripe billing portal.</li>
                <li><strong className="text-white">Data Deletion:</strong> You may request the deletion of your account and associated personal data by contacting us. Please note that we may retain certain billing records as required by law or for dispute resolution purposes.</li>
                <li><strong className="text-white">Opt-Out:</strong> You may opt out of promotional emails by clicking the "unsubscribe" link at the bottom of our emails. You will still receive essential service and billing notices.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">6. Children’s Privacy</h2>
              <p>
                Isobrain is intended for students and users who are at least 13 years of age (or the minimum age of digital consent in your jurisdiction). We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete such information immediately.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new policy on this page and updating the "Effective Date."
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
              <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at:</p>
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
