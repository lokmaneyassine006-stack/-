import React from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  X, Headphones, Gauge, Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AudioPlayerBar: React.FC = () => {
  const { 
    audioState, 
    pauseAudio, 
    resumeAudio, 
    stopAudio, 
    setAudioRate 
  } = useStore();

  if (!audioState.bookId && !audioState.isPlaying && !audioState.isPaused) {
    return null;
  }

  const rates = [0.8, 1.0, 1.25, 1.5, 2.0];

  const handleRateChange = () => {
    const currentIndex = rates.indexOf(audioState.playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setAudioRate(rates[nextIndex]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border-t border-stone-800 shadow-2xl px-4 py-3 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Book & Track Metadata */}
        <div className="flex items-center gap-3 min-w-0 max-w-xs sm:max-w-sm">
          {audioState.coverUrl ? (
            <img
              src={audioState.coverUrl}
              alt=""
              className="w-10 h-12 object-cover rounded-lg shadow-md shrink-0 border border-stone-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate">
              {audioState.bookTitle || 'مشغل الصوت الذكي'}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-400 truncate font-medium">
              <span>{audioState.chapterTitle || 'قراءة صوتية (TTS Engine)'}</span>
              {audioState.isPlaying && (
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-2.5 bg-teal-400 animate-pulse rounded-full" />
                  <span className="w-1 h-3.5 bg-amber-400 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-1.5 bg-teal-400 animate-pulse delay-150 rounded-full" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls Center */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (audioState.isPlaying) {
                pauseAudio();
              } else {
                resumeAudio();
              }
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            {audioState.isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Right Tools: Speed Switcher & Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rate Switcher Button */}
          <button
            onClick={handleRateChange}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="سرعة القراءة"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>{audioState.playbackRate}x</span>
          </button>

          {/* Dismiss Player */}
          <button
            onClick={stopAudio}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="إيقاف وإغلاق المشغل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
