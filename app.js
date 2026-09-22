const weatherThemes={
clear:{body:"linear-gradient(180deg,#55BDF0 0%,#A7DCF5 39%,#EAF7FD 72%,#F9FCFE 100%)",theme:"#55BDF0"},
partly:{body:"linear-gradient(180deg,#72B3D2 0%,#B7D5E3 40%,#E8F2F6 72%,#FAFCFD 100%)",theme:"#72B3D2"},
overcast:{body:"linear-gradient(180deg,#7D929F 0%,#B5C2C9 41%,#E7ECEF 73%,#FAFBFC 100%)",theme:"#7D929F"},
rain:{body:"linear-gradient(180deg,#567B91 0%,#8EA8B7 40%,#DCE7EC 72%,#F8FAFB 100%)",theme:"#567B91"},
shower:{body:"linear-gradient(180deg,#416D87 0%,#789DB1 38%,#C9DDE7 70%,#F5F9FB 100%)",theme:"#416D87"},
storm:{body:"linear-gradient(180deg,#304F63 0%,#607D8D 38%,#B9CBD4 70%,#F1F5F7 100%)",theme:"#304F63"}
};
function applyWeather(name){const t=weatherThemes[name]||weatherThemes.clear;document.body.style.background=t.body;document.querySelector('meta[name="theme-color"]').content=t.theme;document.documentElement.dataset.weather=name;document.querySelectorAll(".theme-preview button").forEach(b=>b.classList.toggle("on",b.dataset.theme===name))}
document.querySelectorAll(".theme-preview button").forEach(b=>b.addEventListener("click",()=>applyWeather(b.dataset.theme)));
applyWeather("clear");