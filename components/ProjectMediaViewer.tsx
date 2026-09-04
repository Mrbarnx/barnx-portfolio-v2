'use client';

import { useState } from 'react';
import type { ProjectImage, ProjectVideo } from '@/data/content';

type Props = {
  images: ProjectImage[];
  video?: ProjectVideo;
  projectTitle: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  tone: string;
};

function embedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = url.searchParams.get('v') ?? (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : null);
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === 'loom.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = parts.find((part, index) => ['share', 'embed'].includes(parts[index - 1]));
      return id ? `https://www.loom.com/embed/${encodeURIComponent(id)}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function ProjectMediaViewer({ images, video, projectTitle, fallbackTitle, fallbackSubtitle, tone }: Props) {
  const [mode, setMode] = useState<'images' | 'video'>('images');
  const [activeImage, setActiveImage] = useState(0);
  const currentImage = images[activeImage];
  const playableVideo = video?.url ? embedUrl(video.url) : null;

  return (
    <section className="projectMediaSection" aria-label={`${projectTitle} media`}>
      <div className="projectMediaControls" aria-label="Choose project media">
        <button className={mode === 'images' ? 'active' : ''} type="button" onClick={() => setMode('images')} aria-pressed={mode === 'images'}>Images</button>
        {video?.url ? <button className={mode === 'video' ? 'active' : ''} type="button" onClick={() => setMode('video')} aria-pressed={mode === 'video'}>{video.title || 'Watch video'} ▶</button> : null}
        {video?.visibility === 'private' ? <a href="/barnx-studio/automation-systems#consultation">{video.title || 'Request private demo'} ↗</a> : null}
      </div>

      {mode === 'images' ? <>
        <div className={`projectMediaStage ${tone}${currentImage ? ' hasImage' : ''}`}>
          <div className="browser" aria-hidden="true"><i/><i/><i/></div>
          {currentImage
            ? <img src={currentImage.url} alt={currentImage.alt} />
            : <div className="projectMediaFallback"><strong>{fallbackTitle}</strong><small>{fallbackSubtitle}</small></div>}
        </div>
        {currentImage?.caption ? <p className="projectMediaCaption">{currentImage.caption}</p> : null}
        {images.length > 1 ? <div className="projectMediaThumbnails" aria-label="Project screenshots">
          {images.map((image, index) => <button className={index === activeImage ? 'active' : ''} type="button" onClick={() => setActiveImage(index)} aria-label={`View screenshot ${index + 1}`} aria-current={index === activeImage ? 'true' : undefined} key={image.id ?? image.url}>
            <img src={image.url} alt="" />
            <span>{String(index + 1).padStart(2, '0')}</span>
          </button>)}
        </div> : null}
      </> : null}

      {mode === 'video' && video?.url ? <div className="projectVideoStage" style={video.poster ? { backgroundImage: `url(${video.poster.url})` } : undefined}>
        {playableVideo ? <iframe
          src={playableVideo}
          title={`${projectTitle} video demo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        /> : <div className="externalVideoFallback"><strong>This provider opens in a new tab.</strong><p>The CMS embeds YouTube, Vimeo and Loom. Other secure video links remain external.</p><a href={video.url} target="_blank" rel="noreferrer">Open video demo ↗</a></div>}
      </div> : null}
    </section>
  );
}
