"use strict";
/* ------------------------------------------------------------------ *
 * Junos CLI simulator
 * ------------------------------------------------------------------ */

/* ---------- configuration schema (drives validation, ?, Tab, render) */
const A = () => ({});                  // leaf / flag
const V = () => ({'*':{}});            // takes one value

const SCHEMA = {
  system:{
    'host-name':V(),
    'domain-name':V(),
    'time-zone':V(),
    'root-authentication':{'plain-text-password':{'*':{}},'encrypted-password':V(),'ssh-rsa':V()},
    'name-server':V(),
    services:{
      ssh:{'protocol-version':V(),port:V(),'connection-limit':V(),'rate-limit':V(),'root-login':V()},
      telnet:{'connection-limit':V(),'rate-limit':V()},
      'netconf':{ssh:A()},
      'web-management':{http:{interface:V()},https:{'system-generated-certificate':A()}},
      'dhcp-local-server':{group:{'*':{interface:V()}}}
    },
    login:{
      user:{'*':{class:V(),uid:V(),'full-name':V(),
        authentication:{'plain-text-password':{'*':{}},'encrypted-password':V(),'ssh-rsa':V()}}},
      message:V(),
      class:{'*':{permissions:V()}}
    },
    syslog:{host:{'*':{'any':V()}},file:{'*':{'any':V()}}}
  },
  chassis:{'aggregated-devices':{ethernet:{'device-count':V()}}},
  interfaces:{'*':{
    description:V(), disable:A(), 'vlan-tagging':A(), mtu:V(),
    'ether-options':{'802.3ad':V(),'link-mode':V(),speed:{'*':{}},'no-auto-negotiation':A()},
    'gigether-options':{'802.3ad':V()},
    'aggregated-ether-options':{lacp:{active:A(),passive:A(),periodic:V(),'system-priority':V()},'minimum-links':V(),'link-speed':V()},
    unit:{'*':{
      description:V(), 'vlan-id':V(), disable:A(),
      family:{
        inet:{address:{'*':{primary:A(),preferred:A(),'vrrp-group':{'*':{'virtual-address':V(),priority:V()}}}},
              filter:{input:V(),output:V()}, dhcp:A(), mtu:V()},
        inet6:{address:{'*':{primary:A(),preferred:A()}},filter:{input:V(),output:V()},
               'dhcpv6-client':{'client-type':V()}},
        'ethernet-switching':{'interface-mode':V(),'port-mode':V(),
               vlan:{members:V()},'storm-control':V()},
        mpls:A(), iso:A()
      }
    }}
  }},
  'routing-options':{
    'router-id':V(),
    static:{route:{'*':{'next-hop':V(),discard:A(),reject:A(),preference:V(),'no-readvertise':A()}}},
    rib:{'*':{static:{route:{'*':{'next-hop':V(),discard:A()}}}}},
    'autonomous-system':V()
  },
  protocols:{
    ospf:{area:{'*':{interface:{'*':{passive:A(),metric:V(),'interface-type':V()}}}}},
    ospf3:{area:{'*':{interface:{'*':{}}}}},
    rstp:{interface:{'*':{edge:A(),'no-root-port':A(),cost:V(),priority:V(),mode:V(),'bpdu-timeout-action':{block:A(),alarm:A()}}},
          'bridge-priority':V(),'force-version':V(),'hello-time':V(),'max-age':V(),'forward-delay':V(),
          'bpdu-block-on-edge':A()},
    mstp:{interface:{'*':{edge:A(),cost:V()}},'bridge-priority':V(),'configuration-name':V(),'revision-level':V()},
    'igmp-snooping':{vlan:{'*':{}}},
    'router-advertisement':{interface:{'*':{prefix:{'*':{'valid-lifetime':V(),'preferred-lifetime':V(),'autonomous':A()}},
        'managed-configuration':A(),'other-stateful-configuration':A(),
        'max-advertisement-interval':V(),'min-advertisement-interval':V()}}},
    lldp:{interface:{'*':{}}},
    'layer2-control':{'nonstop-bridging':A()}
  },
  vlans:{'*':{'vlan-id':V(),'l3-interface':V(),description:V(),'vlan-id-list':V(),
              'interface':{'*':{}}}},
  firewall:{
    policer:{'*':{'if-exceeding':{'bandwidth-limit':V(),'burst-size-limit':V(),'bandwidth-percent':V()},
                  then:{discard:A(),'loss-priority':V(),'forwarding-class':V()},'filter-specific':A()}},
    filter:{'*':{term:{'*':{
        from:{protocol:V(),'source-address':V(),'destination-address':V(),'source-port':V(),
              'destination-port':V(),'icmp-type':V(),'tcp-flags':V()},
        then:{policer:V(),accept:A(),discard:A(),reject:A(),count:V(),log:A(),syslog:A(),'next':{term:A()}}
    }}}},
    'family':{'inet6':{filter:{'*':{term:{'*':{from:{'next-header':V()},then:{accept:A(),discard:A()}}}}}}}
  },
  security:{
    zones:{'security-zone':{'*':{
      'host-inbound-traffic':{'system-services':V(),protocols:V()},
      interfaces:{'*':{'host-inbound-traffic':{'system-services':V(),protocols:V()}}},
      'screen':V()
    }}},
    policies:{'from-zone':{'*':{'to-zone':{'*':{policy:{'*':{
        match:{'source-address':V(),'destination-address':V(),application:V()},
        then:{permit:A(),deny:A(),'log':{'session-init':A()}}}}}}}}},
    screen:{'ids-option':{'*':{icmp:{flood:{threshold:V()}}}}}
  },
  access:{'address-assignment':{pool:{'*':{family:{
    inet:{network:V(),range:{'*':{low:V(),high:V()}},
          'dhcp-attributes':{router:V(),'name-server':V(),'domain-name':V(),
            'maximum-lease-time':V(),'propagate-settings':V(),'boot-server':V()}},
    inet6:{prefix:V(),range:{'*':{low:V(),high:V(),'prefix-length':V()}},
          'dhcp-attributes':{'dns-server':V(),'maximum-lease-time':V(),'domain-search':V()}}
  }}}}},
  'forwarding-options':{'dhcp-relay':{'server-group':{'*':{'*':{}}},group:{'*':{interface:V()}}}},
  'policy-options':{'policy-statement':{'*':{term:{'*':{from:{protocol:V()},then:{accept:A(),reject:A()}}}}},
                    'prefix-list':{'*':{'*':{}}}},
  'routing-instances':{'*':{'instance-type':V(),interface:V(),'routing-options':{'static':{route:{'*':{'next-hop':V()}}}}}},
  'class-of-service':{interfaces:{'*':{scheduler_map:V()}}},
  snmp:{community:{'*':{authorization:V()}},location:V(),contact:V()},
  groups:{'*':{}},
  event_options:{}
};
const HELP_TOP = {
  system:'System parameters', chassis:'Chassis configuration', interfaces:'Interface configuration',
  'routing-options':'Protocol-independent routing options', protocols:'Routing and switching protocols',
  vlans:'VLAN configuration', firewall:'Define firewall filters and policers',
  security:'Security zones, policies and screens', access:'Network access (DHCP pools, RADIUS)',
  'forwarding-options':'Forwarding options', 'policy-options':'Routing policy',
  'routing-instances':'Routing instances', 'class-of-service':'CoS', snmp:'SNMP', groups:'Configuration groups'
};
/* containers whose children are named blocks on their own line */
const NOMERGE = new Set(['interfaces','vlans','groups','routing-instances']);
/* containers Junos prints with the child keyword on the same line */
const FORCEMERGE = new Set(['family']);

/* ---------- device state ---------------------------------------- */
const boot = new Date();
const D = {
  user:'root', host:'junos', mode:'op',
  edit:[], cand:{}, comm:{}, history:[], hist:[], hidx:0,
  commitTime:null, pending:null, ping:null, model:'vsrx', ver:'21.4R1.12'
};
const clone = o => JSON.parse(JSON.stringify(o));
const has = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
const empty = o => Object.keys(o).length===0;

/* ---------- screen ------------------------------------------------ */
const screenEl = document.getElementById('screen');
const cmdEl = document.getElementById('cmd');
const promptEl = document.getElementById('prompt');
const bannerEl = document.getElementById('banner');

let capBuf=null;
function out(text,cls){
  if(capBuf){ capBuf.push(String(text)); return; }
  const s=document.createElement('span');
  if(cls) s.className=cls;
  s.textContent=text+'\n';
  screenEl.appendChild(s);
  screenEl.scrollTop=screenEl.scrollHeight;
}
function outRaw(text,cls){ if(text==='') { out(''); return; } text.split('\n').forEach(l=>out(l,cls)); }

function promptStr(){
  return D.mode==='op' ? D.user+'@'+D.host+'> ' : D.user+'@'+D.host+'# ';
}
function editBanner(){
  if(D.mode!=='cfg') return '';
  return D.edit.length ? '[edit '+D.edit.join(' ')+']' : '[edit]';
}
function refresh(){
  promptEl.textContent = D.pending ? D.pending.prompt : promptStr();
  bannerEl.textContent = D.pending ? '' : editBanner();
  cmdEl.type = (D.pending && D.pending.secret) ? 'password' : 'text';
  document.getElementById('hHost').textContent = D.user+'@'+D.host;
  document.getElementById('hMode').textContent =
    D.mode==='op' ? 'operational mode' : 'configuration mode'+(D.edit.length?' — [edit '+D.edit.join(' ')+']':'');
  document.getElementById('hDirty').hidden = !dirty();
}
function dirty(){ return JSON.stringify(D.cand)!==JSON.stringify(D.comm); }

