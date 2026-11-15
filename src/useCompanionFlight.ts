import {useEffect,useState} from 'react';

// Viewport-bounded waypoints, never the pointer itself: the guide must not steal
// clicks or chase someone trying to read a caption. All motion can be disabled.
export function useCompanionFlight(sceneKey:string,compact:boolean,moving:boolean,travelling:boolean){
 const [viewport,setViewport]=useState(()=>({width:innerWidth,height:innerHeight}));
 const [waypoint,setWaypoint]=useState(0);
 useEffect(()=>{const resize=()=>setViewport({width:innerWidth,height:innerHeight});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useEffect(()=>{setWaypoint(n=>n+1);},[sceneKey]);
 useEffect(()=>{
  if(!moving||!compact||travelling)return;
  const timer=setInterval(()=>{if(!document.hidden)setWaypoint(n=>n+1);},10000);
  const scroll=()=>setWaypoint(n=>n+1);
  window.addEventListener('scrollend',scroll);
  return()=>{clearInterval(timer);window.removeEventListener('scrollend',scroll);};
 },[moving,compact,travelling]);
 const {width,height}=viewport,mobile=width<700;
 const bodyWidth=compact?(mobile?110:150):Math.min(310,width-40);
 const maxX=Math.max(16,width-bodyWidth-20);
 const maxY=Math.max(90,height-(compact?150:350));
 const boundX=(fraction:number)=>Math.max(16,Math.min(maxX,width*fraction));
 const boundY=(fraction:number)=>Math.max(90,Math.min(maxY,height*fraction));
 const spots=mobile?[[.65,.21],[.35,.32],[.06,.23]]:[[.73,.22],[.48,.34],[.69,.43]];
 const spot=spots[(moving?waypoint:0)%spots.length];
 if(!compact)return {x:boundX(mobile ? .08 : .67),y:mobile?Math.min(maxY,410):boundY(.29),width:bodyWidth};
 if(travelling&&moving)return {x:[boundX(.08),boundX(.44),boundX(.75)],y:[boundY(.38),boundY(.14),boundY(.28)],width:bodyWidth};
 return {x:boundX(spot[0]),y:boundY(spot[1]),width:bodyWidth};
}
