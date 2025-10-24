// Minimal typing sprint script — expand later
const WORDS = ["function","variable","javascript","array","object","html","css","commit","branch","merge","debug"];
const target = document.getElementById('target');
const input = document.getElementById('input');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const wpmEl = document.getElementById('wpm');
const accEl = document.getElementById('acc');
const typedEl = document.getElementById('typed');
const timeLabel = document.getElementById('timeLabel');

let timeLimit = 30, timer = null, timeLeft = timeLimit;
let words = [], currentIndex = 0, correctChars = 0, totalChars = 0, wordsTyped = 0, started = false, startTime = null;

function pickWords(n=40){
  const out = [];
  for(let i=0;i<n;i++) out.push(WORDS[Math.floor(Math.random()*WORDS.length)]);
  return out;
}

function render(){
  target.innerHTML = '';
  words.forEach((w,i)=>{
    const span = document.createElement('span');
    span.textContent = w + (i===words.length-1 ? '' : ' ');
    if(i<currentIndex) span.classList.add('correct');
    if(i===currentIndex) span.id='current';
    target.appendChild(span);
  });
}

function start(){
  words = pickWords(80);
  currentIndex=0;correctChars=0;totalChars=0;wordsTyped=0;started=true;
  timeLeft=timeLimit; startTime = Date.now();
  timeLabel.textContent = timeLeft;
  input.value=''; input.focus();
  render();
  if(timer) clearInterval(timer);
  timer = setInterval(()=>{
    timeLeft--; timeLabel.textContent = timeLeft;
    if(timeLeft<=0){ clearInterval(timer); end(); }
  },1000);
}

function end(){
  started=false; input.blur();
  const seconds = Math.max(1,(Date.now()-startTime)/1000);
  const wpm = Math.round((correctChars/5)/(seconds/60));
  wpmEl.textContent = isFinite(wpm) ? wpm : 0;
  alert(`Time's up! WPM: ${wpm} | Accuracy: ${accEl.textContent}`);
}

input.addEventListener('input', ()=>{
  if(!started) return;
  const val = input.value;
  const targetWord = words[currentIndex]||'';
  let correctCount = 0;
  for(let i=0;i<val.length;i++) if(val[i]===targetWord[i]) correctCount++;
  correctChars = correctCount + words.slice(0,currentIndex).join(' ').length;
  totalChars = words.slice(0,currentIndex).join(' ').length + val.length;
  const currSpan = document.getElementById('current');
  if(currSpan){
    currSpan.innerHTML = '';
    for(let i=0;i<targetWord.length;i++){
      const ch = document.createElement('span');
      ch.textContent = targetWord[i];
      if(val[i]===undefined) ch.style.opacity='0.5';
      else if(val[i]===targetWord[i]) ch.style.color='limegreen';
      else ch.style.color='#ff6b6b';
      currSpan.appendChild(ch);
    }
    currSpan.appendChild(document.createTextNode(' '));
  }
  if(val.endsWith(' ') || val===targetWord){
    wordsTyped++; currentIndex++; input.value=''; render();
  }
  const acc = totalChars ? Math.round((correctChars/totalChars)*100) : 100;
  wpmEl.textContent = Math.round((correctChars/5)/((Date.now()-startTime||1000)/1000*60) || 0);
  accEl.textContent = acc + '%';
  typedEl.textContent = wordsTyped;
});

startBtn.addEventListener('click', start);
restartBtn.addEventListener('click', ()=>{ if(timer) clearInterval(timer); start(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Tab' && !started){ e.preventDefault(); start(); }});