/* ---------- config tree ------------------------------------------ */
function getNode(tree,path){
  let n=tree;
  for(const t of path){ if(!n||!has(n,t)) return null; n=n[t]; }
  return n;
}
function mkNode(tree,path){
  let n=tree;
  for(const t of path){ if(!has(n,t)) n[t]={}; n=n[t]; }
  return n;
}
function delNode(tree,path){
  if(!path.length) return false;
  const p=getNode(tree,path.slice(0,-1));
  const last=path[path.length-1];
  if(!p||!has(p,last)) return false;
  delete p[last];
  // prune empty ancestors
  for(let i=path.length-1;i>0;i--){
    const anc=getNode(tree,path.slice(0,i));
    if(anc && empty(anc)) delNode(tree,path.slice(0,i)); else break;
  }
  return true;
}
function flatten(node,prefix,acc){
  acc=acc||[]; prefix=prefix||[];
  const keys=Object.keys(node);
  if(!keys.length){ acc.push(prefix.join(' ')); return acc; }
  for(const k of keys) flatten(node[k],prefix.concat(k),acc);
  return acc;
}

function schemaAt(path){
  let cur=SCHEMA;
  for(const t of (path||[])){
    if(has(cur,t)) cur=cur[t];
    else if(has(cur,'*')) cur=cur['*'];
    else return null;
  }
  return cur;
}
/* schema walk: validates and returns the statement paths a set creates */
function walk(tokens,base){
  let sch = schemaAt(base||[]);
  if(sch===null) sch = {};            // unknown hierarchy -> permissive
  let cur=sch, path=[], stack=[], done=[];
  for(let i=0;i<tokens.length;i++){
    const t=tokens[i];
    if(has(cur,t)){ stack.push({n:cur,l:path.length}); cur=cur[t]; path.push(t); continue; }
    if(has(cur,'*')){ cur=cur['*']; path.push(t); continue; }
    if(empty(cur)){                       // finished a leaf: try a sibling statement
      let found=-1;
      for(let s=stack.length-1;s>=0;s--){ const p=stack[s].n; if(has(p,t)||has(p,'*')){ found=s; break; } }
      if(found>=0){
        done.push(path.slice());
        cur=stack[found].n; path=path.slice(0,stack[found].l); stack=stack.slice(0,found);
        i--; continue;
      }
    }
    return {ok:false,idx:i,node:cur};
  }
  done.push(path.slice());
  return {ok:true,paths:done,node:cur};
}
function completions(tokens,base){
  const w = tokens.length ? walk(tokens,base) : {ok:true,node:schemaAt(base||[])||SCHEMA};
  if(!w.ok) return null;
  const n=w.node||{};
  const out=[];
  for(const k of Object.keys(n)){
    if(k==='*') out.push({k:'<value>',d:'Value for this statement'});
    else out.push({k:k,d:HELP_TOP[k]||describe(k,n[k])});
  }
  return out;
}
function describe(k,n){
  if(empty(n)) return 'Set this flag';
  if(has(n,'*') && Object.keys(n).length===1) return 'Takes a value';
  return 'Configuration hierarchy';
}

/* ---------- rendering the braces format --------------------------- */
function renderCfg(node,sch,ind){
  const lines=[]; ind=ind||0; const pad='    '.repeat(ind);
  let keys=Object.keys(node);
  if(sch){
    const order=Object.keys(sch);
    keys=keys.map((k,i)=>({k:k,i:i,o:order.indexOf(k)}))
             .sort((a,b)=>(a.o<0?1e6+a.i:a.o)-(b.o<0?1e6+b.i:b.o)).map(x=>x.k);
  }
  for(const k of keys){
    const child=node[k];
    const s = sch ? (has(sch,k)?sch[k]:(has(sch,'*')?sch['*']:null)) : null;
    const merge = FORCEMERGE.has(k) || (s && has(s,'*') && !NOMERGE.has(k));
    if(merge){
      for(const v of Object.keys(child)){
        const g=child[v];
        const cs = s ? (has(s,'*')?s['*']:(s[v]||null)) : null;
        const secret = (k==='encrypted-password'||k==='ssh-rsa') ? ' ## SECRET-DATA' : '';
        if(empty(g)) lines.push(pad+k+' '+v+';'+secret);
        else {
          const inner=renderCfg(g,cs,ind+1);
          if(inner.length===1 && inner[0].trim().endsWith(';') && (k==='route'||k==='address'))
            lines.push(pad+k+' '+v+' '+inner[0].trim());
          else { lines.push(pad+k+' '+v+' {'); lines.push(...inner); lines.push(pad+'}'); }
        }
      }
    } else if(empty(child)){
      lines.push(pad+k+';');
    } else {
      lines.push(pad+k+' {');
      lines.push(...renderCfg(child,s,ind+1));
      lines.push(pad+'}');
    }
  }
  return lines;
}
function showConfig(tree,path){
  const node = path.length?getNode(tree,path):tree;
  if(node===null) return null;
  const sch = schemaAt(path);
  const lines = renderCfg(node,sch,0);
  return lines.length?lines.join('\n'):'';
}

