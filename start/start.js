const STORAGE_KEY="saiyebo:couple:v1";
const form=document.querySelector("#couple-form"),error=document.querySelector("#form-error");
function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(v)}
function localToday(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function loadExisting(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
function hydrate(){
  const data=loadExisting();if(!data||typeof data!=="object")return;
  ["myBirth","partnerBirth","startDate","myName","partnerName"].forEach(k=>{if(form.elements[k]&&data[k])form.elements[k].value=data[k]});
  const rel=form.querySelector(`input[name="relationshipType"][value="${CSS.escape(data.relationshipType||"dating")}"]`);if(rel)rel.checked=true;
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
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  location.href="/";
});
