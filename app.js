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
const STORAGE_KEY="saiyebo:couple:v1";
const DEMO_COUPLE={myBirth:"1992-05-14",partnerBirth:"1993-11-02",startDate:"2025-07-22",relationshipType:"dating",myName:"나",partnerName:"상대"};
function validDateString(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||""))}
function sanitizeCouple(raw){
  if(!raw||typeof raw!=="object")return null;
  const data={
    myBirth:String(raw.myBirth||"").trim(),partnerBirth:String(raw.partnerBirth||"").trim(),
    startDate:String(raw.startDate||"").trim(),relationshipType:String(raw.relationshipType||"dating").trim(),
    myName:String(raw.myName||"").trim().slice(0,20),partnerName:String(raw.partnerName||"").trim().slice(0,20)
  };
  return validDateString(data.myBirth)&&validDateString(data.partnerBirth)&&validDateString(data.startDate)?data:null;
}
function loadCouple(){
  try{return sanitizeCouple(JSON.parse(localStorage.getItem(STORAGE_KEY)))||DEMO_COUPLE}catch{return DEMO_COUPLE}
}
function saveCouple(input){
  const data=sanitizeCouple(input);
  if(!data)throw new Error("Invalid couple profile");
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return data;
}
function daysTogether(start,date){
  const a=new Date(start+"T00:00:00"),b=new Date(date+"T00:00:00");
  return Math.max(1,Math.floor((b-a)/86400000)+1);
}
function formatStartDate(v){const [y,m,d]=v.split("-");return `${y}. ${m}. ${d}부터`}
function rainLevel(v){return v<35?"낮음":v<65?"보통":"높음"}
function humidityLevel(v){return v<58?"건조":v<78?"충분":"가득"}
function windLevel(v){return v<2.2?"잔잔":v<3.8?"산들":"강함"}
function bindText(name,value){const el=document.querySelector(`[data-bind="${name}"]`);if(el)el.textContent=value}
function renderToday(profile,date=isoLocalDate()){
  const forecast=generateForecast(profile,date),t=forecast.today;
  bindText("days-together",`D+${daysTogether(profile.startDate,date)}`);
  bindText("start-date",formatStartDate(profile.startDate));
  bindText("hero-title",t.label);bindText("hero-temp",t.temp);bindText("feels",t.feels);bindText("low",t.low);bindText("high",t.high);
  bindText("rain",t.rain);bindText("rain-level",rainLevel(t.rain));bindText("humidity",t.humidity);bindText("humidity-level",humidityLevel(t.humidity));
  bindText("wind",t.wind.toFixed(1));bindText("wind-level",windLevel(t.wind));bindText("tomorrow-temp",forecast.tomorrow.temp);
  document.querySelectorAll("[data-hour-card]").forEach((card,i)=>{
    const x=forecast.hourly[i];if(!x)return;
    const b=card.querySelector("b"),img=card.querySelector("img"),strong=card.querySelector("strong"),small=card.querySelector("small");
    if(b&&!card.classList.contains("now"))b.textContent=x.hour===24?"24시":`${String(x.hour).padStart(2,"0")}시`;
    if(img)img.src=weatherIcons[x.weather];if(strong)strong.textContent=`${x.temp}°`;if(small)small.textContent=x.label;
  });
  const weekday=["일","월","화","수","목","금","토"];
  document.querySelectorAll("[data-week-row]").forEach((row,i)=>{
    const x=forecast.week[i];if(!x)return;
    const parts=row.children,dt=new Date(x.date+"T00:00:00");
    if(parts[0])parts[0].textContent=i===0?"오늘":weekday[dt.getDay()];
    if(parts[1])parts[1].src=weatherIcons[x.weather];if(parts[2])parts[2].textContent=x.label;
    if(parts[3])parts[3].textContent=`${x.low}°`;if(parts[4])parts[4].textContent=`${x.high}°`;
  });
  applyWeather(t.weather);
  return forecast;
}
const activeCouple=loadCouple();
const activeForecast=renderToday(activeCouple);
window.SAIYEBO_PROFILE={load:loadCouple,save:saveCouple,key:STORAGE_KEY,demo:DEMO_COUPLE};
window.SAIYEBO_ACTIVE_FORECAST=activeForecast;

window.SAIYEBO_ENGINE={makeDailySeed,generateDay,generateForecast};
