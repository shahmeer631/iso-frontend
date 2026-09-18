

export default function RefundCancellationPolicy() {
  return (
    <main className="min-h-screen bg-[#050506] text-white selection:bg-indigo-500/30">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="fixed top-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-32 lg:px-8 z-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6 leading-tight">
              ISOBrain.AI No Refund & Cancellation Policy
            </h1>
            <p className="text-lg text-[#A1A1A6] leading-relaxed">
              By accessing, signing up for a free trial, or purchasing a subscription on Isobrain (https://isobrain.ai/), you acknowledge and agree to the following No Refund and Cancellation Policy.
              <br /><br />
              <strong className="text-red-400">This policy is strictly enforced.</strong>
            </p>
          </div>

          <div className="space-y-12 text-[#A1A1A6] leading-relaxed">

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">1. Strictly No Refunds</h2>
              <p className="mb-4">
                All subscription charges are 100% non-refundable once processed. We do not offer refunds, partial refunds, or prorated refunds for any active subscription or unused time, regardless of whether you have logged in or utilized the services during the billing period.
              </p>
              <p className="mb-4 text-white font-medium">This strict no-refund policy applies to:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Charges processed immediately after the expiration of the 7-day free trial.</li>
                <li>Charges processed for subsequent monthly or annual recurring billing cycles.</li>
              </ul>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">2. 7-Day Free Trial & Automatic Billing</h2>
              <p className="mb-4">
                We offer a 7-day free trial for new users to evaluate our platform. By entering your payment information to start the free trial, you authorize Isobrain to automatically charge your payment method at the end of the 7-day period for the subscription package you selected (details available at <a href="https://isobrain.ai/pricing" className="text-indigo-400 hover:text-indigo-300 transition-colors">https://isobrain.ai/pricing</a>).
              </p>
              <p>
                It is solely the customer's responsibility to cancel the trial before the 7 days expire if they do not wish to be charged. Claims of "forgetting to cancel," "not realizing the trial was ending," or "being unaware of the cancellation policy" are not valid grounds for a refund.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">3. How to Cancel Your Subscription</h2>
              <p className="mb-4">
                We have made cancellation entirely self-serve and transparent. You can cancel your free trial or active subscription at any time without having to contact customer support.
              </p>
              <p className="mb-4 text-white font-medium">To cancel, please use one of the following methods:</p>
              <ol className="list-decimal pl-6 space-y-4 mb-6">
                <li><strong className="text-white">Student Dashboard:</strong> Log into your Isobrain account, scroll to the bottom section of your Student Dashboard, and click the cancellation option.</li>
                <li><strong className="text-white">Stripe Subscription Page:</strong> Manage or cancel your subscription directly through the secure Stripe billing portal link provided to you upon initial signup.</li>
              </ol>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-200 text-sm">
                  <strong className="text-amber-400">Note:</strong> Deleting your account or uninstalling any associated software does not cancel your subscription. You must use one of the two methods listed above to stop future billing.
                </p>
              </div>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">4. Continued Access After Cancellation</h2>
              <p>
                If you choose to cancel your subscription (or cancel after your free trial has converted to a paid plan), you will not be billed for any future cycles. However, you will retain full access to all tools, features, and limits as per your availed package for the remainder of your current paid subscription period. Your access will automatically expire at the end of your billing cycle.
              </p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4">5. Chargebacks and Bank Disputes</h2>
              <p className="mb-4">
                This policy is agreed to at the time of checkout. Because we provide clear, upfront communication regarding our free trial duration, recurring billing cycles, and self-serve cancellation methods, any disputes or chargebacks filed with your bank or credit card company (such as claims of "fraud," "unrecognized charge," or "unaware of cancellation terms") will be considered a breach of these Terms.
              </p>
              <p>
                In the event of a chargeback, we will submit this agreed-upon policy, alongside our system logs showing your IP address, login history, and timestamped agreement to these terms, to Stripe and your financial institution to successfully contest and settle the dispute.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
