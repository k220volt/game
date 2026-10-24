import Phaser from 'phaser';
import { Round, Run, positions, DELTAS, TOTAL_ROUNDS, readBest, saveBest, type Hit } from './logic';
import { Sound } from './audio';
import './style.css';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const asset = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;
const sound = new Sound();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
let scene: Park;
const overlay = $('overlay');
let run = new Run();
let resultHearts: ReturnType<typeof setInterval> | undefined;
const clearHearts = () => { clearInterval(resultHearts); document.querySelectorAll('.floating-heart').forEach(e => e.remove()); };
function hearts() {
  if (reduced || document.hidden) return;
  const h = document.createElement('span'); h.className = 'floating-heart'; h.textContent = '♥';
  h.style.left = `${20 + Math.random() * 60}%`; h.style.top = `${45 + Math.random() * 20}%`;
  overlay.appendChild(h); h.addEventListener('animationend', () => h.remove(), { once: true });
}
function best() { $('best').textContent = `BEST ${readBest()}`; }
function home() {
  clearHearts(); scene?.reset(); run = new Run(); $('hud').hidden = true; overlay.hidden = false;
  overlay.innerHTML = `<span class="cover-top">꽃이 피면, 사랑도 피어나요</span><img class="game-title" src="${asset('title')}" alt="이삐댕이의 뽀뽀공원"><p class="cover-description">꼭꼭 숨은 이삐를 찾아<br>달콤한 뽀뽀를 전해 주세요 ♡</p><img class="cover-couple" src="${asset('kiss')}" alt="이삐에게 뽀뽀하는 댕이"><button id="start" class="primary">공원으로 놀러 가기 <span aria-hidden="true">♡</span></button><p class="button-sub">이삐 +1 · 꽃 −2 · 빈 곳 −1 · 10번 중 7점 성공</p><span class="best-pill">YOUR BEST · ${readBest()} POINTS</span>`;
  $('start').onclick = () => begin(1);
  best();
}
function begin(level: number) { clearHearts(); overlay.hidden = true; $('hud').hidden = false; sound.unlock(); scene.startRound(level); }
function showResult(round: Round) {
  const win = round.passed;
  if (!run.finish(round)) return;
  saveBest(run.total); best(); sound.active = false; sound.fanfare(win); overlay.hidden = false;
  const complete = win && round.level === TOTAL_ROUNDS;
  overlay.innerHTML = `<div class="result-card"><span class="eyebrow">${complete ? 'HAPPILY EVER AFTER' : win ? `ROUND ${round.level} CLEAR` : 'ONE MORE LITTLE KISS'}</span><h2>${complete ? '우리 사랑, 활짝 피었네!' : win ? '이삐의 뽀뽀 세례!' : '힝… 뽀뽀해 줘!'}</h2><img class="result-art ${win ? '' : 'sad'}" src="${asset(win ? 'celebrate' : 'cry')}" alt="${win ? '이삐가 댕이에게 뽀뽀 세례를 퍼붓는 모습' : '드러누워 징징 울고 있는 댕이'}"><div class="result-score">${round.score}<small> / 10점</small></div><div class="total-score ${run.over ? 'final-score' : ''}"><span>${run.over ? '최종 점수' : '총 점수'}</span><strong>${run.total}<small>점</small></strong></div><p>${complete ? `스무 번의 만남, 총 ${run.total}점의 사랑을 모았어요.` : win ? '꽃보다 달콤한 뽀뽀, 쪽쪽쪽!<br>다음에는 이삐가 조금 더 빨라져요.' : run.over ? '세 번의 기회를 모두 사용했어요.<br>다시 시작해서 이삐를 만나러 가요!' : `남은 기회 ${run.remaining}번!<br>${round.level}라운드에서 다시 찾아볼까요?`}</p><button id="next" class="primary">${run.over ? '처음부터 다시 놀기 ♡' : win ? '다음 꽃밭으로 →' : '이 라운드 다시 도전 ♡'}</button><button id="home" class="secondary">시작 화면으로</button></div>`;
  if (win) { hearts(); resultHearts = setInterval(hearts, 240); }
  $('next').onclick = () => { if (run.over) { run = new Run(); begin(1); } else begin(win ? round.level + 1 : round.level); };
  $('home').onclick = home;
}
function pause() {
  if (!scene?.playing || scene.paused) return;
  scene.paused = true; scene.tweens.pauseAll(); sound.active = false; sound.suspend();
  overlay.hidden = false;
  overlay.innerHTML = '<div class="result-card"><span class="pause-title">☁</span><h2>꽃그늘에서 잠깐 쉬어요</h2><p>이삐도 기다리고 있어요.<br>준비되면 다시 만나러 가요!</p><button id="resume" class="primary">계속 놀기 →</button><button id="restart" class="secondary">처음부터 다시 시작</button></div>';
  $('resume').onclick = () => { overlay.hidden = true; scene.paused = false; scene.tweens.resumeAll(); sound.unlock(); sound.active = true; };
  $('restart').onclick = () => { run = new Run(); begin(1); };
}

