import {serve} from 'https://deno.land/std@0.168.0/http/server.ts';
serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}});
  // Never expose Swan or Adyen secrets in the browser. Add approved server-to-server calls here after sandbox onboarding.
  return new Response(JSON.stringify({ok:true,mode:'mock',message:'Provider proxy ready for Swan and Adyen sandbox credentials'}),{headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
});
