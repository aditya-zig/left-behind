import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
    assert.ok(Math.abs(bytes / byteRate - (line.end - line.start)) < .001, line.id);
    assert.equal(createHash('sha256').update(wav).digest('hex'),line.sha256,line.id);
  }
});
test('corrected clips tile the master without overlap or lost speech', () => {
  assert.equal(script[0].start,0);
  for(let i=1;i<script.length;i++)assert.equal(script[i].start,script[i-1].end,script[i].id);
  for(const line of script){
    assert.ok(line.end>line.start);
    assert.ok(line.supplied_end>line.supplied_start);
    assert.equal(line.alignment,'master-word-timestamps-midpoint-cut');
  }
});
test('opening and travel states always have an exact mapped recording', () => {
  for (const mode of ['galaxy', 'solar', 'earth', 'choose']) assert.ok(journeyRecording(mode)?.text);
  for (const mode of ['moon', 'mars', 'beyond']) assert.ok(journeyRecording(mode, true)?.text);
});