/* ---------- address helpers --------------------------------------- */
function ip2n(ip){ return ip.split('.').reduce((a,o)=>((a<<8)+(parseInt(o,10)&255))>>>0,0)>>>0; }
function n2ip(n){ return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.'); }
function netOf(ip,len){ const m=len===0?0:(0xFFFFFFFF<<(32-len))>>>0; return n2ip((ip2n(ip)&m)>>>0); }
function sameNet(a,b,len){ const m=len===0?0:(0xFFFFFFFF<<(32-len))>>>0; return ((ip2n(a)&m)>>>0)===((ip2n(b)&m)>>>0); }
function isV6(s){ return s.indexOf(':')>=0; }
function v6Prefix(ip,len){
  if(ip.indexOf('::')>=0) return ip.split('::')[0]+'::';
  const g=ip.split(':').slice(0,Math.max(1,Math.floor(len/16)));
  return g.join(':')+'::';
}
function v6Norm(s){ return s.toLowerCase(); }
function macFor(name){
  let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xffffff;
  const b=[0x08,0x00,0x27,(h>>16)&255,(h>>8)&255,h&255];
  return b;
}
function llaFor(name){
  const b=macFor(name).slice();
  b[0]^=0x02;
  const w=[b[0],b[1],b[2],0xff,0xfe,b[3],b[4],b[5]];
  const g=(x,y)=>((x<<8|y)>>>0).toString(16);
  return 'fe80::'+[g(w[0],w[1]),g(w[2],w[3]),g(w[4],w[5]),g(w[6],w[7])].join(':');
}

/* collect configured units from the committed config */
function ifUnits(tree){
  const list=[]; const ifs=getNode(tree,['interfaces'])||{};
  for(const name of Object.keys(ifs)){
    const units=getNode(ifs,[name,'unit'])||{};
    for(const u of Object.keys(units)){
      const fam=getNode(units,[u,'family'])||{};
      const v4=Object.keys(getNode(fam,['inet','address'])||{});
      const v6=Object.keys(getNode(fam,['inet6','address'])||{});
      const sw=has(fam,'ethernet-switching');
      list.push({name:name,unit:u,ifl:name+'.'+u,v4:v4,v6:v6,sw:sw,
        vlans:Object.keys(getNode(fam,['ethernet-switching','vlan','members'])||{})});
    }
  }
  return list;
}
function localAddrs(tree){
  const a=[];
  for(const u of ifUnits(tree)){
    u.v4.forEach(x=>a.push({ifl:u.ifl,addr:x.split('/')[0],len:+(x.split('/')[1]||32),v6:false}));
    u.v6.forEach(x=>a.push({ifl:u.ifl,addr:v6Norm(x.split('/')[0]),len:+(x.split('/')[1]||128),v6:true}));
    if(u.v6.length && u.name!=='lo0') a.push({ifl:u.ifl,addr:llaFor(u.name),len:128,v6:true,auto:true});
  }
  return a;
}

/* ---------- operational output ------------------------------------ */
const PSEUDO=['dsc','fti0','gre','ipip','irb','lo0','lsi','mtun','pimd','pime','pp0','tap','em1','fxp0'];
const PHYS=['ge-0/0/0','ge-0/0/1','ge-0/0/2'];
function pad(s,n){ s=String(s); return s.length>=n?s+' ':s+' '.repeat(n-s.length); }

function terseRows(tree){
  const cfgIf=getNode(tree,['interfaces'])||{};
  const names=[];
  PHYS.forEach(n=>names.push(n));
  Object.keys(cfgIf).forEach(n=>{ if(names.indexOf(n)<0 && PSEUDO.indexOf(n)<0) names.push(n); });
  PSEUDO.forEach(n=>names.push(n));
  const rows=[];
  for(const name of names){
    const isAe=/^ae\d/.test(name), isIrb=name==='irb', isLo=name==='lo0';
    const link = isAe?'down':'up';
    rows.push({n:name,a:'up',l:link,p:'',loc:'',rem:''});
    const units=getNode(cfgIf,[name,'unit'])||{};
    const ukeys=Object.keys(units).sort((x,y)=>(+x)-(+y));
    for(const u of ukeys){
      const fam=getNode(units,[u,'family'])||{};
      const v4=Object.keys(getNode(fam,['inet','address'])||{});
      const v6=Object.keys(getNode(fam,['inet6','address'])||{});
      const sw=has(fam,'ethernet-switching');
      const ul = isIrb?'down':(isAe?'down':'up');
      if(!v4.length && !v6.length){
        rows.push({n:name+'.'+u,a:'up',l:ul,p:sw?'eth-switch':'',loc:'',rem:''});
      }
      if(v4.length){
        const f=a4=>{
          const p=a4.split('/');
          return (p[1]===undefined||p[1]==='32')?{loc:p[0],rem:'--> 0/0'}:{loc:a4,rem:''};
        };
        const first=f(v4[0]);
        rows.push({n:name+'.'+u,a:'up',l:ul,p:'inet',loc:first.loc,rem:first.rem});
        v4.slice(1).forEach(x=>{ const q=f(x); rows.push({n:'',a:'',l:'',p:'',loc:q.loc,rem:q.rem}); });
      }
      if(v6.length){
        const first = v4.length?{n:'',a:'',l:'',p:'inet6',loc:v6[0],rem:''}:{n:name+'.'+u,a:'up',l:ul,p:'inet6',loc:v6[0],rem:''};
        rows.push(first);
        v6.slice(1).forEach(x=>rows.push({n:'',a:'',l:'',p:'',loc:x,rem:''}));
        if(!isLo) rows.push({n:'',a:'',l:'',p:'',loc:llaFor(name)+'/64',rem:''});
      }
    }
    if(isLo){
      rows.push({n:'lo0.16384',a:'up',l:'up',p:'inet',loc:'127.0.0.1',rem:'--> 0/0'});
      rows.push({n:'lo0.16385',a:'up',l:'up',p:'inet',loc:'10.0.0.1',rem:'--> 0/0'});
      ['10.0.0.16','128.0.0.1','128.0.0.4','128.0.1.16'].forEach(x=>
        rows.push({n:'',a:'',l:'',p:'',loc:x,rem:'--> 0/0'}));
      rows.push({n:'lo0.32768',a:'up',l:'up',p:'',loc:'',rem:''});
    }
  }
  return rows;
}
function renderTerse(rows){
  const L=[pad('Interface',24)+pad('Admin',6)+pad('Link',5)+pad('Proto',9)+pad('Local',22)+'Remote'];
  for(const r of rows) L.push((pad(r.n,24)+pad(r.a,6)+pad(r.l,5)+pad(r.p,9)+pad(r.loc,22)+r.rem).replace(/\s+$/,''));
  return L.join('\n');
}
function since(t){
  const ms=Date.now()-(t||boot.getTime());
  const s=Math.max(0,Math.floor(ms/1000));
  const h=String(Math.floor(s/3600)).padStart(2,'0');
  const m=String(Math.floor(s%3600/60)).padStart(2,'0');
  const ss=String(s%60).padStart(2,'0');
  return h+':'+m+':'+ss;
}
function routes4(tree){
  const r=[]; const age=since(D.commitTime);
  for(const u of ifUnits(tree)){
    for(const a of u.v4){
      const ip=a.split('/')[0], len=+(a.split('/')[1]||32);
      if(len===32){ r.push({d:ip+'/32',p:'Direct',age:age,via:'> via '+u.ifl}); }
      else{
        r.push({d:netOf(ip,len)+'/'+len,p:'Direct',age:age,via:'> via '+u.ifl});
        r.push({d:ip+'/32',p:'Local',age:age,via:'  Local via '+u.ifl});
      }
    }
  }
  const st=getNode(tree,['routing-options','static','route'])||{};
  const la=localAddrs(tree).filter(x=>!x.v6);
  for(const dst of Object.keys(st)){
    const nh=Object.keys(getNode(st,[dst,'next-hop'])||{})[0];
    if(has(st[dst],'discard')){ r.push({d:dst,p:'Static',pref:5,age:age,via:'  Discard'}); continue; }
    if(!nh) continue;
    const via=la.find(x=>sameNet(x.addr,nh,x.len));
    if(via) r.push({d:dst,p:'Static',pref:5,age:age,via:'> to '+nh+' via '+via.ifl});
    else r.push({d:dst,p:'Static',pref:5,age:age,via:'> to '+nh,hidden:true});
  }
  if(getNode(tree,['protocols','ospf'])) r.push({d:'224.0.0.5/32',p:'OSPF',pref:10,age:age,metric:1,via:'  MultiRecv'});
  r.sort((a,b)=>{
    const [ai,al]=a.d.split('/'), [bi,bl]=b.d.split('/');
    return (ip2n(ai)-ip2n(bi)) || ((+al)-(+bl));
  });
  return r;
}
function routes6(tree){
  const r=[]; const age=since(D.commitTime);
  for(const u of ifUnits(tree)){
    for(const a of u.v6){
      const ip=v6Norm(a.split('/')[0]), len=+(a.split('/')[1]||128);
      if(len===128 || ip.indexOf('fe80')===0) r.push({d:ip+'/128',p:'Local',age:age,via:'  Local via '+u.ifl});
      else{
        r.push({d:v6Prefix(ip,len)+'/'+len,p:'Direct',age:age,via:'> via '+u.ifl});
        r.push({d:ip+'/128',p:'Local',age:age,via:'  Local via '+u.ifl});
      }
    }
    if(u.v6.length && u.name!=='lo0') r.push({d:llaFor(u.name)+'/128',p:'Local',age:age,via:'  Local via '+u.ifl});
  }
  r.push({d:'ff02::2/128',p:'INET6',age:since(boot.getTime()),via:'  MultiRecv'});
  return r;
}
function renderTable(name,rs){
  const vis=rs.filter(x=>!x.hidden), hid=rs.length-vis.length;
  const L=[name+': '+vis.length+' destinations, '+vis.length+' routes ('+vis.length+' active, 0 holddown, '+hid+' hidden)',
           '+ = Active Route, - = Last Active, * = Both',''];
  for(const r of vis){
    const pref = r.pref!==undefined?r.pref:0;
    let head='*['+r.p+'/'+pref+'] '+r.age;
    if(r.metric) head+=', metric '+r.metric;
    if(r.d.length>18){ L.push(r.d); L.push(' '.repeat(19)+head); }
    else L.push(pad(r.d,19)+head);
    L.push(' '.repeat(19)+' '+r.via);
  }
  return L.join('\n');
}

/* ---------- command output helpers -------------------------------- */
function zoneOf(tree,ifl){
  const z=getNode(tree,['security','zones','security-zone'])||{};
  for(const n of Object.keys(z)) if(getNode(z,[n,'interfaces',ifl])) return n;
  return null;
}
function securityConfigured(tree){ return !!getNode(tree,['security','zones','security-zone']); }
function hostInboundOk(tree,ifl){
  if(!securityConfigured(tree)) return true;
  const zn=zoneOf(tree,ifl); if(!zn) return false;
  const z=getNode(tree,['security','zones','security-zone',zn]);
  const svcZ=Object.keys(getNode(z,['host-inbound-traffic','system-services'])||{});
  const svcI=Object.keys(getNode(z,['interfaces',ifl,'host-inbound-traffic','system-services'])||{});
  const all=svcZ.concat(svcI);
  return all.indexOf('all')>=0 || all.indexOf('ping')>=0 || all.indexOf('any-service')>=0 || all.length>0;
}

/* ---------- labs -------------------------------------------------- */
const LABS=[
 {n:1,t:'The Junos Basic Configuration',o:'Bring up a core switch: hostname, root password, remote access, loopback ID and a named admin user.',
  c:['configure','set system host-name CORE-SW-01','set system root-authentication plain-text-password',
     'set system services ssh protocol-version v2','set system services telnet',
     'set interfaces lo0 unit 0 family inet address 1.1.1.1/32',
     'set system login user net-admin class super-user authentication plain-text-password',
     'commit check','commit comment "Initial System Hardening"','exit','show interfaces terse']},
 {n:2,t:'Control Plane Policing (CoPP)',o:'Rate-limit ICMP to the routing engine with a policer applied to a loopback filter.',
  c:['configure','set system root-authentication plain-text-password Student123',
     'set firewall policer LIMIT-ICMP if-exceeding bandwidth-limit 1m burst-size-limit 64k',
     'set firewall policer LIMIT-ICMP then discard',
     'set firewall filter PROTECT-LOOPBACK term 1 from protocol icmp',
     'set firewall filter PROTECT-LOOPBACK term 1 then policer LIMIT-ICMP',
     'set firewall filter PROTECT-LOOPBACK term 1 then accept',
     'set firewall filter PROTECT-LOOPBACK term 2 then accept',
     'set interfaces lo0 unit 0 family inet filter input PROTECT-LOOPBACK',
     'set interfaces lo0 unit 0 family inet address 1.1.1.1/32',
     'commit check','commit','exit','show firewall filter PROTECT-LOOPBACK']},
 {n:3,t:'Multi-departmental IPv4 & router ID',o:'Carve 10.50.0.0/24 into departmental subnets on one logical unit, set the router ID, add a secondary range.',
  c:['configure','set system host-name ISE-CORE-RTR','set system root-authentication plain-text-password Student123',
     'set routing-options router-id 10.50.0.1',
     'set interfaces lo0 unit 0 description "MGMT_AND_SALES_GATEWAY"',
     'set interfaces lo0 unit 0 family inet address 10.50.0.1/32 primary',
     'set interfaces lo0 unit 0 family inet address 10.50.0.65/26',
     'set interfaces lo0 unit 0 family inet address 10.50.0.129/26',
     'set interfaces lo0 unit 0 family inet address 10.50.0.193/26',
     'set interfaces lo0 unit 0 family inet address 172.16.100.1/24',
     'commit check','commit','exit','show interfaces lo0 terse','show route protocol direct']},
 {n:4,t:'Dual-stack IPv6 GUA & link-local',o:'Add a global unicast address and a fixed link-local address alongside IPv4 on the core interface.',
  c:['configure','set system host-name ISE-CORE-RTR','set system root-authentication plain-text-password Student123',
     'set routing-options router-id 10.50.0.1',
     'set interfaces lo0 unit 0 description "CORE_DUAL_STACK_INTERFACE"',
     'set interfaces lo0 unit 0 family inet address 10.50.0.1/32 primary',
     'set interfaces lo0 unit 0 family inet6 address 2001:db8:acad:1::1/64',
     'set interfaces lo0 unit 0 family inet6 address fe80::1/64',
     'commit check','commit','exit','show interfaces lo0 terse','show route table inet6.0','ping inet6 2001:db8:acad:1::1 count 5']},
 {n:5,t:'SSH and Telnet configuration',o:'Harden remote access: SSHv2 only, port, connection and rate limits, key-based admin user, limited telnet.',
  c:['configure','set system host-name junos','set system root-authentication plain-text-password',
     'set system services ssh','set system services ssh protocol-version v2','set system services ssh port 22',
     'set system services ssh connection-limit 10','set system services ssh rate-limit 10',
     'set system login user admin class super-user',
     'set system login user admin authentication plain-text-password',
     'set system services telnet','set system services telnet connection-limit 5',
     'set system services telnet rate-limit 5','commit','exit',
     'show configuration system services ssh','show configuration system login','show system users']},
 {n:6,t:'Multi-VLAN segmentation & virtual management',o:'Isolate departments into VLANs, assign access ports, and add an IRB gateway plus a loopback management anchor.',
  c:['configure','set system host-name JUNOS-VLAN-MASTER','set system root-authentication plain-text-password Student123',
     'set vlans SALES-VLAN vlan-id 10','set vlans HR-VLAN vlan-id 20','set vlans ENGINEERING-VLAN vlan-id 30',
     'set vlans GUEST-VLAN vlan-id 40','set vlans NATIVE-MGMT vlan-id 99',
     'set interfaces lo0 unit 0 family inet address 192.168.100.1/32',
     'set interfaces ge-0/0/1 unit 0 family ethernet-switching interface-mode access',
     'set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members SALES-VLAN',
     'set interfaces ge-0/0/2 unit 0 family ethernet-switching interface-mode access',
     'set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members HR-VLAN',
     'set interfaces irb unit 99 family inet address 10.99.99.1/24',
     'set vlans NATIVE-MGMT l3-interface irb.99',
     'set protocols rstp interface all','set protocols igmp-snooping vlan all',
     'commit check','commit and-quit','show interfaces irb terse','show vlans']},
 {n:7,t:'Router configuration',o:'Basic router build: interface addressing, a default static route and OSPF on the link.',
  c:['configure','set system host-name Router1','set system root-authentication plain-text-password',
     'set interfaces ge-0/0/0 unit 0 family inet address 192.168.1.1/24',
     'set routing-options static route 0.0.0.0/0 next-hop 192.168.1.254',
     'set protocols ospf area 0.0.0.0 interface ge-0/0/0',
     'commit and-quit','show configuration','show interfaces terse','show route']},
 {n:8,t:'Inter-VLAN routing (logical router-on-a-stick)',o:'Host three subnet gateways on one loopback unit and open the TRUST zone so the router answers.',
  c:['configure','set system host-name LAB-GATEWAY','set system root-authentication plain-text-password Student123',
     'set interfaces lo0 unit 0 family inet address 10.0.10.1/24',
     'set interfaces lo0 unit 0 family inet address 10.0.20.1/24',
     'set interfaces lo0 unit 0 family inet address 10.0.99.1/24',
     'set interfaces lo0 unit 0 family inet address 192.168.100.1/32',
     'set security zones security-zone TRUST host-inbound-traffic system-services all',
     'set security zones security-zone TRUST interfaces lo0.0',
     'commit check','commit and-quit','show interfaces lo0 terse','show route','ping 10.0.10.1 source 10.0.20.1 count 5']},
 {n:9,t:'Rapid STP with edge protection',o:'Force the root bridge, mark the access port as an edge port and block it from becoming a root port.',
  c:['configure','set system host-name EDGE-PROTECT-ROUTER','set system root-authentication plain-text-password Student123',
     'set interfaces lo0 unit 0 family inet address 192.168.100.1/32',
     'set interfaces lo0 unit 0 family inet address 10.0.10.1/24',
     'set interfaces lo0 unit 0 family inet address 10.0.20.1/24',
     'set protocols rstp bridge-priority 4k','set protocols rstp interface ge-0/0/0 edge',
     'set protocols rstp interface ge-0/0/0 no-root-port',
     'set security zones security-zone TRUST host-inbound-traffic system-services all',
     'set security zones security-zone TRUST interfaces lo0.0',
     'commit and-quit','show interfaces ge-0/0/0 terse','ping 10.0.20.1 source 10.0.10.1 count 5']},
 {n:10,t:'LACP aggregate Ethernet',o:'Reserve an ae device, bundle two members, run LACP active and address the bundle.',
  c:['configure','set system host-name LACP','set system root-authentication plain-text-password Student123',
     'set chassis aggregated-devices ethernet device-count 1',
     'delete interfaces ge-0/0/0','delete interfaces ge-0/0/1',
     'set interfaces ge-0/0/0 ether-options 802.3ad ae0','set interfaces ge-0/0/1 ether-options 802.3ad ae0',
     'set interfaces ae0 aggregated-ether-options lacp active',
     'set interfaces ae0 unit 0 family inet address 10.0.50.1/24',
     'set interfaces lo0 unit 0 family inet address 10.0.10.1/24',
     'set security zones security-zone TRUST host-inbound-traffic system-services all',
     'set security zones security-zone TRUST interfaces ae0.0',
     'set security zones security-zone TRUST interfaces lo0.0',
     'commit and-quit','show lacp statistics interfaces ae0','show interfaces ae0 terse']},
 {n:11,t:'IPv6 SLAAC & address verification',o:'Advertise a /64 so hosts build their own addresses; disable the managed and other-config bits.',
  c:['configure','set system host-name SLAAC','set system root-authentication plain-text-password Student123',
     'set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:beef:a::1/64',
     'set protocols router-advertisement interface ge-0/0/0.0 prefix 2001:db8:beef:a::/64',
     'set interfaces lo0 unit 0 family inet6 address 2001:db8:beef:ff::1/128',
     'set security zones security-zone TRUST interfaces ge-0/0/0.0 host-inbound-traffic system-services all',
     'set security zones security-zone TRUST interfaces lo0.0 host-inbound-traffic system-services all',
     'commit and-quit','show interfaces ge-0/0/0.0 terse','ping 2001:db8:beef:a::1 count 5','show route table inet6.0']},
 {n:12,t:'DHCPv4 server & exclusions',o:'Define an address pool with a range and attributes, bind it to an interface group, open the zone for DHCP.',
  c:['configure','set system host-name DHCPv4','set system root-authentication plain-text-password Student123',
     'set interfaces lo0 unit 0 family inet address 10.0.10.1/24',
     'set interfaces ge-0/0/0 unit 0 family inet address 192.168.1.1/24',
     'edit access address-assignment pool OFFICE_LAN family inet',
     'set network 192.168.1.0/24','set range OFFICE_RANGE low 192.168.1.51',
     'set range OFFICE_RANGE high 192.168.1.254','set dhcp-attributes router 192.168.1.1',
     'set dhcp-attributes name-server 8.8.8.8','set dhcp-attributes maximum-lease-time 43200','top',
     'set system services dhcp-local-server group OFFICE_GROUP interface ge-0/0/0.0',
     'set security zones security-zone TRUST interfaces ge-0/0/0.0 host-inbound-traffic system-services dhcp',
     'set security zones security-zone TRUST interfaces lo0.0 host-inbound-traffic system-services dhcp',
     'commit check','commit and-quit','show configuration system services dhcp-local-server',
     'show interfaces terse ge-0/0/0.0','show security zones TRUST']}
];

/* ---------- commit ------------------------------------------------ */
let commitLog=[];
function commitCheck(){
  const e=[];
  const c=D.cand;
  if(!getNode(c,['system','root-authentication']))
    e.push(['[edit system]',"  'root-authentication'",'    Missing mandatory statement: '+"'root-authentication'"]);
  // security zone interfaces must exist
  const zones=getNode(c,['security','zones','security-zone'])||{};
  for(const z of Object.keys(zones)){
    for(const ifl of Object.keys(getNode(zones,[z,'interfaces'])||{})){
      const p=ifl.split('.');
      const unit=p[1]!==undefined?p[1]:'0';
      if(!getNode(c,['interfaces',p[0],'unit',unit]))
        e.push(['[edit security zones security-zone '+z+']',"  'interfaces "+ifl+"'",'    Interface '+ifl+' not found']);
    }
  }
  // ae interfaces need a device count
  const aes=Object.keys(getNode(c,['interfaces'])||{}).filter(n=>/^ae\d+$/.test(n));
  if(aes.length){
    const dc=Object.keys(getNode(c,['chassis','aggregated-devices','ethernet','device-count'])||{})[0];
    if(!dc) e.push(['[edit interfaces '+aes[0]+']','  '+"'"+aes[0]+"'",'    Interface device count not configured under chassis aggregated-devices']);
    else if(aes.some(n=>+n.replace('ae','')>=+dc))
      e.push(['[edit interfaces]','  '+"'"+aes[0]+"'",'    Interface index exceeds aggregated-devices ethernet device-count '+dc]);
  }
  // l3-interface must exist
  const vl=getNode(c,['vlans'])||{};
  for(const v of Object.keys(vl)){
    const l3=Object.keys(getNode(vl,[v,'l3-interface'])||{})[0];
    if(l3){
      const p=l3.split('.');
      if(!getNode(c,['interfaces',p[0],'unit',p[1]!==undefined?p[1]:'0']))
        e.push(['[edit vlans '+v+']',"  'l3-interface "+l3+"'",'    Interface '+l3+' not found']);
    }
  }
  // family inet and ethernet-switching on the same unit
  for(const u of ifUnits(c)) if(u.sw && u.v4.length)
    e.push(['[edit interfaces '+u.name+' unit '+u.unit+']','  '+"'family'",
            '    Interface unit cannot have both family inet and family ethernet-switching']);
  return e;
}
function doCommit(comment,quit){
  const errs=commitCheck();
  if(errs.length){
    errs.forEach(g=>{ g.forEach(l=>out(l,'red')); });
    out('error: configuration check-out failed','red');
    return false;
  }
  D.comm=clone(D.cand);
  D.commitTime=Date.now();
  const hn=Object.keys(getNode(D.comm,['system','host-name'])||{})[0];
  if(hn) D.host=hn;
  commitLog.unshift({t:new Date(),u:D.user,c:comment||''});
  out('commit complete');
  if(quit){ D.mode='op'; D.edit=[]; out('Exiting configuration mode'); }
  return true;
}

/* ---------- pipes -------------------------------------------------- */
function applyPipe(text,pipes){
  let t=text;
  for(const p of pipes){
    const w=p.trim().split(/\s+/);
    const op=w[0], arg=w.slice(1).join(' ');
    if(op==='match'||op==='grep'){
      let re; try{ re=new RegExp(arg,'i'); }catch(e){ return 'error: invalid regular expression'; }
      t=t.split('\n').filter(l=>re.test(l)).join('\n');
    } else if(op==='except'){
      let re; try{ re=new RegExp(arg,'i'); }catch(e){ return 'error: invalid regular expression'; }
      t=t.split('\n').filter(l=>!re.test(l)).join('\n');
    } else if(op==='count'){
      t='Count: '+t.split('\n').filter(l=>l.length).length+' lines';
    } else if(op==='find'){
      const lines=t.split('\n'); const i=lines.findIndex(l=>l.toLowerCase().indexOf(arg.toLowerCase())>=0);
      t=i<0?'':lines.slice(i).join('\n');
    } else if(op==='last'){
      const lines=t.split('\n'); t=lines.slice(-(parseInt(arg,10)||10)).join('\n');
    } else if(op==='no-more'||op==='trim'){ /* no-op */ }
    else if(op==='display'){ /* handled by caller */ }
    else return 'error: unsupported pipe command: '+op;
  }
  return t;
}

/* ---------- operational commands ---------------------------------- */
function opCommand(argv,line){
  const c=argv[0];
  if(c==='configure'||c==='edit'||c==='config'){
    D.mode='cfg'; D.edit=[]; D.cand=clone(D.comm);
    out('Entering configuration mode');
    if(argv[1]==='private') out('warning: uncommitted changes will be discarded on exit');
    return;
  }
  if(c==='cli'){ return; }
  if(c==='exit'||c==='quit'||c==='logout'){
    out(''); out('FreeBSD/amd64 ('+D.host+') (ttyu0)'); out(''); out('login: ',''); return;
  }
  if(c==='clear'&&argv.length===1){ screenEl.innerHTML=''; return; }
  if(c==='ping') return doPing(argv.slice(1));
  if(c==='traceroute') return doTrace(argv.slice(1));
  if(c==='request'){
    if(argv[1]==='system'&&argv[2]==='zeroize'){ zeroize(); return; }
    if(argv[1]==='system'&&argv[2]==='reboot'){ out('Reboot the system ? [yes,no] (no) yes'); out(''); out('Shutdown NOW!'); return; }
    out('error: unsupported request command','red'); return;
  }
  if(c==='show') return showCommand(argv.slice(1),line);
  if(c==='help'||c==='?'){ printHelp(); return; }
  if(c==='lab') return labCommand(argv.slice(1));
  if(c==='monitor'){ out('error: unsupported in simulator','red'); return; }
  unknown(argv,0);
}
function showCommand(a,line){
  const j=a.join(' ');
  const tree=D.mode==='cfg'?D.comm:D.comm;
  if(a[0]==='version'||j===''){
    if(a[0]!=='version'){ unknown(['show'],0); return; }
    out('Hostname: '+D.host);
    out('Model: '+D.model);
    out('Junos: '+D.ver);
    out('JUNOS OS Kernel 64-bit  [20211203.6c2f68f_builder_stable_11]');
    out('JUNOS OS runtime [20211203.6c2f68f_builder_stable_11]');
    out('JUNOS Routing Software Suite ['+D.ver+']');
    return;
  }
  if(a[0]==='interfaces'){
    const rest=a.slice(1).filter(x=>x!=='terse');
    let rows=terseRows(tree);
    if(rest.length){
      const f=rest[0], keep=[];
      let on=false;
      for(const r of rows){
        if(r.n) on = (r.n===f || r.n.indexOf(f+'.')===0);
        if(on) keep.push(r);
      }
      if(!keep.length){ out('error: device '+f+' not found','red'); return; }
      rows=keep;
    }
    outRaw(renderTerse(rows));
    return;
  }
  if(a[0]==='route'){
    const sub=a.slice(1);
    if(sub[0]==='table'){
      const t=(sub[1]||'').replace(/\.0$/,'');
      if(t==='inet6') { outRaw(renderTable('inet6.0',routes6(tree))); return; }
      if(t==='inet'||t===''){ outRaw(renderTable('inet.0',routes4(tree))); return; }
      out('error: unknown routing table: '+sub[1],'red'); return;
    }
    if(sub[0]==='protocol'){
      const p=(sub[1]||'').toLowerCase();
      const f4=routes4(tree).filter(r=>r.p.toLowerCase()===p||(p==='direct'&&r.p==='Direct'));
      outRaw(renderTable('inet.0',f4)); out('');
      outRaw(renderTable('inet6.0',routes6(tree).filter(r=>r.p.toLowerCase()===p)));
      return;
    }
    outRaw(renderTable('inet.0',routes4(tree))); out('');
    outRaw(renderTable('inet6.0',routes6(tree)));
    return;
  }
  if(a[0]==='configuration'){
    const path=a.slice(1);
    const txt=showConfig(D.comm,path);
    if(txt===null){ out('error: statement not found: '+path.join(' '),'red'); return; }
    outRaw(txt===''?'':txt);
    return;
  }
  if(a[0]==='system'&&a[1]==='users'){
    const now=new Date();
    const up=Math.max(1,Math.round((Date.now()-boot.getTime())/60000));
    out(clock(now)+'  up '+up+' min'+(up===1?'':'s')+', 1 user, load averages: 0.21, 0.18, 0.12');
    out(pad('USER',9)+pad('TTY',9)+pad('FROM',19)+pad('LOGIN@',8)+pad('IDLE',5)+'WHAT');
    out(pad(D.user,9)+pad('v0',9)+pad('-',19)+pad(clock(boot),8)+pad(up,5)+'cli');
    return;
  }
  if(a[0]==='system'&&a[1]==='uptime'){
    out('Current time: '+stamp(new Date()));
    out('System booted: '+stamp(boot)+' ('+since(boot.getTime())+' ago)');
    out('Last configured: '+(D.commitTime?stamp(new Date(D.commitTime))+' by '+D.user:'never'));
    return;
  }
  if(a[0]==='system'&&a[1]==='commit'){
    if(!commitLog.length){ out('No commits'); return; }
    commitLog.forEach((e,i)=>out(pad(i,4)+stamp(e.t)+' by '+e.u+' via cli'+(e.c?'\n    '+e.c:'')));
    return;
  }
  if(a[0]==='firewall'){
    const name=a[1]==='filter'?a[2]:null;
    const filters=getNode(tree,['firewall','filter'])||{};
    const names=name?[name]:Object.keys(filters);
    if(!names.length||!filters[names[0]]){ out('error: filter not found','red'); return; }
    for(const f of names){
      out('Filter: '+f);
      const pols=new Set(), cnts=new Set();
      const terms=getNode(filters,[f,'term'])||{};
      for(const t of Object.keys(terms)){
        Object.keys(getNode(terms,[t,'then','policer'])||{}).forEach(p=>pols.add(p));
        Object.keys(getNode(terms,[t,'then','count'])||{}).forEach(p=>cnts.add(p));
      }
      if(cnts.size){ out('Counters:'); out(pad('Name',48)+pad('Bytes',18)+'Packets');
        cnts.forEach(p=>out(pad(p,48)+pad('0',18)+'0')); }
      if(pols.size){ out('Policers:'); out(pad('Name',48)+pad('Bytes',18)+'Packets');
        pols.forEach(p=>out(pad(p+'-1',48)+pad('0',18)+'0')); }
    }
    return;
  }
  if(a[0]==='lacp'){
    const ae=a[a.length-1];
    const members=Object.keys(getNode(tree,['interfaces'])||{}).filter(n=>
      Object.keys(getNode(tree,['interfaces',n,'ether-options','802.3ad'])||{}).indexOf(ae)>=0 ||
      Object.keys(getNode(tree,['interfaces',n,'gigether-options','802.3ad'])||{}).indexOf(ae)>=0);
    if(!getNode(tree,['interfaces',ae])){ out('error: interface '+ae+' not found','red'); return; }
    out('Aggregated interface: '+ae);
    if(a[1]==='statistics'){
      out('    LACP Statistics:       LACP Rx     LACP Tx   Unknown Rx   Illegal Rx');
      const base=3+Math.floor((Date.now()-(D.commitTime||boot.getTime()))/1000);
      const rp=(v,n)=>String(v).padStart(n);
      members.forEach((m,i)=>out(pad('      '+m,23)+rp(base+i,10)+rp(base+1-i,12)+rp(0,13)+rp(0,13)));
      if(!members.length) out('      (no member links configured)');
    } else {
      out('    Aggregated interface: '+ae);
      out('    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity');
      const act=getNode(tree,['interfaces',ae,'aggregated-ether-options','lacp','active'])?'Active':'Passive';
      members.forEach(m=>out(pad('      '+m,24)+pad('Actor',7)+'  No   Yes    No   No   No   Yes     Fast    '+act));
    }
    return;
  }
  if(a[0]==='security'&&a[1]==='zones'){
    const zones=getNode(tree,['security','zones','security-zone'])||{};
    const names=a[2]?[a[2]]:Object.keys(zones);
    if(!names.length){ out('error: security zones not configured','red'); return; }
    for(const z of names){
      if(!zones[z]){ out('error: zone '+z+' not found','red'); continue; }
      const ifs=Object.keys(getNode(zones,[z,'interfaces'])||{});
      out('');
      out('Security zone: '+z);
      out('  Send reset for non-SYN session TCP packets: Off');
      out('  Policy configurable: Yes');
      out('  Interfaces bound: '+ifs.length);
      out('  Interfaces:');
      ifs.forEach(i=>out('    '+i));
      out('  Advanced-connection-tracking timeout: 1800');
    }
    return;
  }
  if(a[0]==='vlans'){
    const vl=getNode(tree,['vlans'])||{};
    if(!Object.keys(vl).length){ out('error: no VLANs configured','red'); return; }
    out(pad('Routing instance',20)+pad('VLAN name',20)+pad('Tag',7)+'Interfaces');
    const units=ifUnits(tree);
    for(const v of Object.keys(vl)){
      const tag=Object.keys(getNode(vl,[v,'vlan-id'])||{})[0]||'NA';
      const mem=units.filter(u=>u.vlans.indexOf(v)>=0).map(u=>u.ifl+'*');
      out((pad('default-switch',20)+pad(v,20)+pad(tag,7)+(mem[0]||'')).replace(/\s+$/,''));
      mem.slice(1).forEach(m=>out(' '.repeat(47)+m));
    }
    return;
  }
  if(a[0]==='ethernet-switching'&&a[1]==='table'){
    out('MAC flags (S - static MAC, D - dynamic MAC, L - locally learned)');
    out('');
    out(pad('Vlan name',20)+pad('MAC address',20)+pad('Flags',8)+'Interface');
    out('(no entries learned)');
    return;
  }
  if(a[0]==='dhcp'&&(a[1]==='server')){
    if(!getNode(tree,['system','services','dhcp-local-server'])){ out('error: DHCP local server not configured','red'); return; }
    out(pad('IP address',18)+pad('Session Id',12)+pad('Hardware address',20)+pad('Expires',10)+'State');
    out('(no active bindings in simulation)');
    return;
  }
  if(a[0]==='chassis'){
    out('Hardware inventory:');
    out(pad('Item',14)+pad('Version',10)+pad('Part number',14)+pad('Serial number',16)+'Description');
    out(pad('Chassis',14)+pad('',10)+pad('',14)+pad('SIM0001',16)+'VSRX');
    out(pad('Routing Engine',14)+pad('',10)+pad('',14)+pad('',16)+'VSRX-1');
    return;
  }
  if(a[0]==='arp'){ out('MAC Address       Address         Name                      Interface    Flags');
                    out('Total entries: 0'); return; }
  if(a[0]==='spanning-tree'||a[0]==='protocols'){
    const r=getNode(tree,['protocols','rstp']);
    if(!r){ out('error: RSTP not configured','red'); return; }
    const prio=Object.keys(getNode(r,['bridge-priority'])||{})[0]||'32k';
    out('STP bridge parameters');
    out('Routing instance name          : GLOBAL');
    out('Enabled protocol               : RSTP');
    out('  Root ID                      : '+prio+'.08:00:27:11:22:33');
    out('  Hello time                   : 2 seconds');
    out('  Maximum age                  : 20 seconds');
    out('  Forward delay                : 15 seconds');
    out('  Local bridge ID              : '+prio+'.08:00:27:11:22:33');
    Object.keys(getNode(r,['interface'])||{}).forEach(i=>
      out('  Interface '+pad(i,22)+' state FORWARDING'+(getNode(r,['interface',i,'edge'])?'  (edge)':'')));
    return;
  }
  unknown(['show'].concat(a),1);
}
function clock(d){
  let h=d.getHours(), ap=h>=12?'PM':'AM'; h=h%12||12;
  return String(h).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+ap;
}
function stamp(d){
  const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return M[d.getMonth()]+' '+String(d.getDate()).padStart(2,'0')+' '+
    String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+
    String(d.getSeconds()).padStart(2,'0');
}

/* ---------- ping / traceroute ------------------------------------- */
function doPing(a){
  let v6=false, count=0, src=null, dst=null;
  for(let i=0;i<a.length;i++){
    const t=a[i];
    if(t==='inet6'){ v6=true; continue; }
    if(t==='inet'){ continue; }
    if(t==='count'){ count=parseInt(a[++i],10)||0; continue; }
    if(t==='source'){ src=a[++i]; continue; }
    if(t==='rapid'||t==='do-not-fragment'){ continue; }
    if(t==='size'||t==='interval'||t==='ttl'){ i++; continue; }
    if(!dst) dst=t;
  }
  if(!dst){ out('error: destination address required','red'); return; }
  if(isV6(dst)) v6=true;
  const locals=localAddrs(D.comm).filter(x=>!!x.v6===v6);
  if(src){
    const ok=locals.some(x=>x.addr===(v6?v6Norm(src):src));
    if(!ok){ out("ping: bind: Can't assign requested address",'red'); return; }
  }
  const target=v6?v6Norm(dst):dst;
  const hit=locals.find(x=>x.addr===target);
  let reachable=!!hit, noRoute=false;
  if(!reachable){
    if(v6){
      noRoute=!locals.some(x=>target.split(':').slice(0,4).join(':')===x.addr.split(':').slice(0,4).join(':'));
    } else {
      const onLink=locals.some(x=>x.len<32 && sameNet(x.addr,target,x.len));
      const def=!!getNode(D.comm,['routing-options','static','route','0.0.0.0/0']);
      noRoute=!onLink && !def;
    }
  }
  if(reachable && !hostInboundOk(D.comm,hit.ifl)){
    // zone exists but this interface is not permitted to answer
    reachable=false; noRoute=true;
  }
  const size=v6?'PING6(56=40+8+8 bytes) ':'PING ';
  if(v6) out(size+(src?v6Norm(src):(locals[0]?locals[0].addr:'::'))+' --> '+target);
  else out('PING '+target+' ('+target+'): 56 data bytes');
  let seq=0, rx=0; const times=[];
  const max = count||50;
  D.ping={dst:target,v6:v6,tx:0,rx:0,times:times,timer:null};
  const tick=()=>{
    if(!D.ping) return;
    if(noRoute){ out('ping: sendto: No route to host','red'); }
    else if(reachable){
      const t=(0.02+Math.random()*0.12+(seq===0?0.25:0));
      times.push(t); rx++;
      if(v6) out('16 bytes from '+target+', icmp_seq='+seq+' hlim=64 time='+t.toFixed(3)+' ms');
      else out('64 bytes from '+target+': icmp_seq='+seq+' ttl=64 time='+t.toFixed(3)+' ms');
    }
    seq++; D.ping.tx=seq; D.ping.rx=rx;
    if(seq>=max){ stopPing(true); return; }
    D.ping.timer=setTimeout(tick,noRoute?260:200);
  };
  D.ping.timer=setTimeout(tick,120);
  setInputEnabled(false);
}
function stopPing(auto){
  if(!D.ping) return;
  const p=D.ping; clearTimeout(p.timer); D.ping=null;
  if(!auto) out('^C');
  out('');
  out('--- '+p.dst+' ping'+(p.v6?'6':'')+' statistics ---');
  const loss=p.tx?Math.round((p.tx-p.rx)/p.tx*100):100;
  out(p.tx+' packets transmitted, '+p.rx+' packets received, '+loss+'% packet loss');
  if(p.rx){
    const t=p.times, mn=Math.min.apply(null,t), mx=Math.max.apply(null,t);
    const avg=t.reduce((a,b)=>a+b,0)/t.length;
    const sd=Math.sqrt(t.reduce((a,b)=>a+(b-avg)*(b-avg),0)/t.length);
    out('round-trip min/avg/max/stddev = '+mn.toFixed(3)+'/'+avg.toFixed(3)+'/'+mx.toFixed(3)+'/'+sd.toFixed(3)+' ms');
  }
  setInputEnabled(true);
}
function doTrace(a){
  const dst=a.find(t=>t.indexOf('.')>0||t.indexOf(':')>0);
  if(!dst){ out('error: destination address required','red'); return; }
  const locals=localAddrs(D.comm);
  out('traceroute to '+dst+' ('+dst+'), 30 hops max, 40 byte packets');
  if(locals.some(x=>x.addr===dst)){ out(' 1  '+dst+' ('+dst+')  0.081 ms  0.052 ms  0.049 ms'); }
  else { out(' 1  * * *'); out(' 2  * * *'); out(' 3  * * *'); }
}

/* ---------- configuration mode commands --------------------------- */
function cfgCommand(argv,line){
  const c=argv[0];
  if(c==='set'||c==='delete'||c==='deactivate'||c==='activate') return setDelete(c,argv.slice(1));
  if(c==='edit'){
    const t=argv.slice(1);
    if(!t.length){ out('syntax error.','red'); return; }
    const w=walk(t,D.edit);
    if(!w.ok){ syntaxErr(line,argv,1+w.idx); return; }
    mkNode(D.cand,D.edit.concat(t));
    D.edit=D.edit.concat(t);
    return;
  }
  if(c==='top'){
    D.edit=[];
    if(argv.length>1) return cfgCommand(argv.slice(1),argv.slice(1).join(' '));
    return;
  }
  if(c==='up'){
    const n=parseInt(argv[1],10)||1;
    D.edit=D.edit.slice(0,Math.max(0,D.edit.length-n));
    return;
  }
  if(c==='exit'||c==='quit'){
    if(argv[1]==='configuration-mode'||argv[1]==='config-mode'){ return leaveConfig(); }
    if(D.edit.length){ D.edit=[]; return; }
    return leaveConfig();
  }
  if(c==='commit'){
    const sub=argv[1];
    if(sub==='check'){
      const e=commitCheck();
      if(e.length){ e.forEach(g=>g.forEach(l=>out(l,'red'))); out('error: configuration check-out failed','red'); }
      else out('configuration check succeeds');
      return;
    }
    if(sub==='comment'){
      const m=line.match(/comment\s+"([^"]*)"|comment\s+(\S+)/);
      return void doCommit(m?(m[1]||m[2]):'',false);
    }
    if(sub==='and-quit') return void doCommit('',true);
    if(sub==='confirmed'){ out('commit confirmed will be automatically rolled back in 10 minutes unless confirmed'); return void doCommit('',false); }
    if(sub===undefined) return void doCommit('',false);
    out('syntax error.','red'); return;
  }
  if(c==='rollback'){
    const n=parseInt(argv[1],10)||0;
    if(n===0){ D.cand=clone(D.comm); out('load complete'); return; }
    out('error: rollback '+n+' not available in simulator','red'); return;
  }
  if(c==='show'){
    const parts=line.split('|').map(s=>s.trim());
    const toks=parts[0].split(/\s+/).slice(1).filter(Boolean);
    const pipes=parts.slice(1);
    const path=D.edit.concat(toks);
    if(pipes.some(p=>/^display\s+set/.test(p))){
      const node=path.length?getNode(D.cand,path):D.cand;
      if(node===null){ out('error: statement not found','red'); return; }
      const lines=flatten(node,path).map(l=>'set '+l);
      outRaw(applyPipe(lines.join('\n'),pipes.filter(p=>!/^display/.test(p))));
      return;
    }
    if(pipes.some(p=>/^compare/.test(p))) return showCompare();
    const txt=showConfig(D.cand,path);
    if(txt===null){ out('error: statement not found: '+toks.join(' '),'red'); return; }
    outRaw(pipes.length?applyPipe(txt,pipes):txt);
    return;
  }
  if(c==='run'){
    const rest=argv.slice(1);
    if(!rest.length){ out('syntax error.','red'); return; }
    return opCommand(rest,rest.join(' '));
  }
  if(c==='status'){ out('Users currently editing the configuration:'); out('  '+D.user+' terminal v0 (pid 1234) on since '+stamp(boot)+', idle 00:00:01'); return; }
  if(c==='load'){ out('error: unsupported in simulator','red'); return; }
  if(c==='help'||c==='?'){ printHelp(); return; }
  if(c==='lab') return labCommand(argv.slice(1));
  if(c==='clear'&&argv.length===1){ screenEl.innerHTML=''; return; }
  if(c==='ping'||c==='traceroute'){ out('error: use "run '+c+' ..." in configuration mode','red'); return; }
  unknown(argv,0);
}
function leaveConfig(){
  if(dirty()){
    D.pending={prompt:'Exit with uncommitted changes? [yes,no] (yes) ',handler:v=>{
      D.pending=null;
      if(v.trim()===''||/^y/i.test(v.trim())){ D.mode='op'; D.edit=[]; D.cand=clone(D.comm); out('Exiting configuration mode'); }
    }};
    out('The configuration has been changed but not committed','amb');
    return;
  }
  D.mode='op'; D.edit=[]; out('Exiting configuration mode');
}
function showCompare(){
  const a=new Set(flatten(D.comm,[]).map(x=>x));
  const b=new Set(flatten(D.cand,[]).map(x=>x));
  let n=0;
  b.forEach(x=>{ if(!a.has(x)){ out('+   '+x,'grn'); n++; } });
  a.forEach(x=>{ if(!b.has(x)){ out('-   '+x,'red'); n++; } });
  if(!n) out('');
}
function setDelete(op,tokens){
  if(!tokens.length){
    if(op==='delete'){
      D.pending={prompt:'Delete everything under this level? [yes,no] (no) ',handler:v=>{
        D.pending=null;
        if(/^y/i.test(v.trim())){
          if(D.edit.length){ const p=getNode(D.cand,D.edit); if(p) Object.keys(p).forEach(k=>delete p[k]); }
          else D.cand={};
        }
      }};
      return;
    }
    out('syntax error.','red'); return;
  }
  const w=walk(tokens,D.edit);
  if(!w.ok){ syntaxErr(op+' '+tokens.join(' '),[op].concat(tokens),1+w.idx); return; }

  // interactive password prompt (the password statement is always the last one on the line)
  const lastPath=w.paths[w.paths.length-1];
  const pwIdx=lastPath.indexOf('plain-text-password');
  if(op==='set' && pwIdx>=0){
    for(const p of w.paths.slice(0,-1)) mkNode(D.cand,D.edit.concat(p));
    const base=D.edit.concat(lastPath.slice(0,pwIdx));
    if(pwIdx===lastPath.length-1) return promptPassword(base);
    const pw=lastPath[pwIdx+1], err=pwError(pw);
    if(err){ out('error: '+err,'red'); return; }
    mkNode(D.cand,base.concat(['encrypted-password',fakeHash(pw)]));
    return;
  }
  for(const p of w.paths){
    const full=D.edit.concat(p);
    if(op==='set') mkNode(D.cand,full);
    else if(op==='delete'){
      if(!delNode(D.cand,full)) out('warning: statement not found','amb');
    } else if(op==='deactivate'){ mkNode(D.cand,full.concat(['##inactive'])); }
    else if(op==='activate'){ delNode(D.cand,full.concat(['##inactive'])); }
  }
}
function pwError(pw){
  if(pw.length<6) return 'minimum 6 characters required';
  const classes=[/[a-z]/,/[A-Z]/,/[0-9]/,/[^a-zA-Z0-9]/].filter(r=>r.test(pw)).length;
  if(classes<2) return 'require change of case, digits or punctuation';
  return null;
}
function fakeHash(pw){
  let h=0; for(let i=0;i<pw.length;i++) h=(h*33+pw.charCodeAt(i))>>>0;
  const abc='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./';
  let s=''; let x=(h^0x9e3779b9)>>>0 || 0x1234567;
  for(let i=0;i<40;i++){
    x^=x<<13; x>>>=0; x^=x>>>17; x^=x<<5; x>>>=0;
    s+=abc[x%abc.length];
  }
  return '$6$'+s.slice(0,8)+'$'+s.slice(8);
}
function promptPassword(base){
  D.pending={prompt:'New password: ',secret:true,handler:pw=>{
    const err=pwError(pw);
    if(err){ D.pending=null; out('error: '+err,'red'); return; }
    D.pending={prompt:'Retype new password: ',secret:true,handler:pw2=>{
      D.pending=null;
      if(pw2!==pw){ out('error: Passwords do not match','red'); return; }
      mkNode(D.cand,base.concat(['encrypted-password',fakeHash(pw)]));
    }};
  }};
}

