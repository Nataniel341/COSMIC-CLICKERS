let money=0,perClick=1,combo=0,multiplier=1,cps=0,luck=0,autoClicker=0;
let pets=[],equipped=[],lastClicks=[];

const moneyEl=document.getElementById("money");
const comboFill=document.getElementById("comboFill");
const cpsEl=document.getElementById("cps");
const multiEl=document.getElementById("multi");
const ppcEl=document.getElementById("ppc");
const meteor=document.getElementById("meteor");
const petInv=document.getElementById("petInventory");
const activePetsContainer=document.getElementById("activePetsContainer");
const shopList=document.getElementById("shopList");
const rouletteContainer=document.getElementById("rouletteContainer");
const roller=document.getElementById("roller");

const particleCanvas=document.getElementById("particles");
const pCtx=particleCanvas.getContext("2d");
let particles=[];

function initParticles(){particleCanvas.width=innerWidth; particleCanvas.height=innerHeight; particles=[];}
initParticles();window.onresize=()=>{initParticles();initStars();};

/* ===== STARS ===== */
const starCanvas=document.getElementById("stars"),sCtx=starCanvas.getContext("2d");
let stars=[];
function initStars(){starCanvas.width=innerWidth;starCanvas.height=innerHeight;stars=[];
for(let i=0;i<120;i++)stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,s:Math.random()*2+1});}
initStars();
(function starLoop(){sCtx.clearRect(0,0,starCanvas.width,starCanvas.height);
stars.forEach(st=>{st.y+=st.s*0.15;if(st.y>innerHeight)st.y=0;
sCtx.globalAlpha=st.s/3;sCtx.fillStyle="white";sCtx.fillRect(st.x,st.y,2,2);});
requestAnimationFrame(starLoop);})();

/* ===== SHOP ===== */
const upgrades=[
{id:"click",name:"⚡ Power",base:50,level:0,effect:()=>perClick++},
{id:"combo",name:"🔥 Combo Gain",base:150,level:0,effect:()=>{}},
{id:"luck",name:"🍀 Luck",base:300,level:0,effect:()=>luck+=2},
{id:"multi",name:"✖ Multiplier",base:1000,level:0,effect:()=>multiplier+=0.2},
{id:"autoclick",name:"🤖 AutoClicker",base:2000,level:0,effect:()=>autoClicker++}
];
function upgradeCost(u){return Math.floor(u.base*Math.pow(1.6,u.level));}
function renderShop(){shopList.innerHTML="";upgrades.forEach(u=>{
const btn=document.createElement("button");btn.className="upgrade";
btn.innerHTML=`${u.name} Lv.${u.level}<br><small>$${upgradeCost(u)}</small>`;
btn.onclick=()=>{
let cost=upgradeCost(u);
if(money>=cost){money-=cost; u.level++; u.effect(); renderShop(); updateUI(); spawnUpgradeEffect();}}; shopList.appendChild(btn);
});}
renderShop();

/* ===== EFFECT ZIELONE $ ===== */
function spawnUpgradeEffect(){
  const div=document.createElement("div"); div.textContent="+$"; div.style.position="absolute";
  div.style.color="#22c55e"; div.style.fontWeight="bold"; div.style.fontSize="20px"; div.style.left="50%"; div.style.top="20%";
  div.style.transform="translate(-50%,0)"; div.style.opacity="1"; div.style.transition="all 1s ease-out";
  document.body.appendChild(div);
  setTimeout(()=>{div.style.top="0"; div.style.opacity="0";},50);
  setTimeout(()=>{div.remove();},1050);
}

/* ===== SAVE / LOAD ===== */
function saveGame(){
  const saveData={money,perClick,combo,multiplier,cps,luck,autoClicker,pets,equipped,upgrades:upgrades.map(u=>({id:u.id,level:u.level}))};
  localStorage.setItem("cosmicClickersSave",JSON.stringify(saveData));
}
function loadGame(){
  const saveData=JSON.parse(localStorage.getItem("cosmicClickersSave"));
  if(saveData){
    money=saveData.money; perClick=saveData.perClick; combo=saveData.combo; multiplier=saveData.multiplier;
    cps=saveData.cps; luck=saveData.luck; autoClicker=saveData.autoClicker;
    pets=saveData.pets||[]; equipped=saveData.equipped||[];
    if(saveData.upgrades){saveData.upgrades.forEach(su=>{const u=upgrades.find(x=>x.id===su.id); if(u) u.level=su.level;});}
  }
}
setInterval(saveGame,5000);
loadGame();
updateUI();
renderShop();
renderInventory();
renderActivePets();

/* ===== CLICK ===== */
meteor.onclick=()=>clickGain();
function clickGain(){
  combo=Math.min(combo+8,100);
  let gain=Math.floor(perClick*multiplier*(1+combo/100));
  if(money + gain >= 10000000){money=10000000; gain=0; meteor.textContent="☄️ MAX $10M"; setTimeout(()=>{meteor.textContent="☄️";},1200);}
  else money+=gain;
  lastClicks.push(Date.now());
  updateUI();
}

