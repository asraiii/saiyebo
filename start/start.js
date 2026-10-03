const STORAGE_KEY="saiyebo:couple:v1";
const form=document.querySelector("#couple-form"),error=document.querySelector("#form-error");
function validDate(v){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
  const [y,m,d]=v.split("-").map(Number),x=new Date(y,m-1,d);
  return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;
}
function localToday(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function loadExisting(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
function hydrate(){
  const data=loadExisting();if(!data||typeof data!=="object")return;const note=document.querySelector("#profile-note");if(note)note.hidden=false;
  ["myBirth","partnerBirth","startDate","myName","partnerName"].forEach(k=>{if(form.elements[k]&&data[k])form.elements[k].value=data[k]});
  const relValue=["some","dating"].includes(data.relationshipType)?data.relationshipType:"dating";const rel=form.querySelector(`input[name="relationshipType"][value="${relValue}"]`);if(rel)rel.checked=true;
}
const today=localToday();
["myBirth","partnerBirth","startDate"].forEach(k=>form.elements[k].max=today);
hydrate();
form.addEventListener("submit",e=>{
  e.preventDefault();error.textContent="";
  const fd=new FormData(form),data={
    myBirth:String(fd.get("myBirth")||""),partnerBirth:String(fd.get("partnerBirth")||""),
    startDate:String(fd.get("startDate")||""),relationshipType:String(fd.get("relationshipType")||"dating"),
    myName:String(fd.get("myName")||"").trim().slice(0,20),partnerName:String(fd.get("partnerName")||"").trim().slice(0,20)
  };
  if(!validDate(data.myBirth)||!validDate(data.partnerBirth)||!validDate(data.startDate)){error.textContent="세 날짜를 모두 입력해주세요.";return}
  if(data.myBirth>today||data.partnerBirth>today||data.startDate>today){error.textContent="미래 날짜는 입력할 수 없어요.";return}
  if(!["some","dating"].includes(data.relationshipType)){error.textContent="현재 관계를 선택해주세요.";return}
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  location.href="/";
});
