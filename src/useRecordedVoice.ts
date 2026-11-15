import { useEffect, useRef, useState } from 'react';
import { recordingUrl, type MascotRecording } from './mascotVoice';

export function useRecordedVoice(recording: MascotRecording, enabled: boolean, onEnd: () => void) {
  const end = useRef(onEnd);
  end.current = onEnd;
  const [error, setError] = useState('');
  useEffect(() => {
    setError('');
    if (!enabled) return;
    let active = true;
    const player = new Audio(recordingUrl(recording));
    player.onended = () => { if (active) end.current(); };
    const failed = () => {
      if (active) setError('Audio could not play. Toggle Voice to retry; the matching transcript remains visible.');
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
      player.onended = player.onerror = null;
      player.pause();
      player.removeAttribute('src');
      player.load();
    };
  }, [recording.id, enabled]);
  return error;
}
