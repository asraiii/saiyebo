const weatherThemes={
sunny:{body:"linear-gradient(180deg,#58BDF0 0%,#A8DDF6 38%,#EAF7FD 70%,#F8FCFE 100%)",theme:"#58BDF0"},
cloudy:{body:"linear-gradient(180deg,#7893A5 0%,#B4C5CF 40%,#E6EEF2 72%,#FAFCFD 100%)",theme:"#7893A5"},
rain:{body:"linear-gradient(180deg,#456D86 0%,#789CB0 40%,#D7E6ED 72%,#F7FAFC 100%)",theme:"#456D86"},
sunset:{body:"linear-gradient(180deg,#EA8D75 0%,#F4B18E 39%,#F8DED0 70%,#FFF9F5 100%)",theme:"#EA8D75"}
};
function applyWeather(name){const t=weatherThemes[name]||weatherThemes.sunny;document.body.style.background=t.body;document.querySelector('meta[name="theme-color"]').content=t.theme;document.documentElement.dataset.weather=name;document.querySelectorAll(".theme-preview button").forEach(b=>b.classList.toggle("on",b.dataset.theme===name))}
document.querySelectorAll(".theme-preview button").forEach(b=>b.addEventListener("click",()=>applyWeather(b.dataset.theme)));
applyWeather("sunny");