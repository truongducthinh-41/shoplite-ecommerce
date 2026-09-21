import React, { useEffect, useRef } from 'react';
import './VertexHero.css';

function makeStars(n, minA, maxA, blur) {
  let a = [];
  for (let i = 0; i < n; i++) {
    const rx = Math.random() * 100;
    const ry = Math.random() * 100;
    const alpha = minA + Math.random() * (maxA - minA);
    a.push(`${rx}vw ${ry}vh ${blur}px 0 rgba(255,255,255,${alpha.toFixed(3)})`);
  }
  return a.join(',');
}

export default function VertexHero({ products = [], bestSellers = [] }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const stARef = useRef(null);
  const stBRef = useRef(null);
  const ringRef = useRef(null);
  
  // Element refs for type fitter
  const h1aRef = useRef(null);
  const h1bRef = useRef(null);
  const sub1Ref = useRef(null);
  const sub2Ref = useRef(null);
  
  // Carousel refs
  const cardsRef = useRef([]);

  // Init stars
  useEffect(() => {
    if (stARef.current) stARef.current.style.boxShadow = makeStars(150, 0.05, 0.30, 0);
    if (stBRef.current) stBRef.current.style.boxShadow = makeStars(18, 0.35, 0.70, 1.2);
  }, []);

  // Responsiveness & Type Fitter
  useEffect(() => {
    let k = 1;
    let isPhone = false;
    const TAB_MAX = 1080, TAB_MIN = 701, DW_MIN = 920;
    const save = {};
    const capRatioCache = {};

    function fontOf(el) {
      const style = window.getComputedStyle(el);
      return { css: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, size: parseFloat(style.fontSize) };
    }
    function inkWidth(el) { return el.getBoundingClientRect().width / (isPhone ? 1 : k); }
    function capRatio(el) {
      const style = window.getComputedStyle(el);
      const fStr = `${style.fontWeight} 100px ${style.fontFamily}`;
      if (capRatioCache[fStr]) return capRatioCache[fStr];
      const c = document.createElement('canvas'), ctx = c.getContext('2d');
      ctx.font = fStr;
      const val = (ctx.measureText('H').actualBoundingBoxAscent || 70) / 100;
      capRatioCache[fStr] = val; return val;
    }
    function fitBox(el, tw, tc, pre) {
      if(!el) return;
      el.style.transform = pre;
      const cr = capRatio(el);
      el.style.fontSize = `${tc / cr}px`;
      const iw = inkWidth(el);
      el.style.transform = `${pre}${pre ? ' ' : ''}scaleX(${tw / iw})`;
    }
    function baseline(el, y) {
      if(!el) return;
      const size = fontOf(el).size;
      const c = document.createElement('canvas'), ctx = c.getContext('2d');
      ctx.font = fontOf(el).css;
      const m = ctx.measureText('H');
      const A = m.fontBoundingBoxAscent || size * 0.8;
      const D = m.fontBoundingBoxDescent || size * 0.2;
      el.style.top = `${y - ((size - (A + D)) / 2 + A)}px`;
    }
    const els = {
      h1a: h1aRef.current, h1b: h1bRef.current, sub1: sub1Ref.current, sub2: sub2Ref.current
    };

    function applyPhoneStyles() {
      for (const id in els) {
        if(els[id]) {
          els[id].style.fontSize = '';
          els[id].style.top = '';
          els[id].style.transform = '';
        }
      }
    }

    function layout() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const cv = canvasRef.current;
      if(!cv) return;
      isPhone = vw <= 700;
      
      if (isPhone) {
        k = 1; cv.style.removeProperty('--k'); cv.style.removeProperty('--fill');
        applyPhoneStyles();
        return;
      }
      
      let W = 1172, tboost = 1, ramp = 0, fill = 0, stshift = 0, sshift = 0, rs = 1;
      if (vw <= TAB_MAX) {
        W = DW_MIN + (vw - TAB_MIN) * (1172 - DW_MIN) / (TAB_MAX - TAB_MIN);
        if (vh > vw * 1.15) W = Math.min(W, 900);
        ramp = Math.min(1, (TAB_MAX - vw) / 120);
        tboost = 1 + 0.14 * ramp;
      }
      k = Math.min(vw / W, vh / 560);
      
      if (vw <= TAB_MAX) {
        fill = Math.max(0, vh / k - 657);
        if (fill > 0) {
          const ss = Math.min(fill * 0.55, 420) * ramp;
          rs = 1 + Math.min(fill / 1100, 0.75) * ramp;
          const slack = 219.5 - 125 * rs + ss;
          stshift = Math.max(0, slack / 2 - 28) * ramp;
          fill -= ss;
        }
      }
      cv.style.setProperty('--k', k);
      cv.style.setProperty('--fill', `${fill}px`);
      cv.style.setProperty('--stshift', `${stshift}px`);
      cv.style.setProperty('--sshift', `${sshift}px`);
      cv.style.setProperty('--rs', rs);
      
      for (const id in els) {
        if(els[id]) { els[id].style.fontSize = ''; els[id].style.top = ''; els[id].style.transform = ''; }
      }
      
      const T = tboost;
      // Shifted elements up by 15px to accommodate the button above the cards
      fitBox(els.h1a, 563.5 * T, 37.2 * T, 'translateX(-50%)'); baseline(els.h1a, 149.5);
      fitBox(els.h1b, 197.5 * T, 37.2 * T, 'translateX(-50%)'); baseline(els.h1b, 203.5);
      fitBox(els.sub1, 389 * T, 8.4 * T, 'translateX(-50%)'); baseline(els.sub1, 245.5);
      fitBox(els.sub2, 311 * T, 8.4 * T, 'translateX(-50%)'); baseline(els.sub2, 261.5);
      
      for (const id in els) {
        if(els[id]) save[id] = { fontSize: els[id].style.fontSize, top: els[id].style.top, transform: els[id].style.transform };
      }
    }

    window.addEventListener('resize', layout);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', layout);
    layout();
    if(document.fonts) document.fonts.ready.then(layout);
    const t1 = setTimeout(layout, 400);
    const t2 = setTimeout(layout, 1400);

    return () => {
      window.removeEventListener('resize', layout);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', layout);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Carousel
  useEffect(() => {
    let phase = -2;
    let lastTime = performance.now();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const R = 891;
    const n = 37;
    const step = 360 / n;
    let reqId;

    function tick(t) {
      const dt = Math.min((t - lastTime) / 1000, 0.1);
      lastTime = t;
      if (!prefersReduced.matches) phase -= 1.9 * dt;
      
      for (let i = 0; i < n; i++) {
        const card = cardsRef.current[i];
        if (!card) continue;
        const a = ((i * step + phase) % 360 + 540) % 360 - 180;
        if (Math.abs(a) > 42) {
          card.style.visibility = 'hidden';
        } else {
          card.style.visibility = 'visible';
          const r = a * Math.PI / 180;
          const c = Math.cos(r);
          card.style.transform = `translate3d(${R * Math.sin(r)}px, 0, ${R * (1 - c)}px) rotateY(${-a}deg)`;
          card.style.filter = `brightness(${0.84 + 0.5 * (1 / c - 1)})`;
        }
      }
      reqId = requestAnimationFrame(tick);
    }
    
    function onVisChange() { if (!document.hidden) lastTime = performance.now(); }
    document.addEventListener('visibilitychange', onVisChange);
    
    reqId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(reqId);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  // Entrance Timeline
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function settle() {
      if(!wrapper) return;
      document.getAnimations().forEach(a => { if (a.id && a.id.startsWith('intro:')) a.cancel(); });
      wrapper.classList.remove('intro');
    }

    if (!wrapper.classList.contains('intro') || prefersReduced.matches || !Element.prototype.animate) {
      settle();
      return;
    }
    
    const D = window.innerWidth <= 700 ? 0.66 : 1;
    const EXPO = 'cubic-bezier(.16,1,.3,1)', SOFT = 'cubic-bezier(.22,.61,.36,1)';
    const Y = px => `0 ${px * D}px`;
    
    let animCount = 0;
    let finishedCount = 0;

    function checkDone() { if (++finishedCount === animCount) settle(); }

    function play(sel, from, dur, dly, ease) {
      const nodes = typeof sel === 'string' ? wrapper.querySelectorAll(sel) : [sel];
      nodes.forEach(node => {
        const to = { opacity: 1 };
        if (from.translate !== undefined) to.translate = '0 0';
        if (from.scale !== undefined) to.scale = '1';
        if (from.clipPath !== undefined) to.clipPath = 'inset(-30% 0 -30% 0)';
        
        const a = node.animate([from, to], { duration: dur, delay: dly, easing: ease, fill: 'both' });
        a.id = `intro:${animCount++}`;
        a.finished.then(checkDone).catch(()=>{});
      });
    }
    

    play('.h1-a',       { opacity: 0, translate: Y(15), clipPath: 'inset(100% 0 -30% 0)' }, 900, 380, EXPO);
    play('.h1-b',       { opacity: 0, translate: Y(15), clipPath: 'inset(100% 0 -30% 0)' }, 900, 470, EXPO);
    play('.sub-1',      { opacity: 0, translate: Y(10) }, 620, 690, EXPO);
    play('.sub-2',      { opacity: 0, translate: Y(10) }, 620, 745, EXPO);
    play('.cta2',       { opacity: 0, translate: Y(13), scale: 0.985 }, 620, 830, EXPO);
    play('.ring',       { opacity: 0, translate: Y(18), scale: 0.99 }, 950, 700, EXPO);

    const failsafe = setTimeout(settle, 4000);
    return () => clearTimeout(failsafe);
  }, []);

  const ringItems = products && products.length > 0 
    ? products 
    : [{ image_url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110504_0316394c-37bd-432b-a1f2-ee46a461c22b.png', name: 'Placeholder' }];

  const renderCard = (product, i) => {
    return (
      <div key={i} className="card" ref={el => cardsRef.current[i] = el}>
        <div className="ph phf" style={{background: '#fff'}}>
           {product.image_url && <img alt={product.name} src={product.image_url} style={{objectFit:'cover', width: '100%', height: '100%'}} onError={(e) => { e.currentTarget.parentNode.parentNode.classList.add('broken'); }} />}
        </div>
        <div className="fill" style={{background:'linear-gradient(180deg,rgba(4,8,16,0) 38%,rgba(4,8,16,.95) 88%)'}}></div>
        <div className="cv" style={{top:'250px',fontSize:'12px',fontWeight:600,letterSpacing:'.05em',color:'#fff', textAlign:'center', width:'100%', padding:'0 10px'}}>{product.name}</div>
        <div className="edge"></div>
      </div>
    );
  };

  const bSellers = bestSellers && bestSellers.length >= 4 
    ? bestSellers.slice(0, 4) 
    : Array(4).fill({ image_url: '', name: 'Loading...', price: '0.00' });

  return (
    <div className="vertex-hero-wrapper intro" ref={wrapperRef}>
      <div className="stage" aria-hidden="true">
        <div className="bg"></div>
        <div className="stars" ref={stARef}></div>
        <div className="stars" ref={stBRef}></div>
      </div>

      <div className="canvas" ref={canvasRef}>
        <div className="stack">
          <div className="h1 h1-a" ref={h1aRef}>Streamline your</div>
          <div className="h1 h1-b" ref={h1bRef}>Shopping</div>

          <div className="sub sub-1" ref={sub1Ref}><b>Intelligent product discovery / <span className="nb">E-commerce</span></b> orchestrated with</div>
          <div className="sub sub-2" ref={sub2Ref}>seamless checkouts, performance, and dark aesthetics.</div>

          <a 
            href="#products" 
            className="cta2"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }}
          >
            <span>Explore Catalog</span>
          </a>
        </div>

        <div className="showcase">
          <div className="ring" ref={ringRef}>
            {Array.from({ length: 37 }).map((_, i) => renderCard(ringItems[i % ringItems.length], i))}
          </div>
        </div>
      </div>
    </div>
  );
}
