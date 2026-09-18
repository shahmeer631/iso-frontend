// components/LessonSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // or your own classnames helper
import Image from "next/image";
import icon from '@/public/library/Icon (4).png'

interface Lesson {
  slug: string;
  title: string;
  duration?: string;
  isActive?: boolean;
}

interface Props {
  lessons: Lesson[];
  courseId: string;
}

export default function LessonSidebar({ lessons, courseId }: Props) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 h-screen bg-[#E5E7EB] overflow-y-auto p-4">
      <div className="mt-8">
        <Link href={`/quality-managemant`} className="text-sm text-brand-cyan hover:underline">
          ← Back to Course
        </Link>
      </div>
      <h2 className="mb-6 text-xl font-semibold mt-4">Lessons</h2>

      <div className="space-y-1">
        {lessons.map((lesson) => {
          const isActive = pathname.endsWith(lesson.slug);
          return (
            <Link
              key={lesson.slug}
              href={`/lessons/${lesson.slug}`}
              className={cn(
                "group flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : " text-gray-800"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  isActive ? " text-blue-600" : ""
                )}>
                  <Image
                    src={icon}
                    alt="icon"

                  />
                </span>
                <span className="font-medium">{lesson.title}</span>
              </div>
              {lesson.duration && (
                <span className={cn("text-xs", isActive ? "text-blue-100" : "text-gray-500")}>
                  {lesson.duration}
                </span>
              )}
            </Link>
          );
        })}
      </div>


    </div>
  );
}