/* ---------- errors, help, labs ------------------------------------ */
function unknown(argv,idx){
  const pre=argv.slice(0,idx).join(' ');
  const col=promptStr().length+(pre?pre.length+1:0);
  out(' '.repeat(col)+'^','red');
  out("unknown command: "+argv[idx],'red');
  out('hint: press ? at any point in the line for valid completions','dim');
}
function syntaxErr(line,argv,idx){
  const pre=argv.slice(0,idx).join(' ');
  const col=promptStr().length+(pre?pre.length+1:0);
  out(' '.repeat(col)+'^','red');
  out('syntax error.','red');
  out('hint: press ? after "'+pre+'" to list valid completions','dim');
}
function printHelp(){
  out('Operational mode','grn');
  [['configure','enter configuration mode'],
   ['show version | interfaces terse | route | configuration','device state'],
   ['show system users | uptime | commit','system state'],
   ['show vlans | security zones | firewall filter NAME | lacp statistics interfaces ae0','feature state'],
   ['ping HOST [source X] [count N] | ping inet6 HOST','connectivity tests'],
   ['request system zeroize','wipe the configuration'],
   ['clear','clear the screen']].forEach(r=>out('  '+pad(r[0],62)+r[1]));
  out('');
  out('Configuration mode','grn');
  [['set / delete STATEMENT','change the candidate configuration'],
   ['edit HIERARCHY / up / top / exit','move around the hierarchy'],
   ['show [| display set] [| compare]','view the candidate configuration'],
   ['commit [check | comment "text" | and-quit]','validate and apply'],
   ['rollback','discard candidate changes'],
   ['run COMMAND','run an operational command']].forEach(r=>out('  '+pad(r[0],62)+r[1]));
  out('');
  out('Keys: Tab completes, ? lists completions, Up/Down history, Ctrl-C cancels','dim');
  out('Labs: "lab" lists the 12 course labs, "lab 6" shows lab 6, "lab 6 run" types it for you','dim');
}
let labQueue=null;
function labCommand(a){
  if(!a.length){
    out('Juniper Network Operating Systems — 25NHOP612','grn');
    LABS.forEach(l=>out('  '+pad('lab '+l.n,10)+l.t));
    out('');
    out('  lab N        show the objective and the command sequence','dim');
    out('  lab N run    replay the sequence one command at a time (Enter to step)','dim');
    return;
  }
  const n=parseInt(a[0],10);
  const L=LABS.find(x=>x.n===n);
  if(!L){ out('error: no such lab: '+a[0],'red'); return; }
  if(a[1]==='run'){
    labQueue={i:0,L:L};
    out('Lab '+L.n+': '+L.t,'grn');
    out('Press Enter on the empty line to enter the next command, or type your own.','dim');
    nextLabStep();
    return;
  }
  out('Lab '+L.n+': '+L.t,'grn');
  out(L.o,'dim');
  out('');
  L.c.forEach(c=>out('  '+c));
}
function nextLabStep(){
  if(!labQueue) return;
  if(labQueue.i>=labQueue.L.c.length){ out('Lab '+labQueue.L.n+' complete.','grn'); labQueue=null; return; }
  cmdEl.value=labQueue.L.c[labQueue.i++];
}
function zeroize(){
  D.cand={}; D.comm={}; D.host='junos'; D.mode='op'; D.edit=[]; D.commitTime=null; commitLog=[];
  screenEl.innerHTML='';
  welcome();
}