class Park extends Phaser.Scene {
  round = new Round(); playing = false; paused = false;
  remaining = 0; gap = 0; target = -1; flowerSlots: number[] = [];
  objects: Phaser.GameObjects.Image[] = []; transient: Phaser.GameObjects.GameObject[] = [];
  petals: Phaser.GameObjects.Ellipse[] = []; flowers: Phaser.GameObjects.Image[] = [];
  private lastTarget = -1; private uiTick = 0; private elapsed = 0;
  constructor() { super('Park'); }
  preload() {
    this.load.image('park', asset('park'));
    for (const name of ['eppy', 'dange', 'flower', 'kiss', 'celebrate', 'cry']) this.load.image(name, asset(name));
    this.load.on('loaderror', () => { $('toast').textContent = '이미지를 불러오지 못했어요. 새로고침해 주세요.'; $('toast').classList.add('show'); });
  }
  create() {
    scene = this;
    this.cameras.main.setOrigin(0, 0).setZoom(pixelRatio);
    this.add.image(210, 370, 'park').setDisplaySize(494, 740);
    // Foreground flowers sit above the painted garden and gently breathe in the wind.
    for (const [x,y,s,a] of [[16,640,105,-20],[390,690,135,25],[43,724,120,10],[408,450,75,22]]) {
      const f = this.add.image(x,y,'flower').setDisplaySize(s,s*1.06).setAngle(a).setDepth(2); this.flowers.push(f);
      if (!reduced) this.tweens.add({targets:f,angle:a+7,duration:2500+Math.random()*1000,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    }
    for(let i=0;i<12;i++) this.petals.push(this.add.ellipse(Math.random()*420,Math.random()*740,4+Math.random()*4,3,0xffd2d7,.8).setDepth(4));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.playing || this.paused || this.round.locked || !p.primaryDown) return;
      // Only the garden is a scoring surface; HUD and footer are not targets.
      const x = p.worldX, y = p.worldY;
      if(y < 175 || y > 705) return;
      let kind: Hit = 'empty';
      for (let i=0;i<this.objects.length;i++) {
        const o=this.objects[i];
        if (Math.abs(x-o.x) <= 49 && Math.abs(y-o.y) <= 57) {kind = i===0 ? 'eppy' : 'flower';break;}
      }
      this.resolve(kind,x,y);
    });
    home();
    if (new URLSearchParams(location.search).has('debug')) $('debug').hidden = false;
  }
  point(slot: number) { return {x:86+(slot%3)*124,y:302+Math.floor(slot/3)*117}; }
  reset() {
    this.playing = false; this.paused = false; this.tweens.resumeAll(); this.gap=0; this.remaining=0;
    this.clearTargets(); this.clearTransient(); sound.active=false; $('toast').classList.remove('show');
  }
  clearTargets() { for (const o of this.objects) {this.tweens.killTweensOf(o);o.destroy();} this.objects=[]; }
  clearTransient() { for(const o of this.transient){this.tweens.killTweensOf(o);o.destroy();}this.transient=[]; }
  startRound(level: number) {
    this.reset(); this.round = new Round(level); this.playing = true; this.gap=1400; sound.active=true;
    this.message(`ROUND ${level} · ${['설레는 만남','두근두근','사랑의 질주'][Math.min(level, 3)-1]}`); this.sync();
  }
  next() {
    this.clearTransient(); this.clearTargets(); $('toast').classList.remove('show');
    if (this.round.done) { this.playing=false; showResult(this.round); return; }
    let slots=positions(); if(slots[0]===this.lastTarget) [slots[0],slots[1]]=[slots[1],slots[0]];
    this.target=slots[0];this.lastTarget=this.target;this.flowerSlots=slots.slice(1,2+Math.min(this.round.level, 3));
    [this.target,...this.flowerSlots].forEach((slot,i)=>{
      const p=this.point(slot); const o=this.add.image(p.x,p.y+12,i===0?'eppy':'flower').setDisplaySize(104,112).setDepth(3).setAlpha(0);
      this.objects.push(o); this.tweens.add({targets:o,y:p.y,alpha:1,duration:130,ease:'Back.out'});
    });
    this.round.open(); this.remaining=this.round.duration; this.sync();
  }
  message(text: string) { $('toast').textContent=text;$('toast').classList.add('show'); }
  resolve(kind: Hit,x?:number,y?:number) {
    if(!this.round.hit(kind)) return;
    const p=this.point(this.target); const good=kind==='eppy'; this.clearTargets();
    this.message({eppy:'찾았다! 쪽 ♡ +1',flower:'앗, 꽃이잖아! −2',empty:'이삐는 여기가 아니에요 −1',miss:'쏙! 다음엔 꼭 찾아줘요'}[kind]);
    if(good){
      const runner=this.add.image(60,645,'dange').setDisplaySize(95,130).setDepth(4);this.transient.push(runner);
      this.tweens.add({targets:runner,x:p.x-22,y:p.y,duration:220,ease:'Quad.out',onComplete:()=>{
        if(!runner.active)return; runner.setVisible(false);
        const kiss=this.add.image(p.x,p.y,'kiss').setDisplaySize(150,173).setDepth(4);this.transient.push(kiss);
        this.tweens.add({targets:kiss,angle:6,duration:150,yoyo:true,repeat:2});
      }});
      for(let i=0;i<7;i++){
        const h=this.add.text(p.x,p.y,'♥',{fontSize:`${16+Math.random()*12}px`,color:'#df7089'}).setDepth(5);this.transient.push(h);
        this.tweens.add({targets:h,x:p.x+(Math.random()-.5)*150,y:p.y-60-Math.random()*100,alpha:0,duration:850,delay:i*25});
      }
    } else if(kind!=='miss') {
      const label=this.add.text(x??p.x,y??p.y,String(DELTAS[kind]),{fontSize:'36px',color:'#a95564',stroke:'#fff9e8',strokeThickness:5}).setOrigin(.5).setDepth(5);this.transient.push(label);
      this.tweens.add({targets:label,y:label.y-40,alpha:0,duration:650});
    }
    sound.effect(good); this.gap=good?1100:900; this.sync();
  }
  sync() {
    $('round-label').textContent=`ROUND ${String(this.round.level).padStart(2, '0')} / ${TOTAL_ROUNDS}`;
    $('score').textContent=String(this.round.score);$('attempt').textContent=`${Math.min(10,this.round.outcomes.length+(this.round.locked?0:1)) || 1} / 10`;
    $('pips').innerHTML=Array.from({length:10},(_,i)=>`<span class="pip ${this.round.outcomes[i] ? this.round.outcomes[i]==='eppy'?'good':'bad':''}"></span>`).join('');
  }
  update(_time:number,delta:number) {
    if(this.paused)return;
    const dt=Math.min(delta,100); this.elapsed+=dt;
    sound.update(dt);
    if(!reduced) for(let i=0;i<this.petals.length;i++) {const p=this.petals[i];p.y+=dt*(.009+i*.0007);p.x+=Math.sin(this.elapsed*.0007+i)*dt*.009;p.rotation+=dt*.0003;if(p.y>750){p.y=-10;p.x=Math.random()*420;}}
    if(this.playing){
      if(this.gap>0){this.gap-=dt;if(this.gap<=0)this.next();}
      else if(!this.round.locked){this.remaining-=dt;if(this.remaining<=0)this.resolve('miss');}
      $('timer-fill').style.transform=`scaleX(${Math.max(0,this.remaining/this.round.duration)})`;
    }
    this.uiTick+=dt;
    if(this.uiTick>500){this.uiTick=0;if(!$('debug').hidden)$('debug').textContent=`${Math.round(this.game.loop.actualFps)} FPS | ${Math.round(performance.now())} ms since load | textures ${this.textures.getTextureKeys().length} | objects ${this.children.length}`;}
  }
}

