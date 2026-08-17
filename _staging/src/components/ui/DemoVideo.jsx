import { useState } from 'react';
import Icon from './icons';

/**
 * Polished, always-looping instructional clip — presented as part of the
 * clinical instruction UI, not as a media player. No native controls, no
 * scrubber: it autoplays muted and loops, exactly like a GIF would, with a
 * small caption chip identifying it as a demonstration. Falls back to a
 * clean placeholder if the clip can't load instead of a broken video box.
 */
export default function DemoVideo({ src, label = 'Watch the movement', caption, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  const aspect = size === 'wide' ? 'aspect-[4/3]' : 'aspect-[3/4]';

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-stage ${className}`}>
      <div className={`relative ${aspect} w-full`}>
        {src && !failed ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={label}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <Icon name="video" className="h-6 w-6 text-stage-fg-soft" />
            <p className="text-xs text-stage-fg-soft">Demonstration unavailable</p>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur">
          <Icon name="play" className="h-3 w-3" />
          {label}
        </span>
      </div>
      {caption && (
        <p className="border-t border-white/10 bg-stage-soft px-3.5 py-2.5 text-[12px] leading-relaxed text-stage-fg-soft">
          {caption}
        </p>
      )}
    </div>
  );
}
