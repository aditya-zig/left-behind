import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { artifacts } from '../src/data';
import script from '../src/mascot-script.json';
import { recordedStory, journeyRecording, recordingUrl } from '../src/mascotVoice';

test('every mission maps to four ordered recordings and their exact transcripts', () => {
  for (const artifact of artifacts) {
    const lines = recordedStory(artifact);
    assert.equal(lines.length, 4, artifact.id);
    assert.deepEqual(lines.map(line => line.line), [1, 2, 3, 4]);
    assert.ok(lines.every(line => line.section === artifact.world && line.text.length > 0));
  }
});
test('every recording is a local WAV with a matching ID and timestamp duration', () => {
  assert.equal(new Set(script.map(line => line.id)).size, script.length);
  for (const line of script) {
    assert.equal(line.audio, `audio/${line.id}.wav`);
    const wav = readFileSync(`public${recordingUrl(line)}`);
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
    let byteRate = 0, bytes = 0;
    for (let offset = 12; offset + 8 <= wav.length;) {
      const size = wav.readUInt32LE(offset + 4);
      const kind = wav.toString('ascii', offset, offset + 4);
      if (kind === 'fmt ') byteRate = wav.readUInt32LE(offset + 16);
      if (kind === 'data') bytes = size;
      offset += 8 + size + (size % 2);
    }
    assert.ok(byteRate > 0 && bytes > 0, line.id);
    // Supplied clips include up to 20ms of master audio on each boundary.
    const padding = bytes / byteRate - (line.end - line.start);
    assert.ok(padding >= -.001 && padding <= .041, line.id);
  }
});
test('opening and travel states always have an exact mapped recording', () => {
  for (const mode of ['galaxy', 'solar', 'earth', 'choose']) assert.ok(journeyRecording(mode)?.text);
  for (const mode of ['moon', 'mars', 'beyond']) assert.ok(journeyRecording(mode, true)?.text);
});
