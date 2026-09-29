const weatherIcons={clear:"/assets/weather/soft-3d/clear-day.svg?v=14.8",heat:"/assets/weather/soft-3d/sun-hot.svg?v=14.8",partly:"/assets/weather/soft-3d/partly-cloudy-day.svg?v=14.8",overcast:"/assets/weather/soft-3d/overcast.svg?v=14.8",rain:"/assets/weather/soft-3d/rain.svg?v=14.8",storm:"/assets/weather/soft-3d/extreme-rain.svg?v=14.8",snow:"/assets/weather/soft-3d/snow.svg?v=14.8",blizzard:"/assets/weather/soft-3d/extreme-snow.svg?v=14.8"};
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
function applyWeather(name){const t=weatherThemes[name]||weatherThemes.clear;document.body.style.backgroundImage=t.body;document.querySelector('meta[name="theme-color"]').content=t.theme;document.documentElement.dataset.weather=name;document.querySelectorAll(".theme-preview button").forEach(b=>b.classList.toggle("on",b.dataset.theme===name));const hero=document.querySelector('[data-weather-icon="hero"]');if(hero)hero.src=weatherIcons[name]||weatherIcons.clear}
document.querySelectorAll(".theme-preview button").forEach(b=>b.addEventListener("click",()=>applyWeather(b.dataset.theme)));
applyWeather("clear");