/* ---------- input handling ---------------------------------------- */
let inputEnabled=true;
function setInputEnabled(v){ inputEnabled=v; cmdEl.disabled=!v; if(v) cmdEl.focus(); }

function submitLine(){
  const raw=cmdEl.value;
  if(D.pending){
    const p=D.pending;
    out(p.prompt+(p.secret?'':raw));
    cmdEl.value='';
    p.handler(raw);
    refresh();
    return;
  }
  const line=raw.trim();
  if(bannerEl.textContent) out(bannerEl.textContent,'dim');
  out(promptStr()+raw);
  cmdEl.value='';
  if(line){ D.hist.push(line); D.hidx=D.hist.length; }
  if(line){
    try{ dispatch(line); }
    catch(e){ out('error: internal simulator error: '+e.message,'red'); }
  }
  refresh();
  if(labQueue) nextLabStep();
}
function dispatch(line){
  const argv=line.split('|')[0].trim().split(/\s+/).filter(Boolean);
  if(!argv.length) return;
  if(D.mode==='op'){
    if(line.indexOf('|')>0 && argv[0]==='show'){
      const parts=line.split('|').map(s=>s.trim());
      const captured=[];
      capBuf=captured;
      try{ showCommand(parts[0].split(/\s+/).slice(1),parts[0]); }
      finally{ capBuf=null; }
      const pipes=parts.slice(1);
      if(pipes.some(p=>/^display\s+set/.test(p))){
        const lines=flatten(D.comm,[]).map(l=>'set '+l);
        outRaw(applyPipe(lines.join('\n'),pipes.filter(p=>!/^display/.test(p))));
        return;
      }
      outRaw(applyPipe(captured.join('\n'),pipes));
      return;
    }
    opCommand(argv,line);
  } else {
    cfgCommand(argv,line);
  }
}

