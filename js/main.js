// Hound's Hut — site interactions
(function(){
  // current year
  document.querySelectorAll('[data-year]').forEach(function(e){ e.textContent = new Date().getFullYear(); });

  // mobile nav
  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if(burger && links){ burger.addEventListener('click', function(){ links.classList.toggle('open'); }); }

  // simple email-capture intercept (front-end only until backend/Netlify form wired)
  document.querySelectorAll('form[data-capture]').forEach(function(f){
    f.addEventListener('submit', function(ev){
      if(f.getAttribute('data-netlify')==='true') return; // let Netlify handle real submits
      ev.preventDefault();
      var note = f.querySelector('[data-note]');
      if(note){ note.textContent = "🐾 You're in! Watch your inbox for the Honest Dog Nutrition Guide."; }
      f.reset();
    });
  });

  // ===== Feeding & supply planner =====
  var planner = document.getElementById('planner');
  if(planner){
    var FOODS={
      'chicken-oatmeal':{name:'Real Chicken & Oatmeal',kcal:362,bagLb:10.3,price:51.99,url:'p-Real-Chicken-Oatmeal-Recipe-GM2324.html'},
      'chicken-rice':{name:'Real Chicken & Brown Rice',kcal:362,bagLb:10.3,price:51.99,url:'p-Real-Chicken-Brown-Rice-Recipe-GM2325.html'},
      'turkey-rice':{name:'Real Turkey & Brown Rice',kcal:360,bagLb:10.3,price:51.99,url:'p-Real-Turkey-Brown-Rice-Recipe-GM2327.html'},
      'salmon-sweet':{name:'Real Salmon, Peas & Sweet Potato',kcal:378,bagLb:10.3,price:58.99,url:'p-Real-Salmon-Peas-Sweet-Potato-Recipe-GMRSPS.html'},
      'chicken-sweet':{name:'Real Chicken & Sweet Potato',kcal:368,bagLb:10.3,price:56.99,url:'p-Real-Chicken-Sweet-Potato-Recipe-GM2002.html'}
    };
    var GPC=120, LBG=453.592;
    var state={stage:'adult',activity:'normal',goal:'maintain',months:3};
    function seg(group,key){
      planner.querySelectorAll('[data-group="'+group+'"]').forEach(function(b){
        b.addEventListener('click',function(){
          planner.querySelectorAll('[data-group="'+group+'"]').forEach(function(x){x.classList.remove('on');});
          b.classList.add('on'); state[key]=b.getAttribute('data-val'); calc();
        });
      });
    }
    seg('stage','stage');seg('activity','activity');seg('goal','goal');seg('months','months');
    function factor(){
      if(state.goal==='lose') return 1.0;
      if(state.stage==='puppy') return state.activity==='low'?2.0:3.0;
      if(state.stage==='senior') return state.activity==='active'?1.6:1.4;
      if(state.activity==='active') return 2.0;
      if(state.activity==='low') return 1.4;
      return 1.6;
    }
    function money(n){return '$'+n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
    function calc(){
      var lb=parseFloat(document.getElementById('wt').value);
      var dogs=Math.max(1,parseInt(document.getElementById('dogs').value,10)||1);
      var food=FOODS[document.getElementById('food').value]||FOODS['chicken-oatmeal'];
      var rbuy=document.getElementById('r-buy'); if(rbuy){rbuy.href=food.url; rbuy.innerHTML='Shop '+food.name+' \u2192';}
      var out=document.getElementById('p-out');
      if(!lb||lb<=0){if(out)out.style.opacity=.45;return;} if(out)out.style.opacity=1;
      var kg=lb/2.20462, rer=70*Math.pow(kg,0.75), merPer=rer*factor();
      var dailyKcal=merPer*dogs;
      var cupsDay=dailyKcal/food.kcal, gramsDay=cupsDay*GPC;
      var bagG=food.bagLb*LBG, cupsBag=bagG/GPC, bagKcal=cupsBag*food.kcal;
      var daysBag=bagKcal/dailyKcal;
      var months=parseInt(state.months,10), durDays=months*30;
      var bags=Math.ceil(durDays/daysBag);
      var total=bags*food.price, costDay=total/durDays;
      var mlbl=months+' month'+(months>1?'s':'');
      document.getElementById('r-kcal').textContent=Math.round(dailyKcal).toLocaleString()+' kcal/day';
      document.getElementById('r-cups').textContent=(Math.round(cupsDay*4)/4)+' cups ('+Math.round(gramsDay)+' g)';
      document.getElementById('r-daysbag').textContent=Math.round(daysBag)+' days';
      document.getElementById('r-dur').textContent=mlbl;
      document.getElementById('r-bags').textContent=bags+' \u00d7 '+food.bagLb+' lb';
      document.getElementById('r-cost').textContent=money(total);
      document.getElementById('r-costday').textContent=money(costDay)+'/day';
      var supp='';
      if(state.stage==='senior') supp=' Add <a href="product-joint-support-plus.html" style="color:var(--gold)">Joint Support Plus</a> for aging joints.';
      else if(state.activity==='active') supp=' Add <a href="product-wild-salmon-oil.html" style="color:var(--gold)">Wild Salmon Oil</a> for recovery & coat.';
      else if(state.goal==='lose') supp=' Use light, single-ingredient treats to stay on target.';
      else supp=' Split into 2 meals a day for easy digestion.';
      var rec=document.getElementById('r-rec');
      if(rec) rec.innerHTML='<strong>'+bags+' \u00d7 '+food.name+' ('+food.bagLb+' lb)</strong> '+(dogs>1?'for '+dogs+' dogs ':'')+'covers '+mlbl+' \u2014 about '+money(total)+' ('+money(costDay)+'/day).'+supp;
    }
    ['wt','dogs','food'].forEach(function(id){var e=document.getElementById(id);if(e){e.addEventListener('input',calc);e.addEventListener('change',calc);}});
    calc();
  }

  // ===== Symptom recommender =====
  var sf = document.getElementById('symptom-finder');
  if(sf){
    var map = {
      itching:{t:'Itching & hot spots', p:'Skin Support + Wild Salmon Oil', u:'product-skin-support.html'},
      shedding:{t:'Excess shedding / dull coat', p:'Wild Salmon Oil', u:'product-wild-salmon-oil.html'},
      dental:{t:'Bad breath / tartar', p:'Plaque Control', u:'product-plaque-control.html'},
      gut:{t:'Sensitive stomach / gas', p:'Gastro Pro Plus', u:'product-gastro-pro-plus.html'},
      joints:{t:'Stiffness / aging joints', p:'Joint Support Plus', u:'product-joint-support-plus.html'},
      allergy:{t:'Seasonal & food allergies', p:'Allergy Support', u:'product-allergy-support.html'},
      immune:{t:'Low energy / immune support', p:'ImmunoShroom', u:'product-immunoshroom.html'},
      anxiety:{t:'Anxiousness / stress', p:'Calming Support', u:'supplements.html'}
    };
    sf.querySelectorAll('[data-symptom]').forEach(function(b){
      b.addEventListener('click', function(ev){
        ev.preventDefault();
        var m = map[b.getAttribute('data-symptom')];
        var box = document.getElementById('sf-out');
        if(m && box){ box.style.display='block'; box.innerHTML = '<strong>'+m.t+'</strong> → we\u2019d start with <a href="'+m.u+'">'+m.p+'</a>. <a href="planner.html#quiz" style="font-weight:700">Take the full Pet Quiz \u2192</a>'; box.scrollIntoView({behavior:'smooth',block:'center'}); }
      });
    });
  }
})();

// product image gallery
(function(){
  var thumbs=document.querySelectorAll('.gthumb');
  if(!thumbs.length) return;
  thumbs.forEach(function(b){
    b.addEventListener('click',function(){
      var m=document.getElementById('gmain-img'); if(!m) return;
      m.src=b.getAttribute('data-src');
      var box=m.parentElement;
      if(b.getAttribute('data-fit')==='cover') box.classList.add('cover'); else box.classList.remove('cover');
      document.querySelectorAll('.gthumb').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
    });
  });
})();

// floating Ask Scout widget
(function(){
  var fab=document.getElementById('scout-fab'), panel=document.getElementById('scout-panel'), x=document.getElementById('scout-x');
  if(!fab||!panel) return;
  fab.addEventListener('click',function(){panel.classList.toggle('open');});
  if(x) x.addEventListener('click',function(){panel.classList.remove('open');});
  document.addEventListener('click',function(e){ if(!panel.contains(e.target) && !fab.contains(e.target)) panel.classList.remove('open'); });
})();

// Thrive-style email-capture popup (reveals discount code)
(function(){
  var pop=document.getElementById('ppop'); if(!pop) return;
  var KEY='hh_popup_v1', DAYMS=864e5;
  function seen(){ try{ var v=localStorage.getItem(KEY); if(v==='done') return true; if(v) return (Date.now()-parseInt(v,10))<7*DAYMS; return false; }catch(e){ return false; } }
  function markShown(){ try{ localStorage.setItem(KEY,String(Date.now())); }catch(e){} }
  function markDone(){ try{ localStorage.setItem(KEY,'done'); }catch(e){} }
  function open(){ if(seen()||pop.classList.contains('open')) return; pop.classList.add('open'); pop.setAttribute('aria-hidden','false'); markShown(); }
  function close(){ pop.classList.remove('open'); pop.setAttribute('aria-hidden','true'); }
  var timer=setTimeout(open,12000);
  function onScroll(){ if((window.scrollY+window.innerHeight)/document.body.scrollHeight>0.35){ open(); window.removeEventListener('scroll',onScroll); } }
  window.addEventListener('scroll',onScroll,{passive:true});
  var x=document.getElementById('ppop-x'); if(x) x.addEventListener('click',close);
  pop.addEventListener('click',function(e){ if(e.target===pop) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  ['ppop-details','ppop-details2'].forEach(function(id){ var a=document.getElementById(id); if(a){ a.target='_blank'; a.rel='noopener'; } });
  function reveal(){ markDone(); var w=document.getElementById('ppop-form-wrap'); if(w) w.classList.add('hide'); var s=document.getElementById('ppop-success'); if(s) s.classList.add('show'); }
  var form=document.getElementById('ppop-form');
  if(form){ form.addEventListener('submit',function(ev){
    ev.preventDefault();
    var btn=form.querySelector('button[type=submit]'); if(btn){ btn.disabled=true; btn.textContent='Revealing…'; }
    var body=new URLSearchParams(new FormData(form)).toString();
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body})
      .then(function(){ reveal(); }).catch(function(){ reveal(); });
  }); }
  var copy=document.getElementById('ppop-copy');
  if(copy) copy.addEventListener('click',function(){
    var code=document.getElementById('ppop-code').textContent.trim();
    try{ if(navigator.clipboard) navigator.clipboard.writeText(code); }catch(e){}
    copy.textContent='Copied!'; setTimeout(function(){ copy.textContent='Copy code'; },1800);
  });
})();
