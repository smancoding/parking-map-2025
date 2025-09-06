const map=new maplibregl.Map({container:'map',style:'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',center:[37.617,55.751],zoom:11.6,attributionControl:false});
map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');

function $(id){return document.getElementById(id)}
const $dow=$('dow'),$hour=$('hour'),$hourV=$('hourV'),$size=$('size'),$fill=$('fill');
(function(){const c=$('zoomctl');c.addEventListener('mousedown',e=>e.stopPropagation());$('zin').onclick=()=>map.zoomIn();$('zout').onclick=()=>map.zoomOut()})();
function z4(x){x=String(x??'').trim().replace(/^0+/,'');return('0000'+(x||'0')).slice(-4)}

const capacityByKey={},centroidByKey={},priceByKey={};let rows=[];

function bboxOfCoords(coords,b){b=b||{minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};if(!Array.isArray(coords))return b;const isNum=coords.length===2&&typeof coords[0]==='number';if(isNum){const x=coords[0],y=coords[1];if(x<b.minX)b.minX=x;if(y<b.minY)b.minY=y;if(x>b.maxX)b.maxX=x;if(y>b.maxY)b.maxY=y;return b}for(const c of coords)bboxOfCoords(c,b);return b}
function centerOfGeom(geom){try{const b=bboxOfCoords(geom.coordinates);return[(b.minX+b.maxX)/2,(b.minY+b.maxY)/2]}catch(e){return null}}
function setCentroid(zone,lng,lat){const k=z4(zone);if(!centroidByKey[k])centroidByKey[k]=[lng,lat]}

function parseCSV(txt){const raw=txt.replace(/\r\n/g,'\n').replace(/\r/g,'\n');const lines=raw.split('\n').filter(l=>l.trim());const head=lines[0];const sep=head.split(';').length>head.split(',').length?';':',';const H=head.split(sep).map(h=>h.trim().toLowerCase());const ix=n=>H.findIndex(h=>n.some(x=>h.includes(x)));const iz=ix(['zone','зона']);const id=ix(['day','день']);const ih=ix(['hour','час']);const iv=ix(['avg','active','value']);const out=[];for(let i=1;i<lines.length;i++){const c=lines[i].split(sep);if(c.length<H.length)continue;const z=z4(c[iz]),d=+c[id],h=+c[ih],v=+c[iv];if(!z||!isFinite(d)||!isFinite(h)||!isFinite(v))continue;out.push({zone:z,dow:d,hour:h,val:v})}return out}

function buildPoints(dow,hour){
  const data=rows.filter(r=>r.dow===dow&&r.hour===hour);
  const vals=data.map(r=>r.val).sort((a,b)=>a-b);
  const q=p=>vals.length?vals[Math.min(vals.length-1,Math.max(0,Math.floor(p*vals.length)))]:0;
  const br=[q(.25)||0,q(.50)||0,q(.75)||0,q(.90)||0];
  const colors=(v)=>v<=br[0]?'#8CFCA4':v<=br[1]?'#FFD166':v<=br[2]?'#FF9E6E':v<=br[3]?'#FF6B6B':'#E11D48';
  const base=Number($size?.value||4);const fixed=Math.max(12,Math.min(22,base*4));
  const feats=[];
  for(const r of data){const pt=centroidByKey[r.zone];if(!pt)continue;feats.push({type:'Feature',geometry:{type:'Point',coordinates:pt},properties:{zone:r.zone,val:r.val,rad:fixed,color:colors(r.val),price:priceByKey[r.zone]??null}})}
  return {fc:{type:'FeatureCollection',features:feats}, br};
}

