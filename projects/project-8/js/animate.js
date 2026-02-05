(function(){
  window.addEventListener("load", () => {
    document.body.classList.add("pageReady");
    setupReveal();
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupReveal(){
    document.querySelectorAll(".card, .panel").forEach((el, i) => {
      el.classList.add("reveal");
      if(el.closest(".grid")){
        el.style.setProperty("--d", `${Math.min(240, i*35)}ms`);
      }
    });

    const els = [...document.querySelectorAll(".reveal")];
    if(!("IntersectionObserver" in window)){
      els.forEach(e=>e.classList.add("show"));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          en.target.classList.add("show");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(e=>io.observe(e));
  }

  if(!reduce){
    document.addEventListener("click", (e)=>{
      const btn = e.target.closest(".btn, .iconBtn, .sheetOpenBtn, .sheetSoftBtn");
      if(!btn) return;

      const r = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (e.clientX - rect.left) - size/2;
      const y = (e.clientY - rect.top) - size/2;

      r.style.position = "absolute";
      r.style.left = x + "px";
      r.style.top = y + "px";
      r.style.width = size + "px";
      r.style.height = size + "px";
      r.style.borderRadius = "999px";
      r.style.background = "rgba(255,255,255,.35)";
      r.style.transform = "scale(0)";
      r.style.opacity = "1";
      r.style.pointerEvents = "none";
      r.style.transition = "transform .45s ease, opacity .55s ease";

      const pos = getComputedStyle(btn).position;
      if(pos === "static") btn.style.position = "relative";
      btn.style.overflow = "hidden";

      btn.appendChild(r);
      requestAnimationFrame(()=>{ r.style.transform = "scale(1)"; r.style.opacity = "0"; });
      setTimeout(()=> r.remove(), 650);
    });
  }
})();
