import script from './mascot-script.json';
import type { Artifact } from './data';

// Explicit aliases keep catalogue IDs independent of the supplied recording names.
const aliases: Record<string, string> = {
  eagle: 'apollo_lunar_modules_eagle', rover: 'lunar_roving_vehicles',
  alsep: 'alsep_listening_station', surveyor: 'surveyor_3', reflector: 'laser_retroreflector',
  viking1: 'viking_1', viking2: 'viking_2', near: 'near_shoemaker',
  pioneer10: 'pioneer_10', pioneer11: 'pioneer_11',
};
export function recordedStory(artifact: Artifact) {
  return script.filter(line => line.section === artifact.world && line.item === (aliases[artifact.id] ?? artifact.id));
}
export function journeyRecording(mode: string, travelling = false) {
  const id = travelling ? `journey_travel_${mode === 'beyond' ? 'beyond_mars' : mode}_01`
    : mode === 'choose' ? 'journey_choose_destination_01'
    : mode === 'solar' ? 'bonus_between_stories_01'
    : mode === 'earth' ? 'journey_guided_tour_start_01' : 'journey_landing_01';
  return script.find(line => line.id === id)!;
}
export type MascotRecording = typeof script[number];
export function recordingUrl(line: MascotRecording) {
  return `/audio/mascot/${line.id}.wav`;
}