function ensureSources(){
  if(!map.getSource('points'))map.addSource('points',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  if(!map.getSource('labels'))map.addSource('labels',{type:'geojson',data:{type:'FeatureCollection',features:[]}})
}

function drawLayers(){
  if(!map.getLayer('circles')){
    map.addLayer({id:'circles',type:'circle',source:'points',paint:{
      'circle-radius':['interpolate',['linear'],['zoom'],10,['*',['get','rad'],0.9],12,['get','rad'],14,['*',['get','rad'],1.15]],
      'circle-color':['get','color'],
      'circle-opacity':0.85,
      'circle-stroke-color':'#0b0b0b',
      'circle-stroke-width':1
    }});
  }
  if(!map.getLayer('labels')){
    map.addLayer({id:'labels',type:'symbol',source:'labels',layout:{
      'text-field':['to-string',['get','price']],
      'text-font':['Open Sans Bold','Arial Unicode MS Bold'],
      'text-size':['get','ts'],
      'text-anchor':'center',
      'text-allow-overlap':true,
      'text-ignore-placement':true
    },paint:{
      'text-opacity':1,
      'text-color':'#111111',
      'text-halo-color':'#ffffff',
      'text-halo-width':1.6,
      'text-halo-blur':0.2
    }});
  }
}

function pickNonCollidingLabels(features){
  const z=map.getZoom(); if(z<11) return [];
  const kept=[],occupied=[];
  for(const f of features.sort((a,b)=>(b.properties.val)-(a.properties.val))){
    if(f.properties.price==null)continue;
    const p=map.project(f.geometry.coordinates);
    const radPx=(f.properties.rad*(z>=14?1.15:z>=12?1:0.9));
    const sep=radPx*2+6;
    let ok=true;
    for(const q of occupied){const dx=p.x-q.x,dy=p.y-q.y;if((dx*dx+dy*dy)<(sep*sep)){ok=false;break}}
    if(ok){occupied.push(p);const g=JSON.parse(JSON.stringify(f));g.properties.ts=Math.max(10,Math.min(24,radPx*0.8));kept.push(g)}
  }
  return kept
}

function legend(br){
  const el=$('legend');el.innerHTML='';
  const t=document.createElement('div');t.style.fontWeight='700';t.style.marginBottom='6px';t.textContent='Средняя загруженность';el.appendChild(t);
  const labels=['≤ '+br[0],(br[0]+Number.EPSILON)+'–'+br[1],(br[1]+Number.EPSILON)+'–'+br[2],(br[2]+Number.EPSILON)+'–'+br[3],'> '+br[3]];
  const colors=['#8CFCA4','#FFD166','#FF9E6E','#FF6B6B','#E11D48'];
  for(let i=0;i<labels.length;i++){
    const row=document.createElement('div');row.style.display='flex';row.style.alignItems='center';row.style.margin='4px 0';
    const sw=document.createElement('span');sw.style.display='inline-block';sw.style.width='10px';sw.style.height='10px';sw.style.borderRadius='50%';sw.style.backgroundColor=colors[i];sw.style.marginRight='8px';
    const tx=document.createElement('span');tx.textContent=labels[i];
    row.appendChild(sw);row.appendChild(tx);el.appendChild(row)
  }
}

function refresh(){
  ensureSources();drawLayers();
  const dow=+($dow.value),hour=+($hour.value);$hourV.textContent=hour;
  const res=buildPoints(dow,hour);
  map.getSource('points').setData(res.fc);
  legend(res.br);
  updateLabels();
  const f=Number($fill?.value||50)/100;
  try{map.setPaintProperty('zones-glow','line-opacity',0.06+0.30*f)}catch(e){}
  try{map.setPaintProperty('zones-line','line-opacity',0.35+0.55*f)}catch(e){}
}

function updateLabels(){
  const src=map.getSource('points');if(!src)return;
  const feats=src._data?src._data.features:src._options.data.features;
  const labels=pickNonCollidingLabels(feats||[]);
  map.getSource('labels').setData({type:'FeatureCollection',features:labels});
}

$dow.onchange=refresh;$hour.oninput=refresh;$size&&($size.oninput=refresh);$fill&&($fill.oninput=refresh);
map.on('moveend',updateLabels);map.on('zoomend',updateLabels);

map.on('load',async()=>{
  try{const t=await fetch('data-in/tariffs.json').then(r=>r.json());for(const k in t){const v=+t[k];if(isFinite(v))priceByKey[z4(k)]=v}}catch(e){}
  try{const m=await fetch('data-in/zones_meta.json').then(r=>r.json());for(const k in m){const info=m[k]||{},kk=z4(k);if(info.capacity!=null)capacityByKey[kk]=info.capacity;const c=info.center||[];if(c.length>=2){const lat=+c[0],lon=+c[1];if(isFinite(lat)&&isFinite(lon))centroidByKey[kk]=[lon,lat]}}}catch(e){}
  try{const gj=await fetch('data-in/zones.geojson').then(r=>r.json());map.addSource('zones',{type:'geojson',data:gj});map.addLayer({id:'zones-glow',type:'line',source:'zones',paint:{'line-color':'#00eaff','line-width':6,'line-opacity':0.12}});map.addLayer({id:'zones-line',type:'line',source:'zones',paint:{'line-color':'#8ae9ff','line-width':1.6,'line-opacity':0.9}});for(const f of(gj.features||[])){const p=f.properties||{};const z=p.ZoneNumber||p.zone_number||p.ZONENUMBER||p.zone||p.ZONE||p.Zone;if(!z)continue;const c=centerOfGeom(f.geometry);if(c)setCentroid(z,c[0],c[1])}}catch(e){}
  try{const txt=await fetch('data-in/avg_2025.csv?v='+Date.now()).then(r=>r.text());rows=parseCSV(txt)}catch(e){}
  refresh()
});

map.on('load',function(){
  function bind(){
    if(!map.getLayer('circles'))return;
    if(bind.bound)return;
    map.on('mousemove','circles',()=>map.getCanvas().style.cursor='pointer');
    map.on('mouseleave','circles',()=>map.getCanvas().style.cursor='');
    map.on('click','circles',e=>{
      const f=e.features&&e.features[0]; if(!f)return;
      const p=f.properties||{}; const z=p.zone||''; const cap=capacityByKey[z]!=null?capacityByKey[z]:''; const val=p.val!=null?Math.round(p.val*10)/10:'';
      const html='<div style="font-weight:700;margin:0 0 6px">Зона</div><div style="margin:0 0 8px">'+z+'</div><div style="font-weight:700;margin:0 0 6px">Средняя загрузка</div><div style="margin:0 0 8px">'+val+'</div><div style="font-weight:700;margin:0 0 6px">Мест</div><div style="margin:0 0 8px">'+cap+'</div>';
      new maplibregl.Popup({closeButton:true}).setLngLat(e.lngLat).setHTML(html).addTo(map)
    });
    bind.bound=true
  }
  map.on('render',bind)
});
