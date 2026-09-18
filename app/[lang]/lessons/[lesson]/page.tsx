// app/courses/[courseId]/lessons/[lessonSlug]/page.tsx

import AiToolsSection from "@/components/LessonSideBar/AiToolsSection";
import ChatSection from "@/components/LessonSideBar/ChatSection";
import RelatedStandards from "@/components/LessonSideBar/RelatedStandards";
import VideoPlayerPlaceholder from "@/components/LessonSideBar/VideoPlayerPlaceholder";
import Link from "next/link";




interface Props {
  params: { lessonSlug: string; courseId: string };
}

export default function LessonPage({  }: Props) {
  // In real app → fetch lesson data by slug
  const title = "Lesson 1 — Introduction to the Standard";
// const src = 'https://youtu.be/583MGxjypgU?si=sWbGV0n-kuC0b2vo'
  return (
    <div className="p-6 lg:p-10">
      {/* Video Player - Hero Section */}
      <div className="">
        <div className=" overflow-hidden rounded-xl">
          <VideoPlayerPlaceholder title={title} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Link href={'/lessons/assessment'} className="rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700">
            Complete Lesson
          </Link>
        </div>
      </div>

      {/* AI Learning Tools */}
      <AiToolsSection />

      {/* Chat / Ask AI */}
      <ChatSection />

      {/* Related Standards */}
      <RelatedStandards />
    </div>
  );
}