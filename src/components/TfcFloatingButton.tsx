import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface TfcFloatingButtonProps {
  onClick: () => void;
}

export const TfcFloatingButton: React.FC<TfcFloatingButtonProps> = ({ onClick }) => {
  const { audioState } = useStore();
  const isAudioActive = Boolean(audioState.bookId || audioState.isPlaying || audioState.isPaused);

  return (
    <button
      id="tfc-floating-launcher-btn"
      onClick={onClick}
      className={`fixed ${
        isAudioActive ? 'bottom-20 sm:bottom-22' : 'bottom-5 sm:bottom-6'
      } left-4 sm:left-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white shadow-xl shadow-teal-950/30 border border-teal-400/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer`}
      title="اسأل TFC: مرشد الذكاء الاصطناعي لشرح كافة مزايا الموقع"
      aria-label="فتح مرشد الذكاء الاصطناعي TFC"
    >
      <div className="relative">
        <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
          <Bot className="w-4 h-4" />
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
      </div>

      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1">
          <span className="font-black text-xs sm:text-sm tracking-tight">
            مرشد TFC الذكي
          </span>
          <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
        </div>
        <span className="text-[10px] text-teal-100/80 font-medium hidden sm:block">
          دليل المزايا والاستخدام
        </span>
      </div>
    </button>
  );
};