/* ===== COMBO ===== */
setInterval(()=>{combo=Math.max(combo-2,0);comboFill.style.width=combo+"%"},100);
setInterval(()=>{const now=Date.now();lastClicks=lastClicks.filter(t=>now-t<1000);cps=lastClicks.length;cpsEl.textContent=cps;},500);

/* ===== AUTOCLICKER ===== */
setInterval(()=>{for(let i=0;i<autoClicker;i++)clickGain();},1000);

/* ===== CAPSULE ROLLING ===== */
document.querySelectorAll(".capsule").forEach(btn=>{btn.onclick=()=>{
const cost=+btn.dataset.cost; if(money<cost) return; money-=cost; openCapsule(cost); updateUI();}});
function rollPet(cost){let r=Math.random()*100+luck;
if(cost===100000 && r>90) return {icon:"🦄",boost:.5,rarity:"mythical"};
if(cost>=3000 && r>80) return {icon:"🐉",boost:.25,rarity:"legendary"};
if(r>70) return {icon:"🦊",boost:.15,rarity:"epic"};
if(r>50) return {icon:"🐱",boost:.08,rarity:"rare"};
return {icon:"🐶",boost:.05,rarity:"common"};}
function openCapsule(cost){
  rouletteContainer.style.display="block"; roller.innerHTML="";
  let reward;
  for(let i=0;i<14;i++){const pet=rollPet(cost); if(i===9) reward=pet;
  const d=document.createElement("div"); d.className="roll "+pet.rarity; d.textContent=pet.icon; roller.appendChild(d);}
  roller.style.transition="none"; roller.style.transform="translateX(0)";
  setTimeout(()=>{roller.style.transition="transform 2.6s cubic-bezier(.1,.7,.2,1)"; roller.style.transform="translateX(-900px)";},50);
  setTimeout(()=>{rouletteContainer.style.display="none"; addPet(reward); if(["epic","legendary","mythical"].includes(reward.rarity)) spawnParticles(reward);},2700);
}

/* ===== PET SYSTEM ===== */
function addPet(p){pets.push(p);renderInventory();recalcPets();}
function renderInventory(){petInv.innerHTML=""; pets.forEach((p,i)=>{
  const d=document.createElement("div"); d.className="pet "+p.rarity; if(equipped.includes(p)) d.classList.add("active");
  d.textContent=p.icon;
  const rem=document.createElement("span"); rem.textContent="❌"; rem.className="remove"; rem.onclick=(e)=>{e.stopPropagation(); removePet(p);};
  d.appendChild(rem);
  d.onclick=()=>togglePet(p); petInv.appendChild(d);
});}
function togglePet(p){if(equipped.includes(p)) equipped=equipped.filter(x=>x!==p); else if(equipped.length<5) equipped.push(p); recalcPets(); renderInventory(); renderActivePets();}
function recalcPets(){multiplier=1; equipped.forEach(p=>multiplier+=p.boost);}

/* ===== REMOVE PET ===== */
function removePet(p){pets=pets.filter(x=>x!==p); equipped=equipped.filter(x=>x!==p);renderInventory(); renderActivePets(); recalcPets(); updateUI();}

/* ===== ACTIVE PETS ===== */
function renderActivePets(){activePetsContainer.innerHTML=""; equipped.forEach(p=>{const d=document.createElement("div"); d.className="activePet "+p.rarity; d.textContent=p.icon; activePetsContainer.appendChild(d);});}

/* ===== PARTICLE EXPLOSION ===== */
function spawnParticles(pet){
  for(let i=0;i<25;i++){particles.push({x:window.innerWidth/2, y:window.innerHeight/2, dx:(Math.random()-0.5)*8, dy:(Math.random()-0.5)*8, alpha:1, color: pet.rarity==="legendary"?"gold":pet.rarity==="mythical"?"#ff0090":"#4c1d95", size:Math.random()*6+4});}
}
function particleLoop(){pCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height); particles.forEach((p,i)=>{p.x+=p.dx; p.y+=p.dy; p.alpha-=0.03; pCtx.fillStyle=p.color; pCtx.globalAlpha=p.alpha; pCtx.beginPath(); pCtx.arc(p.x,p.y,p.size,0,Math.PI*2); pCtx.fill(); if(p.alpha<=0) particles.splice(i,1);}); pCtx.globalAlpha=1; requestAnimationFrame(particleLoop);}
particleLoop();

/* ===== NAV ===== */
document.querySelectorAll("nav button").forEach(b=>{b.onclick=()=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active")); document.getElementById(b.dataset.tab).classList.add("active"); document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active")); b.classList.add("active");};});

/* ===== UPDATE UI ===== */
function updateUI(){moneyEl.textContent="$"+Math.floor(money); comboFill.style.width=combo+"%"; multiEl.textContent=multiplier.toFixed(2); ppcEl.textContent=Math.floor(perClick*multiplier*(1+combo/100)); renderActivePets();}
