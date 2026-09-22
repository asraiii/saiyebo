const weatherThemes={
clear:{body:"linear-gradient(180deg,#35B8F2 0%,#87D8F7 34%,#D7F3FF 68%,#FFF8D8 100%)",theme:"#35B8F2"},
partly:{body:"linear-gradient(180deg,#69A9D4 0%,#A8D3E9 34%,#E8F1E5 68%,#FFF0C7 100%)",theme:"#69A9D4"},
overcast:{body:"linear-gradient(180deg,#71808F 0%,#A7B3BD 35%,#D9D9D2 68%,#F2E8D9 100%)",theme:"#71808F"},
rain:{body:"linear-gradient(180deg,#315D79 0%,#638DA5 36%,#AEC8D4 68%,#DDE4E0 100%)",theme:"#315D79"},
shower:{body:"linear-gradient(180deg,#234C69 0%,#527F9C 34%,#91B6C9 66%,#C8D8D6 100%)",theme:"#234C69"},
storm:{body:"linear-gradient(180deg,#243444 0%,#4C5C6C 34%,#78838D 66%,#B7AAA4 100%)",theme:"#243444"}
};
function applyWeather(name){const t=weatherThemes[name]||weatherThemes.clear;document.body.style.background=t.body;document.querySelector('meta[name="theme-color"]').content=t.theme;document.documentElement.dataset.weather=name;document.querySelectorAll(".theme-preview button").forEach(b=>b.classList.toggle("on",b.dataset.theme===name))}
document.querySelectorAll(".theme-preview button").forEach(b=>b.addEventListener("click",()=>applyWeather(b.dataset.theme)));
applyWeather("clear");