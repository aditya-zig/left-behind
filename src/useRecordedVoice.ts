import { useEffect, useRef, useState } from 'react';
import { recordingUrl, type MascotRecording } from './mascotVoice';

export function useRecordedVoice(recording: MascotRecording | undefined, enabled: boolean, onEnd: () => void) {
  const end = useRef(onEnd);
  end.current = onEnd;
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setError(''); setSpeaking(false); setProgress(0);
    if (!enabled || !recording) return;
    let active = true;
    const player = new Audio(recordingUrl(recording));
    player.onplaying = () => { if (active) setSpeaking(true); };
    player.onpause = () => { if (active) setSpeaking(false); };
    player.ontimeupdate = () => { if (active && player.duration) setProgress(player.currentTime / player.duration); };
    player.onended = () => { if (active) { setSpeaking(false); setProgress(1); end.current(); } };
    const failed = () => {
      if (active) { setSpeaking(false); setError('Audio could not play. Toggle narration to retry; the matching transcript remains visible.'); }
    };
    player.onerror = failed;
    const play = () => { void player.play().catch(failed); };
    const visibility = () => {
      if (document.hidden) player.pause();
      else if (!player.ended) play();
    };
    document.addEventListener('visibilitychange', visibility);
    if (!document.hidden) play();
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', visibility);
      player.onended = player.onerror = player.onplaying = player.onpause = player.ontimeupdate = null;
      player.pause(); player.removeAttribute('src'); player.load();
    };
  }, [recording?.id, enabled]);
  return { error, speaking, progress };
}
