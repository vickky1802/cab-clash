/* Cab Clash sound effects: synthesized with Web Audio, no files to load. */
(function(){
  let ctx=null,master=null,muted=false,lastTap=0;
  try{muted=localStorage.getItem('cc-mute')==='1'}catch(e){}

  function ac(){
    if(!ctx){
      const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
      ctx=new C();master=ctx.createGain();master.gain.value=.9;
      const comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);
    }
    if(ctx.state==='suspended')ctx.resume();
    return ctx;
  }
  // Phones only allow audio after a touch, so wake the audio engine on the first one.
  function unlock(){const c=ac();if(!c)return;const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0)}
  ['pointerdown','touchend','keydown'].forEach(e=>window.addEventListener(e,unlock,{capture:true,passive:true}));

  function tone(f,at,dur,o){
    o=o||{};const c=ctx,t0=c.currentTime+at;
    const osc=c.createOscillator(),g=c.createGain();
    osc.type=o.type||'sine';osc.frequency.setValueAtTime(f,t0);
    if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t0+dur);
    if(o.detune)osc.detune.value=o.detune;
    const v=o.vol||.18;
    g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+(o.attack||.006));
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    osc.connect(g);g.connect(master);osc.start(t0);osc.stop(t0+dur+.03);
  }
  function noise(at,dur,vol,hp){
    const c=ctx,t0=c.currentTime+at,len=Math.ceil(c.sampleRate*dur);
    const b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    s.buffer=b;f.type='highpass';f.frequency.value=hp||1800;g.gain.value=vol||.12;
    s.connect(f);f.connect(g);g.connect(master);s.start(t0);
  }

  const SOUNDS={
    tick(){tone(660,0,.09,{type:'square',vol:.07})},
    go(){tone(988,0,.14,{type:'square',vol:.09});tone(1318,.07,.28,{vol:.16})},
    tap(){const n=performance.now();if(n-lastTap<35)return;lastTap=n;tone(520+Math.random()*80,0,.05,{type:'triangle',vol:.12,to:300})},
    pop(){tone(420,0,.09,{vol:.16,to:880})},
    right(){tone(784,0,.08,{type:'triangle',vol:.14});tone(1175,.06,.12,{type:'triangle',vol:.14})},
    wrong(){tone(180,0,.22,{type:'sawtooth',vol:.08,to:110});tone(185,0,.22,{type:'sawtooth',vol:.06,to:112,detune:12})},
    lock(){tone(1046,0,.07,{type:'triangle',vol:.12});noise(0,.04,.06,3000)},
    blip(){tone(880,0,.08,{vol:.12,to:1200})},
    honk(){[0,.2].forEach(a=>{tone(392,a,.16,{type:'sawtooth',vol:.07});tone(494,a,.16,{type:'sawtooth',vol:.06})})},
    point(){[523,659,784].forEach((f,i)=>tone(f,i*.07,.18,{type:'triangle',vol:.15}));tone(1046,.21,.32,{type:'triangle',vol:.15})},
    nopoint(){tone(330,0,.16,{type:'triangle',vol:.12});tone(262,.12,.26,{type:'triangle',vol:.12})},
    lose(){[392,349,311,262].forEach((f,i)=>tone(f,i*.16,.24,{type:'triangle',vol:.13}))},
    fanfare(){
      [[523,0],[659,.12],[784,.24],[1046,.36],[784,.52],[1046,.64]].forEach(([f,a])=>tone(f,a,.22,{type:'square',vol:.07}));
      tone(1046,.64,.7,{type:'triangle',vol:.16});noise(.64,.5,.05,4000);
    }
  };

  function paint(){document.querySelectorAll('[data-sfx-toggle]').forEach(b=>{b.textContent=muted?'Sound off':'Sound on';b.setAttribute('aria-pressed',String(!muted))})}
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-sfx-toggle]');if(!b)return;
    muted=!muted;try{localStorage.setItem('cc-mute',muted?'1':'0')}catch(err){}
    paint();if(!muted){ac();SOUNDS.blip()}
  });

  window.SFX={
    play(name){if(muted||!SOUNDS[name])return;try{if(!ac())return;SOUNDS[name]()}catch(e){}},
    label(){return muted?'Sound off':'Sound on'},
    paint
  };
})();
