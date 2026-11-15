export type StewardshipTarget='apollo'|'mars'|'future';
export type StewardshipAction='document'|'reuse'|'return';
export const responsibilitySources={
 treaty:'https://www.unoosa.org/unoosa/en/ourwork/spacelaw/treaties/outerspacetreaty.html',
 protection:'https://standards.nasa.gov/standard/NASA/NASA-STD-871927',
 heritage:'https://www.nasa.gov/wp-content/uploads/2023/05/nasa-otps-lunar-landing-and-operations-policy-analysis-final-report-2.pdf',
 cubesat:'https://www.nasa.gov/what-are-smallsats-and-cubesats/',
 cansat:'https://education.esa.int/what_is_a_cansat/',
};
export function stewardshipBrief(target:StewardshipTarget,action:StewardshipAction){
 const context=target==='apollo'?'A historic Apollo site has scientific and cultural context that removal could destroy.':target==='mars'?'A Mars site raises planetary-protection and potential sample-containment questions; hardware presence alone is not a measurement of ecological damage.':'A future mission can design its inventory, end-of-life plan and interfaces before launch, rather than assuming later rescue.';
 const approach=action==='document'?'Our proposal: begin with remote documentation, a coordinate-linked inventory and a record of condition and ownership. This is a planning concept, not an operating cleanup mission.':action==='reuse'?'Our proposal: investigate reuse only after verifying ownership, condition, compatibility and the effects of disturbing the site. Old hardware is not automatically safe or useful.':'Our proposal: consider return only after a mission-specific feasibility and safety study. Surface ascent, rendezvous, Earth entry and, where relevant, containment cannot be supplied merely by making a satellite smaller.';
 const priority=target==='apollo'?'Preserve the site’s context first. Inspection is not permission to dismantle it.':target==='mars'?'Prevent forward contamination and assess restricted Earth-return requirements before proposing recovery.':'Require a documented, responsible end-of-life plan and make only claims that the design and mission analysis support.';
 return {context,approach,priority};
}
