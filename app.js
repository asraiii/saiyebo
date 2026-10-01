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
  const now=new Date(),isToday=date===isoLocalDate(now),currentHour=isToday?now.getHours():12;
  const activeHours=Array.from({length:10},(_,i)=>6+i*2).filter(hour=>hour<=24);
  const hours=isToday?[...new Set([...(currentHour<6?[currentHour]:[]),...activeHours,...(currentHour>=6&&currentHour<=24?[currentHour]:[])])].sort((a,b)=>a-b):activeHours;
  const hourly=hours.map(hour=>{
    const rng=mulberry32(makeDailySeed(input,`${date}|hour|${hour}`));
    const curve=Math.round(Math.sin((Math.min(hour,24)/24)*Math.PI)*5-2);
    const temp=clamp(today.temp+curve+Math.round(rng()*2-1),0,40);
    const rain=clamp(Math.round(today.rain*.55+rng()*42),0,100);
    const weather=weatherFromTemp(temp,rain);
    return{hour,temp,rain,weather,label:CONDITION_LABELS[weather],isNow:isToday&&hour===currentHour};
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
const HISTORY_KEY="saiyebo:history:v1";
function loadHistory(){
  try{const x=JSON.parse(localStorage.getItem(HISTORY_KEY));return Array.isArray(x)?x.filter(v=>v&&validDateString(v.date)):[]}catch{return[]}
}
function historyOwner(profile){
  const c=normalizeCouple(profile);return hash32(`${c.people.join("|")}|${c.start}|${c.type}`).toString(36);
}
function saveForecastHistory(forecast,profile){
  if(!forecast||!forecast.today||!profile)return;
  const t=forecast.today,owner=historyOwner(profile),entry={owner,date:t.date,temp:t.temp,low:t.low,high:t.high,rain:t.rain,humidity:t.humidity,wind:t.wind,weather:t.weather,label:t.label};
  const history=loadHistory().filter(x=>!(x.owner===owner&&x.date===entry.date));
  history.push(entry);history.sort((a,b)=>a.date.localeCompare(b.date));
  localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(-400)));
}
function historyStats(history,date=isoLocalDate(),profile=null){
  const owner=profile?historyOwner(profile):null;
  const sorted=history.filter(x=>x.date<=date&&(!owner||x.owner===owner)).sort((a,b)=>a.date.localeCompare(b.date));
  const clearish=x=>x&&["clear","heat","partly"].includes(x.weather);
  let streak=0,expected=date;
  for(let i=sorted.length-1;i>=0;i--){
    const x=sorted[i];
    if(x.date!==expected||!clearish(x))break;
    streak++;expected=addDays(expected,-1);
  }
  const month=date.slice(0,7),monthClear=sorted.filter(x=>x.date.startsWith(month)&&clearish(x)).length;
  const hottest=sorted.reduce((best,x)=>!best||x.temp>best.temp?x:best,null);
  return{streak,monthClear,hottest};
}
function renderHistorySummary(date=isoLocalDate(),profile=null){
  const s=historyStats(loadHistory(),date,profile);
  bindText("record-streak",`${s.streak}일`);
  bindText("record-month-clear",`${s.monthClear}일`);
  bindText("record-highest",s.hottest?s.hottest.date.slice(5).replace("-","."):"—");
}
const STORAGE_KEY="saiyebo:couple:v1";
const DEMO_COUPLE={myBirth:"1992-05-14",partnerBirth:"1993-11-02",startDate:"2025-07-22",relationshipType:"dating",myName:"나",partnerName:"상대"};
function validDateString(v){
  const s=String(v||"");if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const [y,m,d]=s.split("-").map(Number),x=new Date(y,m-1,d);
  return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;
}
function sanitizeCouple(raw){
  if(!raw||typeof raw!=="object")return null;
  const data={
    myBirth:String(raw.myBirth||"").trim(),partnerBirth:String(raw.partnerBirth||"").trim(),
    startDate:String(raw.startDate||"").trim(),relationshipType:String(raw.relationshipType||"dating").trim(),
    myName:String(raw.myName||"").trim().slice(0,20),partnerName:String(raw.partnerName||"").trim().slice(0,20)
  };
  if(!validDateString(data.myBirth)||!validDateString(data.partnerBirth)||!validDateString(data.startDate))return null;
  if(!["some","dating"].includes(data.relationshipType))return null;
  const today=isoLocalDate();
  if(data.myBirth>today||data.partnerBirth>today||data.startDate>today)return null;
  return data;
}
function loadCouple(){
  try{return sanitizeCouple(JSON.parse(localStorage.getItem(STORAGE_KEY)))}catch{return null}
}
function saveCouple(input){
  const data=sanitizeCouple(input);
  if(!data)throw new Error("Invalid couple profile");
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return data;
}
function daysTogether(start,date){
  const [sy,sm,sd]=start.split("-").map(Number),[ey,em,ed]=date.split("-").map(Number);
  const diff=Math.floor((Date.UTC(ey,em-1,ed)-Date.UTC(sy,sm-1,sd))/86400000);
  return Math.max(1,diff+1);
}
function formatStartDate(v){const [y,m,d]=v.split("-");return `${y}. ${m}. ${d}부터`}
function rainLevel(v){return v<35?"낮음":v<65?"보통":"높음"}
function humidityLevel(v){return v<58?"건조":v<78?"충분":"가득"}
function windLevel(v){return v<2.2?"잔잔":v<3.8?"산들":"강함"}
function bindText(name,value){const el=document.querySelector(`[data-bind="${name}"]`);if(el)el.textContent=value}
function relationshipStatus(t){
  if(t.rain>=75||t.wind>=4.4)return"주의";
  if(t.rain>=45||t.wind>=3.4)return"변화";
  if(t.humidity>=78&&t.rain<35)return"따뜻";
  return"안정";
}
const WEATHER_COPY={
  clear:["맑은 흐름이 이어져요","편안한 말 한마디가 잘 닿는 날이에요."],
  heat:["애정 온도가 높아져요","좋은 감정도 너무 앞서지 않게 천천히 전해보세요."],
  partly:["구름이 살짝 지나가요","작은 오해는 오래 두지 말고 가볍게 풀어보세요."],
  overcast:["잠깐 흐려질 수 있어요","상대의 말을 한 번 더 들어주면 금방 개어요."],
  rain:["서운함 비가 내릴 수 있어요","짧은 답보다 마음을 조금 더 설명해보세요."],
  storm:["서운함 폭우에 주의해요","감정이 커질 땐 결론보다 서로의 마음부터 확인해보세요."],
  snow:["마음이 조금 느려지는 날이에요","서두르지 말고 따뜻한 표현을 먼저 건네보세요."],
  blizzard:["감정이 얼어붙지 않게 조심해요","대화를 밀어붙이기보다 잠시 여유를 두는 편이 좋아요."]
};
function advisoryCopy(forecast){
  const t=forecast.today;
  const risky=forecast.hourly.filter(x=>["overcast","rain","storm","snow","blizzard"].includes(x.weather));
  const first=risky[0],base=WEATHER_COPY[t.weather]||WEATHER_COPY.clear;
  let title=base[0],copy=base[1];
  if(first&&first.weather!==t.weather){
    const when=first.hour===24?"자정":`${first.hour}시 이후`;
    title=`${when} ${CONDITION_LABELS[first.weather]} 기운이 보여요`;
  }
  if(t.wind>=4.4)copy="감정의 바람이 강해요. 바로 반응하기보다 한 번 고르고 말해보세요.";
  else if(t.humidity<58)copy="애정습도가 낮아요. 평소보다 표현을 한마디 더 보태보세요.";
  return{status:relationshipStatus(t),title,copy};
}
function tomorrowCopy(today,tomorrow){
  const diff=tomorrow.temp-today.temp;
  const tempText=diff>=3?"오늘보다 관계온도가 올라가요":diff<=-3?"오늘보다 관계온도가 차분해져요":"오늘과 비슷한 온도예요";
  const weatherText={
    clear:"맑은 흐름이라 편하게 마음을 나누기 좋아요.",
    heat:"애정 온도가 높아요. 서로의 속도도 함께 살펴보세요.",
    partly:"작은 구름은 있지만 대체로 부드러운 흐름이에요.",
    overcast:"조금 흐릴 수 있어요. 오해는 짧게 풀어주세요.",
    rain:"서운함 비 가능성이 있어요. 표현을 아끼지 않는 게 좋아요.",
    storm:"감정 변화가 큰 날이에요. 중요한 대화는 천천히 해보세요.",
    snow:"마음의 속도가 느려질 수 있어요. 따뜻하게 기다려주세요.",
    blizzard:"차가운 기류가 강해요. 서로에게 여유를 남겨주세요."
  };
  return{title:tempText,copy:weatherText[tomorrow.weather]||weatherText.clear};
}
function renderToday(profile,date=isoLocalDate()){
  const forecast=generateForecast(profile,date),t=forecast.today;
  bindText("hero-title",t.label);bindText("hero-temp",t.temp);bindText("feels",t.feels);bindText("low",t.low);bindText("high",t.high);
  bindText("rain",t.rain);bindText("rain-level",rainLevel(t.rain));bindText("humidity",t.humidity);bindText("humidity-level",humidityLevel(t.humidity));
  bindText("wind",t.wind.toFixed(1));bindText("wind-level",windLevel(t.wind));
  const advisory=advisoryCopy(forecast),tomorrowText=tomorrowCopy(t,forecast.tomorrow);
  bindText("status",advisory.status);bindText("advisory-title",advisory.title);bindText("advisory-copy",advisory.copy);
  bindText("tomorrow-title",tomorrowText.title);bindText("tomorrow-copy",tomorrowText.copy);
  const tomorrowIcon=document.querySelector('[data-bind-img="tomorrow-icon"]');if(tomorrowIcon)tomorrowIcon.src=weatherIcons[forecast.tomorrow.weather];
  const hourScroll=document.querySelector(".hour-scroll");
  if(hourScroll){
    hourScroll.innerHTML=forecast.hourly.map(x=>`<article data-hour-card class="${x.isNow?"now":""}"><b>${x.isNow?"지금":x.hour===24?"24시":String(x.hour).padStart(2,"0")+"시"}</b><img class="forecast-weather-icon" src="${weatherIcons[x.weather]}" alt=""><strong>${x.temp}°</strong><small>${x.label}</small></article>`).join("");
    const nowCard=hourScroll.querySelector(".now");
    if(nowCard)requestAnimationFrame(()=>{hourScroll.scrollLeft=Math.max(0,nowCard.offsetLeft-(hourScroll.clientWidth-nowCard.offsetWidth)/2)});
  }
  const futureWeek=forecast.week.slice(1);
  const calmCount=futureWeek.filter(x=>["clear","partly"].includes(x.weather)).length;
  const roughCount=futureWeek.filter(x=>["rain","storm","blizzard"].includes(x.weather)).length;
  const warmCount=futureWeek.filter(x=>["heat"].includes(x.weather)).length;
  let weekTitle="이번 주는 대체로 잔잔해요";
  let weekCopy="큰 기복보다는 편안한 흐름이 이어질 가능성이 있어요. 자세한 사이예보는 그날 다시 확인해보세요.";
  let weekIcon="partly";
  if(roughCount>=3){weekTitle="이번 주는 기류 변화가 조금 있어요";weekCopy="중간중간 흐름이 달라질 수 있어요. 어느 날 변화가 오는지는 매일의 사이예보에서 확인해보세요.";weekIcon="overcast"}
  else if(warmCount>=2){weekTitle="이번 주는 따뜻한 기류가 강해요";weekCopy="가까워지기 좋은 흐름이 보여요. 하루하루의 자세한 날씨는 그날 다시 열어보세요.";weekIcon="heat"}
  else if(calmCount>=4){weekTitle="이번 주는 대체로 포근해요";weekCopy="편안한 기류가 우세해 보여요. 구체적인 날씨와 관계특보는 매일 새로 확인해보세요.";weekIcon="partly"}
  bindText("week-outlook-title",weekTitle);bindText("week-outlook-copy",weekCopy);
  const weekIconEl=document.querySelector('[data-bind-img="week-outlook-icon"]');if(weekIconEl)weekIconEl.src=weatherIcons[weekIcon];
  applyWeather(t.weather);
  return forecast;
}
async function shareSaiyebo(profile,forecast){
  const t=forecast.today;
  const names=profile&&profile.myName&&profile.partnerName?`${profile.myName} · ${profile.partnerName}`:"우리 사이";
  const text=`${names}의 오늘 사이예보는 ${t.label}, 관계온도 ${t.temp}°예요. 오늘 우리 사이, 맑을까요?`;
  const shared=new URL("/share/",location.origin);\n  shared.search=new URLSearchParams({w:t.weather,t:String(t.temp),lo:String(t.low),hi:String(t.high),r:String(t.rain),h:String(t.humidity),v:String(t.wind),l:t.label}).toString();\n  const url=shared.href;
  try{
    if(navigator.share){await navigator.share({title:"사이예보",text,url});return}
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(`${text}\n${url}`);showShareFeedback("링크 복사 완료");return}
    const area=document.createElement("textarea");area.value=`${text}\n${url}`;area.setAttribute("readonly","");area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();document.execCommand("copy");area.remove();showShareFeedback("링크 복사 완료");
  }catch(error){if(error&&error.name==="AbortError")return;showShareFeedback("공유할 수 없어요")}
}
function showShareFeedback(message){
  const button=document.querySelector(".share-action");if(!button)return;
  const label=button.querySelector("span");if(!label)return;
  const original=label.dataset.original||label.textContent;label.dataset.original=original;label.textContent=message;
  clearTimeout(showShareFeedback.timer);showShareFeedback.timer=setTimeout(()=>{label.textContent=original},1800);
}
function bindShare(profile,forecast){
  document.querySelectorAll(".share,.share-action").forEach(button=>button.addEventListener("click",()=>shareSaiyebo(profile,forecast)));
}
const activeCouple=loadCouple();
const previewMode=new URLSearchParams(location.search).has("preview");
if(!activeCouple&&!previewMode){
  location.replace("/start/");
}else{
  const activeForecast=renderToday(activeCouple||DEMO_COUPLE);
  if(activeCouple){saveForecastHistory(activeForecast,activeCouple);renderHistorySummary(activeForecast.today.date,activeCouple)}
  else{renderHistorySummary(activeForecast.today.date)}
  window.SAIYEBO_ACTIVE_FORECAST=activeForecast;
  bindShare(activeCouple||DEMO_COUPLE,activeForecast);
}
window.SAIYEBO_PROFILE={load:loadCouple,save:saveCouple,key:STORAGE_KEY,demo:DEMO_COUPLE};
window.SAIYEBO_HISTORY={load:loadHistory,stats:historyStats,key:HISTORY_KEY,owner:historyOwner};

window.SAIYEBO_ENGINE={makeDailySeed,generateDay,generateForecast};
