(()=>{"use strict";function t(t,n,o,c){const a=Math.sign(o-t),s=Math.abs(o-t),e=Math.sign(c-n),r=Math.abs(c-n),h=s>r,u=-2*Math.abs(s-r),f=2*Math.min(s,r);let i=Math.max(s,r),l=u+i,M=t,m=n;const p=[];for(;i>=0;)p.push([M,m]),i-=1,(l>=0||h)&&(M+=a),(l>=0||!h)&&(m+=e),l+=l>=0?u:f;return p}function n(t,n){let o=0;for(let c of n){const n=c[0],a=c[1];o+=t[n][a]}return o/n.length}function o(n,o){const c={},a=function(t,n){const o=[n/2,n/2],c=[];for(let a=0;a<t;a++){const s=Math.floor(o[0]+Math.cos(2*a*Math.PI/t)*(n-1)/2),e=Math.floor(o[1]+Math.sin(2*a*Math.PI/t)*(n-1)/2);c.push([s,e])}return c}(n,o);for(let s=0;s<n;s++)for(let o=s+1;o<n;o++){const n=t(a[s][0],a[s][1],a[o][0],a[o][1]);c["".concat(s,"-").concat(o)]=n}return c}function c(t,o,c,a){let s=1/0,e=0;for(let u=0;u<o;u++){if(a===u)continue;const o=Math.min(a,u),r=Math.max(a,u),h=n(t,c["".concat(o,"-").concat(r)]);h<s&&(s=h,e=u)}const r=Math.min(a,e),h=Math.max(a,e);return[e,c["".concat(r,"-").concat(h)]]}function a(t,n,o){return t.forEach((t=>{const c=t[0],a=t[1];n[c][a]+=Math.floor(255*o)})),n}onmessage=t=>{const{imageData:n,numberOfPoints:s,numberOfThreads:e,screenSize:r,lineTranparency:h}=t.data,u=function(t,n,s,e,r){const h=function(t,n,o){const c=[];for(let a=0;a<o;a++){const o=[];for(let c=0;c<n;c++){const s=c*n+a;o.push(t[s])}c.push(o)}return c}(function(t){const n=[];for(let o=0;o<t.length;o+=4)n.push(t[o]);return n}(t),e,e),u=o(s,e),f=[0];let i=h,l=0;for(let o=0;o<n;o++){const[t,n]=c(i,s,u,l);i=a(n,i,r),f.push(t),l=t}return f}(n,e,s,r,h);postMessage(u)}})();
//# sourceMappingURL=765.21db058d.chunk.js.map