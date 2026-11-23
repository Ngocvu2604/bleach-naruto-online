import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function parseSwf(bytes) {
  const signature=bytes.toString('ascii',0,3);
  if(!['CWS','FWS'].includes(signature))throw new Error('Unsupported SWF signature');
  const body=signature==='CWS'?inflateSync(bytes.subarray(8)):bytes.subarray(8);
  const bits=body[0]>>3;
  const rectLength=Math.ceil((5+4*bits)/8);
  let pos=rectLength+4;
  const tags=[];
  while(pos<body.length){
    const header=body.readUInt16LE(pos);pos+=2;
    const code=header>>6;let length=header&63;
    if(length===63){length=body.readUInt32LE(pos);pos+=4;}
    if(pos+length>body.length)throw new Error('Truncated SWF');
    const data=body.subarray(pos,pos+length);pos+=length;
    const name=code===82?data.toString('utf8',4,data.indexOf(0,4)):null;
    tags.push({code,name,hash:sha256(data),data});
    if(code===0)break;
  }
  let bit=5;
  const signed=()=>{let n=0;for(let i=0;i<bits;i++,bit++)n=n*2+((body[bit>>3]>>(7-(bit&7)))&1);return n>=2**(bits-1)?n-2**bits:n;};
  const [xMin,xMax,yMin,yMax]=[signed(),signed(),signed(),signed()];
  return {header:body.subarray(0,rectLength+4),timing:body.subarray(rectLength,rectLength+4),width:(xMax-xMin)/20,height:(yMax-yMin)/20,tags};
}

/** Change only the display RECT; preserve coordinate origin, frame rate, frames and tags. */
export function gameOnlyStage(bytes) {
  if(bytes.toString('ascii',0,3)!=='FWS')throw new Error('Expected uncompressed SWF');
  const result=Buffer.from(bytes),bits=result[8]>>3;
  const movie=parseSwf(bytes);
  if(movie.width!==1000||movie.height!==600)throw new Error('Unexpected upstream debug stage');
  // Original content is 800x600; the extra 200 pixels belonged to the debug panel.
  const xmax=800*20;
  for(let i=0;i<bits;i++){
    const bit=5+bits+i,offset=8+(bit>>3),mask=1<<(7-(bit&7));
    result[offset]=(result[offset]&~mask)|(((xmax>>(bits-i-1))&1)?mask:0);
  }
  return result;
}
