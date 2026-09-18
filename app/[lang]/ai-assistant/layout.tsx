// import Sidebar from "@/components/AIAssistant/Sidebar";
import Footer from "@/sheard/Footer";
import Navbar from "@/sheard/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (<>
    <div className="">
      <Navbar />
    </div>
    <div className="flex min-h-screen bg-[#12141D]">
      {/* Sidebar */}
      {/* <aside className="w-64  bg-white border-r hidden md:block">
        <Sidebar />
      </aside> */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="overflow-auto bg-[#12141D]">{children}</div>
      </main>
    </div>
    <div className="">
      <Footer />
    </div>

  </>
  );
}
