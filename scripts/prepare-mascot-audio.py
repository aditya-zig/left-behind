"""Reproduce the corrected clips from the supplied master (standard library only).
Usage: python3 scripts/prepare-mascot-audio.py /path/to/mascot_voice.wav
The master is intentionally not duplicated in the deployed site.
"""
import hashlib
import json
from pathlib import Path
import sys
import wave

root = Path(__file__).resolve().parents[1]
lines = json.loads((root / 'src/mascot-script.json').read_text())
master_path = Path(sys.argv[1])
with wave.open(str(master_path)) as master:
    for line in lines:
        start = round(line['start'] * master.getframerate())
        end = round(line['end'] * master.getframerate())
        master.setpos(start)
        target = root / 'public/audio/mascot' / f"{line['id']}.wav"
        with wave.open(str(target), 'wb') as clip:
            clip.setparams(master.getparams())
            clip.writeframes(master.readframes(end - start))
        assert hashlib.sha256(target.read_bytes()).hexdigest() == line['sha256'], line['id']
print(f'Reproduced and verified {len(lines)} clips.')
