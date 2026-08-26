'use client';

import { useEffect } from 'react';

export default function ExtraGuideRoadmapLink(){
  useEffect(()=>{
    const addLink=()=>{
      const markdownGuide=document.querySelector<HTMLAnchorElement>('aside a[href="#guide"]');
      if(!markdownGuide || document.querySelector('aside a[href="#extra-guide"]')) return;

      const link=document.createElement('a');
      link.href='#extra-guide';
      link.innerHTML='Extra Guide <span>Preview / DOCX</span>';
      markdownGuide.parentElement?.insertBefore(link,markdownGuide);
    };

    addLink();
    const observer=new MutationObserver(addLink);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  return null;
}