$('sound').onclick = () => {sound.toggle();$('sound').textContent=sound.enabled?'♫':'♪̸';$('sound').setAttribute('aria-label',sound.enabled?'소리 끄기':'소리 켜기');$('sound').setAttribute('aria-pressed',String(sound.enabled));};
$('pause').onclick=pause;
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();sound.suspend();} });
window.addEventListener('blur',()=>{pause();sound.suspend();});
window.addEventListener('orientationchange',pause);
document.addEventListener('contextmenu',e=>{if((e.target as HTMLElement).closest('.game-shell'))e.preventDefault();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')pause();});
const game = new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:420*pixelRatio,height:740*pixelRatio,backgroundColor:'#c8d5ad',scene:Park,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,pixelArt:false},fps:{target:60},input:{activePointers:1}});
// A read-only snapshot supports reproducible browser QA without bypassing input handling.
if(import.meta.env.DEV || new URLSearchParams(location.search).has('test')) Object.defineProperty(window,'__park',{get:()=>scene?{playing:scene.playing,paused:scene.paused,locked:scene.round.locked,score:scene.round.score,attempts:scene.round.outcomes.length,level:scene.round.level,target:scene.target,flowers:[...scene.flowerSlots],remaining:scene.remaining,objects:scene.children.length,total:run.total,remainingChances:run.remaining}:null});
window.addEventListener('pagehide',()=>{sound.suspend();});
if(import.meta.hot)import.meta.hot.dispose(()=>{clearHearts();game.destroy(true);});
