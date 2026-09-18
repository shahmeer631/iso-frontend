// "use client";
// import { Brain, Search, Sparkles, LogOut } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter, useParams } from 'next/navigation';
// import { useDispatch } from 'react-redux';
// import { logOut } from '@/lib/redux/features/auth/authSlice';

// const Sidebar = () => {
//   const pathname = usePathname();
//   const { lang } = useParams() as { lang: string };
//   const dispatch = useDispatch();
//   const router = useRouter();

//   const handleLogout = () => {
//     dispatch(logOut());
//     document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
//     router.push(`/${lang}/auth/login`);
//   };

//   const navItems = [
//     { name: 'ISO Navigator', icon: Brain, href: `/${lang}/ai-assistant/iso-navigator` },
//     { name: 'Audit Lens', icon: Search, href: `/${lang}/ai-assistant/audit-lens` },
//     { name: 'Benchmark AI', icon: Sparkles, href: `/${lang}/ai-assistant/benchmark-ai` },
//   ];

//   return (
//     <aside className="h-full  bg-[#0F172A] text-white flex flex-col p-4 justify-between">
//       <div>
//         <div className="space-y-2 mt-4">
//           {navItems.map((item) => (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                 pathname === item.href ? 'bg-[#6366F1]' : 'hover:bg-slate-800'
//               }`}
//             >
//               <item.icon size={20} />
//               <span className="font-medium">{item.name}</span>
//             </Link>
//           ))}
//         </div>

//         <div className="mt-8 pt-8 border-t border-slate-700">
//           <p className="text-xs text-slate-400 mb-3 px-2">Free Trial Usage</p>
//           <div className="bg-white rounded-lg p-3 text-slate-900">
//              <div className="flex justify-between text-[10px] font-bold mb-1">
//                 <span>1000 words</span>
//                 <span className="text-slate-400 font-normal text-[9px]">1000 limit</span>
//              </div>
//              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
//                 <div className="bg-indigo-600 h-full w-full" />
//              </div>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={handleLogout}
//         className="flex items-center gap-3 px-4 py-3 mb-10 bg-white text-red-500 rounded-lg font-medium hover:bg-slate-100 transition-colors cursor-pointer"
//       >
//         <LogOut size={18} />
//         Logout
//       </button>
//     </aside>
//   );
// };

// export default Sidebar;
