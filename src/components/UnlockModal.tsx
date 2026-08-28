import React from 'react';
import { X, HelpCircle, Zap } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnlockModal({ isOpen, onClose, onConfirm }: UnlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with subtle red ambient glow */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Decorative red glow in background */}
      <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#1a1c29] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-white text-center mb-4">
            Must Watch Video Tutorial
          </h2>

          {/* Video Container */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mb-6 relative">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/80kGH1AJDao?si=evjd9s99NkIB0IDc" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>

          <h3 className="text-2xl font-bold text-white text-center mb-6">
            Get for Free
          </h3>

          {/* Instructions Box */}
          <div className="bg-[#1f2235] border border-gray-700/50 rounded-xl p-5 mb-6 text-center">
            <p className="text-gray-300 text-sm leading-relaxed">
              Complete verification to unlock exclusive Study Arc premium content and resources <span className="text-red-400 font-bold">absolutely free!</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button 
              onClick={onConfirm}
              className="w-full bg-[#ff4d4f] hover:bg-[#ff3032] text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(255,77,79,0.4)] transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>GET FOR FREE NOW</span>
              <Zap className="w-5 h-5" />
            </button>

            <button 
              onClick={() => window.open('https://youtu.be/80kGH1AJDao?si=evjd9s99NkIB0IDc', '_blank')}
              className="w-full bg-[#2a2d42] hover:bg-[#343851] text-gray-300 font-medium py-3 px-4 rounded-xl border border-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <HelpCircle className="w-4 h-4 text-[#ff4d4f]" />
              <span>How to Get for Free</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
