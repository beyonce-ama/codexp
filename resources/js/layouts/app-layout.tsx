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
    audio.init({
      soundEnabled: !!me?.sound_enabled,
      musicEnabled: !!me?.music_enabled,
      musicSrc: '/audio/bgm.mp3',
    });

    audio.registerSfx('correct', '/sounds/correct.mp3');
    audio.registerSfx('wrong', '/sounds/incorrect.mp3');
    audio.registerSfx('click', '/sounds/click.mp3');
  }, [me?.sound_enabled, me?.music_enabled]);

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {children}
    </AppLayoutTemplate>
  );
}
