// resources/js/layouts/app-header-layout.tsx
import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppHeaderLayout({
  children,
  breadcrumbs,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  const { props } = usePage() as any;
  const musicEnabled: boolean = !!props?.auth?.user?.music_enabled;

  // keep a single audio element instance for the whole app
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const triedPlayRef = useRef(false); // to avoid looping retries

  // create the audio element once
  useEffect(() => {
    if (!bgMusicRef.current) {
      const el = new Audio('/audio/bgm.mp3'); // put your mp3 at public/audio/bgm.mp3
      el.loop = true;
      el.volume = 0.3;
      bgMusicRef.current = el;
    }
    return () => {
      // optional: don't fully destroy so navigation keeps music, but if this layout ever unmounts:
      bgMusicRef.current?.pause();
    };
  }, []);

  // helper to try playing (handles autoplay policy)
  const tryPlay = async () => {
    if (!bgMusicRef.current) return;
    try {
      await bgMusicRef.current.play();
    } catch {
      // wait for user gesture to unlock
      if (!triedPlayRef.current) {
        triedPlayRef.current = true;
        const unlock = () => {
          bgMusicRef.current?.play().catch(() => {});
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
      }
    }
  };

  // react to the user setting (Inertia shared props) changing
  useEffect(() => {
    if (!bgMusicRef.current) return;
    if (musicEnabled) {
      tryPlay();
    } else {
      bgMusicRef.current.pause();
      // keep time at 0 so when re-enabled, it starts from the top (or remove this if you prefer resume)
      bgMusicRef.current.currentTime = 0;
    }
  }, [musicEnabled]);

  // OPTIONAL: live update without page reload — listen for a custom event
  // Fire this anywhere after saving settings:
  // window.dispatchEvent(new CustomEvent('app:music-setting', { detail: { enabled: true } }))
  useEffect(() => {
    const onSetting = (e: Event) => {
      const enabled = (e as CustomEvent).detail?.enabled;
      if (typeof enabled !== 'boolean' || !bgMusicRef.current) return;
      if (enabled) tryPlay();
      else {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
    window.addEventListener('app:music-setting', onSetting as any);
    return () => window.removeEventListener('app:music-setting', onSetting as any);
  }, []);

  return (
    <AppShell>
      {/* Header can still show the toggle; this layout just owns the audio */}
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent>{children}</AppContent>
    </AppShell>
  );
}