function complete(showList){
  if(D.pending) return;
  const raw=cmdEl.value;
  const trailing=/\s$/.test(raw);
  const toks=raw.trim().split(/\s+/).filter(Boolean);
  const first=toks[0];
  const cfgVerb = D.mode==='cfg' && ['set','delete','edit','deactivate','activate','show'].indexOf(first)>=0;
  if(!cfgVerb){
    // top-level command completion
    const pool = D.mode==='op'
      ? ['configure','show','ping','traceroute','request','clear','help','lab','exit']
      : ['set','delete','edit','show','commit','rollback','run','top','up','exit','status','help','lab','clear'];
    const cur = trailing?'':(toks[toks.length-1]||'');
    if(toks.length>1||trailing){
      if(showList){ out(raw+' ?'); out('Possible completions:','dim'); out('  <command>   complete the statement above','dim'); }
      return;
    }
    const m=pool.filter(x=>x.indexOf(cur)===0);
    if(showList){
      out(promptStr()+raw+'?');
      out('Possible completions:','dim');
      m.forEach(x=>out('  '+pad(x,20),'dim'));
      return;
    }
    if(m.length===1) cmdEl.value=m[0]+' ';
    else if(m.length>1){ out(promptStr()+raw); m.forEach(x=>out('  '+x,'dim')); }
    return;
  }
  const args=toks.slice(1);
  const cur = trailing?'':(args.length?args[args.length-1]:'');
  const ctx = trailing?args:args.slice(0,-1);
  const comps=completions(ctx,D.edit);
  if(comps===null){ if(showList){ out(promptStr()+raw+'?'); out('syntax error.','red'); } return; }
  const m=comps.filter(c=>c.k.indexOf(cur)===0 || c.k==='<value>');
  if(showList){
    out(promptStr()+raw+'?');
    out('Possible completions:','dim');
    if(!m.length) out('  (no completions — this statement is complete)','dim');
    m.forEach(c=>out('  '+pad(c.k,24)+c.d,'dim'));
    return;
  }
  const words=m.filter(c=>c.k!=='<value>').map(c=>c.k);
  if(words.length===1){
    const base=raw.replace(/\S*$/,'');
    cmdEl.value=(trailing?raw:base)+words[0]+' ';
  } else if(words.length>1){
    out(promptStr()+raw);
    words.forEach(w=>out('  '+w,'dim'));
  }
}

