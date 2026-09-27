const slides = [...document.querySelectorAll(".slide")];
let current = 0;
const progressFill = document.getElementById("progressFill");
const slideNo = document.getElementById("slideNo");
const hearts = document.getElementById("hearts");

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hide"), 550);
  updateUI();
  startHearts();
});

function updateUI(){
  slides.forEach((s,i)=>{
    s.classList.toggle("active", i===current);
    s.classList.toggle("exit", i<current);
  });
  slideNo.textContent = current + 1;
  progressFill.style.width = `${((current+1)/slides.length)*100}%`;
}

function goNext(){
  if(current < slides.length-1){
    current++;
    updateUI();
    window.scrollTo(0,0);
    if(current===19) celebrate();
  }
}

document.querySelectorAll(".next-btn").forEach(btn => btn.addEventListener("click", goNext));

document.querySelectorAll(".options:not(.answer-options) .option").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const wrap = btn.closest(".options");
    const feedback = wrap.parentElement.querySelector(".feedback");
    const correct = btn.classList.contains("correct");
    const q = wrap.dataset.question;
    if(correct){
      btn.classList.add("correct-choice");
      feedback.textContent = "YESSS! 😂❤️ You remember!";
      feedback.classList.add("ok");
      await saveAnswer(q, btn.textContent.trim());
      setTimeout(goNext, 900);
    }else{
      btn.classList.add("wrong");
      feedback.textContent = "Hmm... think again 👀❤️";
      setTimeout(()=>btn.classList.remove("wrong"),450);
    }
  });
});

const reveal = document.getElementById("revealPhoto");
if(reveal){
  reveal.addEventListener("click", ()=>{
    document.getElementById("schoolReveal").classList.add("revealed");
    reveal.classList.add("hidden");
    document.getElementById("afterReveal").classList.remove("hidden");
  });
}
document.getElementById("afterReveal")?.addEventListener("click",goNext);

document.getElementById("confessionBtn")?.addEventListener("click",goNext);

const letterText = `I remember you.

Not just on your birthday.
Not just when I see an old photo.

I remember you almost every day.

And even though we don't talk as much now...

you're still my friend. ❤️

You have a special space in my heart.`;
let typedStarted=false;

function typeMessage(){
  if(typedStarted) return;
  typedStarted=true;
  const box=document.getElementById("typedMessage");
  const btn=document.getElementById("letterNext");
  let i=0;
  const timer=setInterval(()=>{
    box.textContent=letterText.slice(0,i++);
    if(i>letterText.length){
      clearInterval(timer);
      btn.classList.remove("hidden");
    }
  },28);
}
document.getElementById("letterNext")?.addEventListener("click",goNext);

const observer = new MutationObserver(()=>{
  if(current===13) typeMessage();
});
observer.observe(document.getElementById("story"),{subtree:true,attributes:true});

async function saveAnswer(question,answer){
  try{
    await fetch("/save-answer",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({question,answer})
    });
  }catch(e){ console.log("Answer save skipped"); }
}

document.querySelectorAll(".answer-options .save-answer").forEach(btn=>{
  btn.addEventListener("click",async ()=>{
    const wrap=btn.closest(".answer-options");
    wrap.querySelectorAll(".option").forEach(x=>x.classList.remove("correct-choice"));
    btn.classList.add("correct-choice");
    await saveAnswer(wrap.dataset.question,btn.textContent.trim());
    const msg=wrap.parentElement.querySelector(".answer-saved");
    msg.textContent="Answer saved ❤️";
    setTimeout(goNext,650);
  });
});

document.getElementById("saveTextAnswers")?.addEventListener("click",async ()=>{
  const boxes=[...document.querySelectorAll(".question-stack textarea")];
  for(const box of boxes){
    await saveAnswer(box.dataset.question,box.value.trim());
  }
  document.querySelector("#saveTextAnswers + .answer-saved").textContent="Your answers are safe with this little memory. ❤️";
  setTimeout(goNext,700);
});

document.querySelectorAll(".final-options .save-answer").forEach(btn=>{
  btn.addEventListener("click",async ()=>{
    await saveAnswer(btn.closest(".final-options").dataset.question,btn.textContent.trim());
    celebrate();
    setTimeout(goNext,850);
  });
});

function startHearts(){
  setInterval(()=>{
    const h=document.createElement("div");
    h.className="float-heart";
    h.textContent=["♥","♡","❤","✦"][Math.floor(Math.random()*4)];
    h.style.left=Math.random()*100+"%";
    h.style.fontSize=(12+Math.random()*18)+"px";
    h.style.color=["#ff77a8","#ffd0df","#ffffff"][Math.floor(Math.random()*3)];
    h.style.animationDuration=(6+Math.random()*7)+"s";
    hearts.appendChild(h);
    setTimeout(()=>h.remove(),14000);
  },700);
}

function celebrate(){
  const canvas=document.getElementById("confetti");
  const ctx=canvas.getContext("2d");
  canvas.width=innerWidth; canvas.height=innerHeight;
  const pieces=Array.from({length:180},()=>({
    x:innerWidth/2,y:innerHeight*.35,
    vx:(Math.random()-.5)*13,vy:Math.random()*-11-3,
    g:.25+Math.random()*.12,s:4+Math.random()*7,r:Math.random()*Math.PI
  }));
  let frames=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.r+=.12;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);
      ctx.fillStyle=["#ff77a8","#ffd1df","#fff","#e7a5ff","#ffc36b"][Math.floor(Math.random()*5)];
      ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*1.5);ctx.restore();
    });
    frames++;
    if(frames<190) requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
  burstHearts();
  playMusic();
}

function burstHearts(){
  for(let i=0;i<20;i++){
    const h=document.createElement("div");
    h.className="float-heart";
    h.textContent="♥";
    h.style.left=(35+Math.random()*30)+"%";
    h.style.bottom=(20+Math.random()*20)+"%";
    h.style.fontSize=(18+Math.random()*25)+"px";
    h.style.animationDuration=(2+Math.random()*2)+"s";
    hearts.appendChild(h);
    setTimeout(()=>h.remove(),5000);
  }
}

const music=document.getElementById("bgMusic");
function playMusic(){
  if(!music) return;
  music.play().catch(()=>{});
}
document.getElementById("musicToggle")?.addEventListener("click",()=>{
  if(music.paused){music.play().catch(()=>{}); document.getElementById("musicToggle").textContent="⏸ Music";}
  else{music.pause(); document.getElementById("musicToggle").textContent="🎵 Music";}
});
document.getElementById("restart")?.addEventListener("click",()=>{
  current=0; typedStarted=false;
  document.getElementById("typedMessage").textContent="";
  document.getElementById("letterNext")?.classList.add("hidden");
  updateUI();
  music?.pause();
});
