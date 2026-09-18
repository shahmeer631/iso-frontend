// app/courses/[courseId]/lessons/layout.tsx

import LessonSidebar from "@/components/LessonSideBar/LessonSidebar";
import type { ReactNode } from "react";


interface LessonsLayoutProps {
  children: ReactNode;
  params?: Promise<{ lang?: string; courseId?: string }> | { lang?: string; courseId?: string };
}

export default function LessonsLayout({ children, params }: any) {
  // You can fetch course data here if needed (lessons list, title, etc.)
  const courseLessons = [
    { slug: "1", title: "Lesson 1 — Introduction to the Standard", duration: "14:20", isActive: true },
    { slug: "2", title: "Lesson 2 — Core Principles", duration: "9:15" },
    { slug: "3", title: "Lesson 3 — Scope and Application", duration: "12:40" },
    { slug: "4", title: "Lesson 4 — Key Requirements", duration: "10:55" },
    { slug: "5", title: "Lesson 5 — Documentation", duration: "8:40" },
    { slug: "6", title: "Lesson 6 — Implementation Strategy", duration: "14:10" },
  ];

  return (
    <div className="min-h-screen bg-[#fff]">
      <div className="flex">
        {/* Left Sidebar – Lessons List */}
        <aside className="hidden w-80 shrink-0 border-r border-gray-200 lg:block">
          <LessonSidebar
            lessons={courseLessons}
            courseId={params.courseId}
          />
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          {children}
        </main>

        {/* Optional right sidebar / extra info – can be conditional or empty */}
        {/* <aside className="w-72 hidden xl:block border-l">Right panel</aside> */}
      </div>
    </div>
  );
}