cmdEl.addEventListener('keydown',e=>{
  if(e.key==='Enter'){ e.preventDefault(); submitLine(); return; }
  if(e.key==='Tab'){ e.preventDefault(); complete(false); return; }
  if(e.key==='?'&&!D.pending){ e.preventDefault(); complete(true); return; }
  if(e.key==='ArrowUp'){ e.preventDefault(); if(D.hidx>0){ D.hidx--; cmdEl.value=D.hist[D.hidx]||''; } return; }
  if(e.key==='ArrowDown'){ e.preventDefault(); if(D.hidx<D.hist.length-1){ D.hidx++; cmdEl.value=D.hist[D.hidx]||''; } else { D.hidx=D.hist.length; cmdEl.value=''; } return; }
  if(e.key==='c'&&e.ctrlKey){ e.preventDefault(); if(D.ping) stopPing(false); else { out(promptStr()+cmdEl.value+'^C'); cmdEl.value=''; D.pending=null; refresh(); } return; }
  if(e.key==='l'&&e.ctrlKey){ e.preventDefault(); screenEl.innerHTML=''; return; }
  if(e.key==='u'&&e.ctrlKey){ e.preventDefault(); cmdEl.value=''; return; }
});
document.querySelectorAll('.keys button').forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.k;
  if(k==='tab') complete(false);
  else if(k==='q') complete(true);
  else if(k==='up'){ if(D.hidx>0){ D.hidx--; cmdEl.value=D.hist[D.hidx]||''; } }
  else if(k==='down'){ if(D.hidx<D.hist.length-1){ D.hidx++; cmdEl.value=D.hist[D.hidx]||''; } else { D.hidx=D.hist.length; cmdEl.value=''; } }
  else if(k==='ctrlc'){ if(D.ping) stopPing(false); else { cmdEl.value=''; D.pending=null; refresh(); } }
  else if(k==='pipe') cmdEl.value+=' | ';
  cmdEl.focus();
}));
document.getElementById('btnLabs').addEventListener('click',()=>{ out(promptStr()+'lab'); labCommand([]); cmdEl.focus(); });
document.getElementById('btnReset').addEventListener('click',()=>{ zeroize(); cmdEl.focus(); });
screenEl.addEventListener('click',()=>{ if(!window.getSelection().toString()) cmdEl.focus(); });

/* ---------- boot ---------------------------------------------------- */
function welcome(){
  out('FreeBSD/amd64 ('+D.host+') (ttyu0)');
  out('');
  out('login: root');
  out('Password:');
  out('');
  out('--- JUNOS '+D.ver+' Kernel 64-bit  JNPR-11.0-20211203.6c2f68f_buil');
  out('root@'+D.host+':~ # cli');
  out('');
  out('Junos practice console. Type help for a command summary, lab for the course labs.','dim');
  out('');
  refresh();
}
welcome();
cmdEl.focus();
