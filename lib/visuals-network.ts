import * as d3 from 'd3';

type Node = d3.SimulationNodeDatum & { id: string; label:string; detail:string; r:number; homeX:number; homeY:number };
type Link = d3.SimulationLinkDatum<Node>;

export function mountNetwork(enabled:boolean):()=>void {
  const host=document.getElementById('network-mount');
  const description=document.getElementById('network-description');
  if(!host)return ()=>{};
  const data=[
    ['xing','星哥','从一个具体问题开始，连接想法、技术和合适的合作。',250,220,43],
    ['idea','想法','聊聊你的想法：为谁解决什么问题，第一步怎样验证。',117,79,29],
    ['ai','AI 技术','聊聊 AI 应用：从实际任务出发，判断工具能帮你做到哪一步。',375,91,33],
    ['product','产品','聊聊产品：目标用户、核心功能与最值得先做的体验。',433,248,29],
    ['content','内容','聊聊内容：选题、表达和创作流程，怎样更贴近你的受众。',338,365,30],
    ['channel','渠道','聊聊渠道：你现在怎样接触客户，手里有哪些可以用好的资源。',147,357,29],
    ['partner','合作','聊聊合作：各自能提供什么，怎样找到一个共同推进的起点。',63,214,30],
  ] as const;
  const nodes:Node[]=data.map(([id,label,detail,x,y,r])=>({id,label,detail,x,y,homeX:x,homeY:y,r, ...(id==='xing'?{fx:x,fy:y}:{})}));
  const links:Link[]=nodes.slice(1).map(n=>({source:'xing',target:n.id}));
  links.push({source:'idea',target:'ai'},{source:'ai',target:'product'},{source:'product',target:'content'},{source:'content',target:'channel'},{source:'channel',target:'partner'},{source:'partner',target:'idea'});
  const svg=d3.select(host).append('svg').attr('viewBox','0 0 500 440').attr('role','group').attr('aria-label','合作方向关系图，选择节点查看介绍');
  svg.append('circle').attr('cx',250).attr('cy',220).attr('r',176).attr('fill','none').attr('stroke','#6a81502a').attr('stroke-dasharray','2 8');
  svg.append('circle').attr('cx',250).attr('cy',220).attr('r',116).attr('fill','none').attr('stroke','#6a815017');
  const lines=svg.append('g').selectAll('line').data(links).join('line').attr('stroke','#759250').attr('stroke-opacity',.32).attr('stroke-width',1);
  const node=svg.append('g').selectAll<SVGGElement,Node>('g').data(nodes).join('g').attr('role','button').attr('tabindex',0).attr('aria-pressed','false').attr('aria-label',d=>`${d.label}：${d.detail}`);
  node.append('circle').attr('r',d=>d.r+6).attr('fill','none').attr('stroke',d=>d.id==='xing'?'#c7f5783a':'#59753b25');
  node.append('circle').attr('r',d=>d.r).attr('fill',d=>d.id==='xing'?'#c7f578':'#192312').attr('stroke',d=>d.id==='xing'?'#e4ffba':'#657e49');
  node.append('text').text(d=>d.label).attr('text-anchor','middle').attr('dy','.35em').attr('fill',d=>d.id==='xing'?'#20300f':'#c8d7ba').attr('font-size',d=>d.id==='xing'?19:13).attr('font-weight',d=>d.id==='xing'?650:400).style('pointer-events','none');
  let selected='xing';
  const select=(_event:unknown,d:Node)=>{selected=d.id;if(description)description.textContent=d.detail;node.attr('aria-pressed',n=>String(n.id===selected));node.selectAll<SVGCircleElement,Node>('circle').attr('stroke',n=>n.id===selected?'#d5ff99':n.id==='xing'?'#c7f578':'#657e49');lines.attr('stroke-opacity',l=>(l.source as Node).id===d.id||(l.target as Node).id===d.id?.85:.16);};
  node.on('click',select).on('keydown',(event:KeyboardEvent,d:Node)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(event,d);}});
  const simulation=d3.forceSimulation(nodes).force('link',d3.forceLink<Node,Link>(links).id(d=>d.id).strength(.045)).force('charge',d3.forceManyBody().strength(-95)).force('x',d3.forceX<Node>(d=>d.homeX).strength(.18)).force('y',d3.forceY<Node>(d=>d.homeY).strength(.18)).force('collide',d3.forceCollide<Node>(d=>d.r+15)).stop();
  const tick=()=>{nodes.forEach(n=>{n.x=Math.max(n.r+9,Math.min(500-n.r-9,n.x??n.homeX));n.y=Math.max(n.r+9,Math.min(440-n.r-9,n.y??n.homeY));});node.attr('transform',d=>`translate(${d.x},${d.y})`);lines.attr('x1',d=>(d.source as Node).x!).attr('y1',d=>(d.source as Node).y!).attr('x2',d=>(d.target as Node).x!).attr('y2',d=>(d.target as Node).y!);};
  for(let i=0;i<100;i++)simulation.tick();tick();simulation.on('tick',tick);
  let visible=false;
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(enabled&&visible&&!document.hidden)simulation.alpha(.2).restart();else simulation.stop();});observer.observe(host);
  const visibility=()=>{if(document.hidden)simulation.stop();else if(enabled&&visible)simulation.alpha(.13).restart();};document.addEventListener('visibilitychange',visibility);
  const drag=d3.drag<SVGGElement,Node>().on('start',(event,d)=>{if(enabled)simulation.alphaTarget(.1).restart();d.fx=d.x;d.fy=d.y;}).on('drag',(event,d)=>{d.fx=Math.max(d.r+10,Math.min(490-d.r,event.x));d.fy=Math.max(d.r+10,Math.min(430-d.r,event.y));if(!enabled){d.x=d.fx;d.y=d.fy;tick();}}).on('end',(_event,d)=>{simulation.alphaTarget(0);if(d.id!=='xing'){d.fx=null;d.fy=null;}}).touchable(false);
  node.call(drag);
  return ()=>{simulation.stop();observer.disconnect();document.removeEventListener('visibilitychange',visibility);svg.remove();if(description)description.textContent='选择一个节点，看看我们可以聊什么。';};
}
