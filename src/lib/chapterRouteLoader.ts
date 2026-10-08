// Prefetch and React.lazy share this promise: no loading-screen flash.
let route:Promise<typeof import("../components/CompanionRoute")>|undefined;
let ready:typeof import("../components/CompanionRoute")|undefined;
export const loadedCompanionRoute=()=>ready;
export const loadCompanionRoute=()=>route??=import("../components/CompanionRoute").then(module=>{
  ready=module;return module;
}).catch(error=>{route=undefined;throw error;});
