import * as THREE from 'three';

export function mountOrbit(enabled: boolean): () => void {
  const host = document.getElementById('orbit-mount');
  if (!host) return () => {};
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.innerWidth > 760, powerPreference: 'low-power' }); }
  catch { return () => {}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden','true');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  camera.position.z = 7.8;
  const group = new THREE.Group();
  scene.add(group);
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const addRing = (radius:number, rotation:[number,number,number], color:number, opacity:number) => {
    const points = Array.from({length:321},(_,i)=>{const a=i/320*Math.PI*2;return new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius,0);});
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color, transparent:true, opacity});
    const ring = new THREE.LineLoop(geometry,material);
    ring.rotation.set(...rotation); group.add(ring);materials.push(material);geometries.push(geometry);
    return ring;
  };
  addRing(2.15,[.36,.25,-.6],0xd6e7c3,.56);
  addRing(2.18,[.38,.25,-.6],0x97b37e,.23);
  addRing(2.22,[1.1,.23,-.45],0xc7f578,.67);
  addRing(2.25,[1.12,.24,-.45],0xa9ca84,.26);
  addRing(2.1,[.24,1.08,.55],0xa7b897,.4);
  addRing(2.2,[.2,1.15,-.8],0xc3d2b3,.25);
  addRing(2.48,[1.22,-.37,.25],0x7a925f,.29);
  // Sparse points suggest a spherical volume without covering the portrait.
  const count = window.innerWidth < 760 ? 370 : 750;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c = new THREE.Color();
  for(let i=0;i<count;i++) {
    const a=i*2.39996323, y=1-2*(i+.5)/count, r=Math.sqrt(1-y*y), scale=2.08 + .08*Math.sin(i*6.7);
    positions.set([Math.cos(a)*r*scale,y*scale,Math.sin(a)*r*scale],i*3);
    c.set(i%8===0 ? 0xc7f578 : 0x739164); colors.set([c.r,c.g,c.b],i*3);
  }
  const dotsGeometry=new THREE.BufferGeometry();dotsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));dotsGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const dotsMaterial=new THREE.PointsMaterial({size:.016,vertexColors:true,transparent:true,opacity:.67,sizeAttenuation:true,depthWrite:false});
  const dots=new THREE.Points(dotsGeometry,dotsMaterial);group.add(dots);geometries.push(dotsGeometry);materials.push(dotsMaterial);
  const satelliteGeometry=new THREE.SphereGeometry(.034,12,12);const satelliteMaterial=new THREE.MeshBasicMaterial({color:0xd5ff95});geometries.push(satelliteGeometry);materials.push(satelliteMaterial);
  const satellites = Array.from({length:5},()=>{const dot = new THREE.Mesh(satelliteGeometry,satelliteMaterial);group.add(dot);return dot;});
  let visible=true,frame=0,last=0,time=0;const pointer={x:0,y:0};
  const render = () => renderer.render(scene,camera);
  const size = () => {const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();};
  const resize=new ResizeObserver(size);resize.observe(host);
  const update = () => {group.rotation.y=pointer.x*.09+Math.sin(time*.1)*.055;group.rotation.x=pointer.y*.045;dots.rotation.y=time*.027;satellites.forEach((dot,i)=>{const angle=time*.13+i*1.25;dot.position.set(Math.cos(angle)*2.2,Math.sin(angle)*1.34,Math.sin(angle)*1.71);});render();};
  const loop=(now:number)=>{frame=requestAnimationFrame(loop);if(!enabled||!visible||document.hidden||now-last<33)return;const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;update();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.01});observer.observe(host);
  const onPointer=(event:PointerEvent)=>{if(event.pointerType==='touch')return;const rect=host.getBoundingClientRect();pointer.x=(event.clientX-rect.left)/rect.width-.5;pointer.y=(event.clientY-rect.top)/rect.height-.5;};
  if(enabled){window.addEventListener('pointermove',onPointer,{passive:true});frame=requestAnimationFrame(loop);}size();update();
  return ()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener('pointermove',onPointer);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
}
