const weatherThemes={
clear:{body:"linear-gradient(180deg,#35B8F2 0%,#78D1F6 27%,#CDEFFF 58%,#FFF3B9 100%)",theme:"#35B8F2"},
heat:{body:"linear-gradient(180deg,#F58A45 0%,#FFB85C 30%,#FFE08A 62%,#FFF4C7 100%)",theme:"#F58A45"},
partly:{body:"linear-gradient(180deg,#69A9D4 0%,#9CCDE6 28%,#DFECE7 59%,#FFE7AF 100%)",theme:"#69A9D4"},
overcast:{body:"linear-gradient(180deg,#71808F 0%,#9EABB6 29%,#D1D4D1 60%,#EFE0CC 100%)",theme:"#71808F"},
rain:{body:"linear-gradient(180deg,#315D79 0%,#5F89A1 30%,#9FBCCA 61%,#D8DED7 100%)",theme:"#315D79"},
storm:{body:"linear-gradient(180deg,#243444 0%,#465768 29%,#717D88 60%,#B5A39B 100%)",theme:"#243444"},
snow:{body:"linear-gradient(180deg,#8CBBD5 0%,#C1DDEB 32%,#E9F4F8 66%,#FFFFFF 100%)",theme:"#8CBBD5"},
blizzard:{body:"linear-gradient(180deg,#536D80 0%,#8097A7 31%,#C3D1D9 64%,#EEF3F6 100%)",theme:"#536D80"}
};
function applyWeather(name){const t=weatherThemes[name]||weatherThemes.clear;document.body.style.backgroundImage=t.body;document.querySelector('meta[name="theme-color"]').content=t.theme;document.documentElement.dataset.weather=name;document.querySelectorAll(".theme-preview button").forEach(b=>b.classList.toggle("on",b.dataset.theme===name));const hero=document.querySelector(".hero-weather-icon");if(hero)hero.className="hero-weather-icon weather-glyph "+name;const labels={clear:"포근한 맑음",heat:"뜨거운 폭염",partly:"포근한 구름 조금",overcast:"차분한 흐림",rain:"촉촉한 비",storm:"거센 폭우",snow:"포근한 눈",blizzard:"거센 폭설"};const title=document.querySelector(".hero h1");if(title)title.textContent=labels[name]||labels.clear}
document.querySelectorAll(".theme-preview button").forEach(b=>b.addEventListener("click",()=>applyWeather(b.dataset.theme)));
applyWeather("clear");