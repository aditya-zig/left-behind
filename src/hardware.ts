import type {Artifact,Source} from './data';
export type HardwarePart={name:string;role:string;where:string;state:'Stayed'|'Departed'|'Returned'|'Not separately located';orbit:string};
export type HardwareProfile={intro:string;parts:HardwarePart[];sources:Source[]};
const lmSource:Source={title:'NASA · Lunar Module and spacecraft adapter overview',url:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/08_LM_&_SLA_Overview_pp61-68.pdf',supports:'Two-stage structure, descent propulsion, landing gear, ascent cabin and systems.'};
const roverSource:Source={title:'NASA NSSDCA · Lunar roving vehicles',url:'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html',supports:'Four wheel-drive motors, power, wheel construction, steering and communications.'};
const part=(name:string,role:string,where:string,state:HardwarePart['state']='Stayed',orbit='35deg 65deg auto'):HardwarePart=>({name,role,where,state,orbit});
const profiles:Record<string,HardwareProfile>={
 eagle:{intro:'Eagle was two spacecraft in one. Read what stayed, then rotate NASA’s complete reference model. These are subsystem descriptions, not a surveyed exploded model.',parts:[
  part('Descent structure','The lower stage supported the landing, surface stay and ascent launch.','Remained at Tranquility Base. This is the hardware represented by the site pin.'),
  part('Landing legs and footpads','Four landing-gear assemblies supported the craft and absorbed touchdown loads.','Stayed with the descent structure. A separate survey coordinate for each footpad is not supplied.','Stayed','-45deg 85deg auto'),
  part('Descent propulsion','The descent engine and propellant tanks enabled the controlled landing.','Part of the lower stage left on the Moon. Their present condition is not reconstructed.','Stayed','140deg 80deg auto'),
  part('Ascent cabin and engine','Carried the two astronauts from the surface back to lunar orbit.','Departed the landing site to rejoin Columbia. Do not mistake the upper cabin in the full model for hardware still on Eagle’s base.','Departed','35deg 35deg auto'),
 ],sources:[lmSource]},
 rover:{intro:'The lunar rover expanded the astronauts’ working range. NASA’s engineering description identifies the subsystems; no verified matching rover GLB or component-by-component final survey is bundled here.',parts:[
  part('Four drive motors','Each wheel had its own quarter-horsepower electric motor.','The rover stayed on the Moon; the atlas uses the Apollo 15 LM site, not an exact wheel or parking coordinate.'),
  part('Wire-mesh wheels','Wire-mesh tires and titanium chevrons provided traction without air-filled tires.','Part of the surface vehicle left after the expedition.'),
  part('Power system','Two 36-volt silver-zinc batteries supplied power.','Designed for the surface expedition, not a flight back to Earth. No current battery condition is asserted.'),
  part('Communications and controls','Steering, navigation and communications supported the field expedition.','These are documented vehicle systems, not separate location pins or independently recovered model parts.'),
 ],sources:[roverSource]},
 surveyor:{intro:'Not every component stayed. Apollo 12 astronauts retrieved selected Surveyor 3 hardware, giving scientists a real exposure experiment—not a hypothetical salvage story.',parts:[
  part('Television camera','Returned images of the landing site and surface operations.','Removed by the Apollo 12 crew and returned to Earth in 1969 for study.','Returned'),
  part('Soil scoop','Trenched and manipulated lunar surface material.','Selected sampler hardware was recovered by Apollo 12. It must not be labelled as entirely untouched on the Moon.','Returned'),
  part('Remaining lander','Supported the instruments during the robotic mission.','Most of the lander remained. The mission page does not give a surveyed position for every remaining component.'),
 ],sources:[{title:'NASA Science · Apollo 12 and Surveyor 3',url:'https://science.nasa.gov/resource/apollo-12-and-surveyor-3/',supports:'NASA photograph and caption document the camera and other components being recovered and returned to Earth.'},{title:'NASA/JPL · Surveyor 3 camera returned from the Moon',url:'https://www.jpl.nasa.gov/blog/2012/1/surveyor-3-camera-returned-from-the-moon',supports:'Camera, scoop, cable and tubing removed and returned; camera studied and disassembled on Earth.'}]},
 alsep:{intro:'ALSEP was a distributed experiment station, not one indivisible machine. The catalogue pin identifies the station; connected instruments occupied a nearby deployment area.',parts:[
  part('Central station and power','Distributed power and relayed measurements from the deployed experiments.','The Apollo 12 central station has its own NASA catalogue coordinate, separate from the LM.'),
  part('Deployed experiment instruments','Measured seismic activity, magnetic conditions, solar wind and dust.','Deployed around the station. Individual instrument locations are not independently surveyed in this application.','Not separately located'),
  part('Instrument cables','Connected the station to its experiments.','The ALSEP network stopped operating in 1977. Shutdown did not retrieve its surface hardware.'),
 ],sources:[]},
 reflector:{intro:'A passive optical experiment is different from an abandoned vehicle. Its prisms reflect incoming light without a battery or transmitter.',parts:[
  part('Corner-cube prism array','The Apollo 11 array contains 100 prisms that return incoming laser light.','NASA’s catalogue gives the reflector its own coordinate, separate from Eagle.'),
  part('Support assembly','Holds the optical array in its deployed orientation.','An instrument on the lunar surface; not a live claim that every prism is clean or working today.'),
 ],sources:[]},
 opportunity:{intro:'Opportunity’s science depended on a mobile, solar-powered platform. These subsystem notes describe the rover, not an inspection of its final condition.',parts:[
  part('Solar power system','Converted sunlight into electrical power.','The 2018 dust storm reduced available sunlight. Exact contamination mass is not measured by this exhibit.'),
  part('Wheels and chassis','Carried the instruments across 45.16 kilometres over the mission.','Remains in the final Perseverance Valley region; the regional pin is not a surveyed wheel location.'),
  part('Cameras and science instruments','Investigated geology and evidence of past water.','No component retrieval is claimed. Select the original NASA mission record to investigate the instruments.'),
 ],sources:[]},
 insight:{intro:'InSight studied the interior from one place. Some instruments were deployed onto the ground; the whole lander model is not a georeferenced map of that deployment.',parts:[
  part('Seismometer','Recorded marsquakes to investigate the crust, mantle and core.','Placed on the ground by the lander’s arm. No separate surveyed instrument pin is supplied.','Not separately located'),
  part('Solar arrays','Generated power for the lander and instruments.','Dust accumulation reduced power. Last contact was in December 2022; no live condition is inferred.'),
  part('Robotic arm and lander','Deployed instruments and supported the stationary surface mission.','Remains in Elysium Planitia. NASA’s bundled model is a reference configuration.'),
 ],sources:[]},
 ingenuity:{intro:'The flight mission ended after damage to the rotor system. A reference model cannot reconstruct the exact damage or certify the state of the electronics.',parts:[
  part('Rotor system','Provided powered, controlled flight in the thin Martian atmosphere.','Rotor damage after the final flight prevented further flight. No animation of fabricated damage is shown.'),
  part('Solar power and electronics','Supported the helicopter’s technology demonstration and extended mission.','The end of flight is not evidence that every electronic subsystem immediately failed.'),
  part('Landing structure','Supported the helicopter between flights.','The marker is a Jezero regional reference, not the surveyed final placement of each foot.'),
 ],sources:[]},
 sojourner:{intro:'Sojourner depended on another surface machine: the Pathfinder lander relayed its communications. The two are not the same object.',parts:[
  part('Rover chassis and wheels','Carried the small rover to nearby rocks.','The rover remains in the Pathfinder region; its exact final coordinate is not asserted.'),
  part('Science and communications','Studied nearby rocks and sent information through the lander.','Pathfinder was the relay. The shared regional pin is not a claim that both vehicles occupy one point.'),
 ],sources:[]},
 viking1:{intro:'Viking’s lander and orbiter were separate spacecraft. The bundled NASA model depicts a generic lander, not the orbiter or an exact reconstruction of its final site.',parts:[
  part('Surface laboratory','Analyzed soil and conducted biological experiments.','Stayed on Mars. The biological results did not establish Martian life.'),
  part('Imaging and weather instruments','Recorded the surface and local environment over years of operations.','Shown as reference hardware only; component condition and cost rankings are not known here.'),
 ],sources:[]},
};
export function hardwareFor(item:Artifact):HardwareProfile{
  const profile=profiles[item.id]??(item.id==='spirit'?profiles.opportunity:item.id==='viking2'?profiles.viking1:undefined);
  if(profile&&item.id!=='spirit')return profile;
  if(item.id==='spirit')return {intro:'Spirit was Opportunity’s twin but had a separate history and final site.',parts:[part('Mobile science platform',item.purpose,'Remains near Home Plate in Gusev crater; no return or component survey is claimed.'),part('Power and communications','Solar-powered surface operations depended on available energy and communications.',item.statusDetail)],sources:[]};
  return {intro:'Follow the documented purpose and final mission state. Separate component positions and matching component models are not available in this exhibit.',parts:[part('Surface science system',item.purpose,item.statusDetail),part('Remaining hardware',item.why,item.locationNote,'Not separately located')],sources:[]};
}
export const costNote='Which part was most expensive? The cited sources do not provide a comparable component-level cost breakdown. Mission budgets include development, testing, launch and operations; they are not a price tag on a surviving part. No ranking or salvage value is invented here.';
