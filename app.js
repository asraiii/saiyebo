const weatherThemes={
clear:{body:"linear-gradient(180deg,#35B8F2 0%,#78D1F6 27%,#CDEFFF 58%,#FFF3B9 100%)",theme:"#35B8F2"},
partly:{body:"linear-gradient(180deg,#69A9D4 0%,#9CCDE6 28%,#DFECE7 59%,#FFE7AF 100%)",theme:"#69A9D4"},
overcast:{body:"linear-gradient(180deg,#71808F 0%,#9EABB6 29%,#D1D4D1 60%,#EFE0CC 100%)",theme:"#71808F"},
rain:{body:"linear-gradient(180deg,#315D79 0%,#5F89A1 30%,#9FBCCA 61%,#D8DED7 100%)",theme:"#315D79"},
shower:{body:"linear-gradient(180deg,#234C69 0%,#4E7895 29%,#83A9BD 60%,#C3D2CC 100%)",theme:"#234C69"},
storm:{body:"linear-gradient(180deg,#243444 0%,#465768 29%,#717D88 60%,#B5A39B 100%)",theme:"#243444"}
};
function applyWeather(name){const t=weatherThemes[name]||weatherThemes.clear;document.body.style.backgroundImage=t.body;document.querySelector('meta[name="theme-color"]').content=t.theme;document.documentElement.dataset.weather=name;document.querySelectorAll(".theme-preview button").forEach(b=>b.classList.toggle("on",b.dataset.theme===name))}
document.querySelectorAll(".theme-preview button").forEach(b=>b.addEventListener("click",()=>applyWeather(b.dataset.theme)));
applyWeather("clear");