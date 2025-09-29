import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { useEffect, type ReactNode } from 'react';
import { audio } from '@/utils/sound';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  hideHeader?: boolean;
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
  const page: any = usePage();
  const me = page.props?.auth?.user;
useEffect(() => {
  const wantsMusic = !!me?.music_enabled;

  // init with music disabled to avoid autoplay rejection
  audio.init({
    soundEnabled: !!me?.sound_enabled,
    musicEnabled: false,
    musicSrc: '/audio/bgm.mp3',
  });

  audio.registerSfx('correct', '/sounds/correct.mp3');
  audio.registerSfx('wrong', '/sounds/incorrect.mp3');
  audio.registerSfx('click', '/sounds/click.mp3');

  // unlock music on first user interaction
  const unlock = () => {
    if (wantsMusic && typeof audio.setMusicEnabled === 'function') {
      audio.setMusicEnabled(true); // your audio util should start BGM when enabled
    } else {
      // fallback: attempt a play on first gesture, ignore error
      try { (audio as any).play?.('bgm'); } catch {}
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };

  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  return () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
}, [me?.sound_enabled, me?.music_enabled]);


  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {children}
    </AppLayoutTemplate>
  );
}
