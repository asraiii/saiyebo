const WEATHER_KEYS=["clear","heat","partly","overcast","rain","storm","snow","blizzard"];
const CONDITION_LABELS={clear:"맑음",heat:"폭염",partly:"구름 조금",overcast:"흐림",rain:"비",storm:"폭우",snow:"눈",blizzard:"폭설"};
function hash32(input){
  let h=2166136261;
  for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
  return h>>>0;
}
function mulberry32(seed){
  return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
}
function isoLocalDate(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function normalizeCouple(input={}){
  const clean=v=>String(v||"").trim().toLowerCase();
  const people=[clean(input.myBirth),clean(input.partnerBirth)].sort();
  return {people,start:clean(input.startDate),type:clean(input.relationshipType||"dating")};
}
function makeDailySeed(input,date=isoLocalDate()){
  const c=normalizeCouple(input);
  return hash32(`SAIYEBO|v1|${c.people.join("|")}|${c.start}|${c.type}|${date}`);
}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function weatherFromTemp(temp,rain){
  if(rain>=82)return"storm";
  if(rain>=58)return"rain";
  if(temp>=34)return"heat";
  if(temp<=3&&rain>=62)return"blizzard";
  if(temp<=5&&rain>=38)return"snow";
  if(rain>=38)return"overcast";
  if(rain>=22)return"partly";
  return"clear";
}
function generateDay(input,date=isoLocalDate()){
  const rng=mulberry32(makeDailySeed(input,date));
  const temp=Math.round(18+rng()*15);
  const rain=Math.round(rng()*100);
  const humidity=Math.round(48+rng()*43);
  const wind=Math.round((.8+rng()*4.4)*10)/10;
  const low=clamp(temp-Math.round(3+rng()*4),0,40);
  const high=clamp(temp+Math.round(2+rng()*4),0,40);
  const feels=clamp(temp+Math.round((humidity-68)/18-(wind-2.2)/2),0,40);
  const weather=weatherFromTemp(temp,rain);
  return{date,temp,feels,low,high,rain,humidity,wind,weather,label:CONDITION_LABELS[weather]};
}
function addDays(dateString,amount){
  const [y,m,d]=dateString.split("-").map(Number),x=new Date(y,m-1,d+amount);
  return isoLocalDate(x);
}
function generateForecast(input,date=isoLocalDate()){
  const today=generateDay(input,date);
  const hourly=[6,9,12,15,18,20,22,24].map((hour,i)=>{
    const rng=mulberry32(makeDailySeed(input,`${date}|hour|${hour}`));
    const curve=Math.round(Math.sin((i/7)*Math.PI)*5-2);
    const temp=clamp(today.temp+curve+Math.round(rng()*2-1),0,40);
    const rain=clamp(Math.round(today.rain*.55+rng()*42),0,100);
    const weather=weatherFromTemp(temp,rain);
    return{hour,temp,rain,weather,label:CONDITION_LABELS[weather]};
  });
  const week=Array.from({length:7},(_,i)=>generateDay(input,addDays(date,i)));
  return{version:1,seed:makeDailySeed(input,date),today,hourly,tomorrow:week[1],week};
}

const weatherIcons={
  clear:"/assets/weather/soft-3d/clear-day.svg?v=16.6",
  heat:"/assets/weather/soft-3d/sun-hot.svg?v=16.6",
  partly:"/assets/weather/soft-3d/partly-cloudy-day.svg?v=16.6",
  overcast:"/assets/weather/soft-3d/overcast.svg?v=16.6",
  rain:"/assets/weather/soft-3d/rain.svg?v=16.6",
  storm:"/assets/weather/soft-3d/extreme-rain.svg?v=16.6",
  snow:"/assets/weather/soft-3d/snow.svg?v=16.6",
  blizzard:"/assets/weather/soft-3d/extreme-snow.svg?v=16.6"
};
const weatherThemes={
  clear:{body:"linear-gradient(180deg,#2499D0 0%,#48B5E4 30%,#78CAE9 62%,#A7DDED 100%)",theme:"#2499D0"},
  heat:{body:"linear-gradient(180deg,#8F4D7A 0%,#A86182 30%,#C27A8C 62%,#D99A9A 100%)",theme:"#8F4D7A"},
  partly:{body:"linear-gradient(180deg,#4F8EBA 0%,#6FA9CC 30%,#94C1D7 62%,#B9D5DF 100%)",theme:"#4F8EBA"},
  overcast:{body:"linear-gradient(180deg,#596B7B 0%,#738695 30%,#91A2AD 62%,#B3BEC4 100%)",theme:"#596B7B"},
  rain:{body:"linear-gradient(180deg,#284E68 0%,#3F6A84 30%,#648AA0 62%,#8EABB9 100%)",theme:"#284E68"},
  storm:{body:"linear-gradient(180deg,#202F3E 0%,#34485A 30%,#536779 62%,#7B8C99 100%)",theme:"#202F3E"},
  snow:{body:"linear-gradient(180deg,#5D88A5 0%,#739CB5 30%,#8FB2C5 62%,#AEC8D4 100%)",theme:"#5D88A5"},
  blizzard:{body:"linear-gradient(180deg,#40596D 0%,#587286 30%,#758D9E 62%,#97AAB6 100%)",theme:"#40596D"}
};
function applyWeather(name){
  const key=weatherThemes[name]?name:"clear";
  const t=weatherThemes[key];
  document.body.style.backgroundImage=t.body;
  document.documentElement.style.setProperty("--weather-accent",t.theme);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=t.theme;
  document.documentElement.dataset.weather=key;
  const hero=document.querySelector('[data-weather-icon="hero"]');
  if(hero)hero.src=weatherIcons[key];
}
const requested=new URLSearchParams(location.search).get("weather");
applyWeather(requested||"clear");

window.SAIYEBO_ENGINE={makeDailySeed,generateDay,generateForecast};
