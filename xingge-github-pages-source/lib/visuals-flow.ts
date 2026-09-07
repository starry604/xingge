import p5 from 'p5';

export function mountFlow(enabled:boolean):()=>void {
  const host=document.getElementById('flow-mount');if(!host)return ()=>{};
  let active=false;let destroyed=false;let ready=false;
  const sketch=new p5(p=>{
    let time=0;
    p.setup=()=>{if(destroyed)return;const canvas=p.createCanvas(host.clientWidth,host.clientHeight);canvas.parent(host);canvas.attribute('aria-hidden','true');ready=true;p.pixelDensity(Math.min(window.devicePixelRatio,1.4));p.frameRate(24);p.noFill();p.noiseSeed(27);if(!enabled||!active)p.noLoop();};
    p.draw=()=>{
      p.clear();const rows=p.width<760?24:42;const step=p.width<760?25:19;
      for(let row=0;row<rows;row++){
        const yBase=(row/(rows-1))*(p.height+180)-90;
        p.stroke(139,176,89,22+(row%5)*7);p.strokeWeight(row%7===0?1.1:.7);p.beginShape();
        for(let x=-30;x<=p.width+30;x+=step){const noise=p.noise(x*.0015,row*.065,time*.07);const wave=Math.sin(x*.003+time*.13+row*.105)*80;const distance=Math.abs(x-p.mouseX);const influence=enabled&&p.mouseY>=0&&p.mouseY<p.height?Math.max(0,1-distance/240)*Math.sin(time*.3+row*.18)*25:0;p.vertex(x,yBase+(noise-.5)*150+wave+influence);}
        p.endShape();
      }
      if(enabled)time+=.024;
    };
  });
  const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(enabled&&active&&!document.hidden)sketch.loop();else sketch.noLoop();});observer.observe(host);
  const resize=new ResizeObserver(()=>{if(!ready)return;sketch.resizeCanvas(host.clientWidth,host.clientHeight);if(!enabled||!active)void sketch.redraw();});resize.observe(host);
  const visibility=()=>{if(document.hidden)sketch.noLoop();else if(enabled&&active)sketch.loop();};document.addEventListener('visibilitychange',visibility);
  return ()=>{destroyed=true;observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',visibility);sketch.remove();};
}


