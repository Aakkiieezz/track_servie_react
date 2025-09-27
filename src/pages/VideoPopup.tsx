import { useState } from "react";

type VimeoPopupProps = {
  videoSite: string;
  videoKey: string;
};

const VideoPopup: React.FC<VimeoPopupProps> = ({ videoSite, videoKey }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={() => setIsOpen(true)}
      >
        Watch Trailer
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <iframe
              className="w-full aspect-video rounded"
              src={
                videoSite === "YouTube"
                  ? `https://www.youtube.com/embed/${videoKey}?autoplay=1`
                  : `https://player.vimeo.com/video/${videoKey}?autoplay=1`
              }
              title="Trailer"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPopup;
