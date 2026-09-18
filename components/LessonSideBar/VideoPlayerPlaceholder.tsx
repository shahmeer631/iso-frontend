import ReactPlayer from "react-player";
export default function VideoPlayerPlaceholder({ title,  }: { title: string,  }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-white">
        
    <iframe
  width="100%"
  height="700px"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="YouTube video"
  allow="encrypted-media"
  allowFullScreen
/>

    </div>
  );
}