var Rt={exports:{}},It={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(r,c){var f=r.length;r.push(c);t:for(;0<f;){var v=f-1>>>1,_=r[v];if(0<o(_,c))r[v]=c,r[f]=_,f=v;else break t}}function n(r){return r.length===0?null:r[0]}function i(r){if(r.length===0)return null;var c=r[0],f=r.pop();if(f!==c){r[0]=f;t:for(var v=0,_=r.length,H=_>>>1;v<H;){var I=2*(v+1)-1,X=r[I],w=I+1,k=r[w];if(0>o(X,f))w<_&&0>o(k,X)?(r[v]=k,r[w]=f,v=w):(r[v]=X,r[I]=f,v=I);else if(w<_&&0>o(k,f))r[v]=k,r[w]=f,v=w;else break t}}return c}function o(r,c){var f=r.sortIndex-c.sortIndex;return f!==0?f:r.id-c.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,u=a.now();t.unstable_now=function(){return a.now()-u}}var l=[],g=[],O=1,p=null,d=3,h=!1,E=!1,y=!1,z=typeof setTimeout=="function"?setTimeout:null,Z=typeof clearTimeout=="function"?clearTimeout:null,tt=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function B(r){for(var c=n(g);c!==null;){if(c.callback===null)i(g);else if(c.startTime<=r)i(g),c.sortIndex=c.expirationTime,e(l,c);else break;c=n(g)}}function q(r){if(y=!1,B(r),!E)if(n(l)!==null)E=!0,J($);else{var c=n(g);c!==null&&W(q,c.startTime-r)}}function $(r,c){E=!1,y&&(y=!1,Z(T),T=-1),h=!0;var f=d;try{for(B(c),p=n(l);p!==null&&(!(p.expirationTime>c)||r&&!it());){var v=p.callback;if(typeof v=="function"){p.callback=null,d=p.priorityLevel;var _=v(p.expirationTime<=c);c=t.unstable_now(),typeof _=="function"?p.callback=_:p===n(l)&&i(l),B(c)}else i(l);p=n(l)}if(p!==null)var H=!0;else{var I=n(g);I!==null&&W(q,I.startTime-c),H=!1}return H}finally{p=null,d=f,h=!1}}var F=!1,x=null,T=-1,et=5,nt=-1;function it(){return!(t.unstable_now()-nt<et)}function V(){if(x!==null){var r=t.unstable_now();nt=r;var c=!0;try{c=x(!0,r)}finally{c?N():(F=!1,x=null)}}else F=!1}var N;if(typeof tt=="function")N=function(){tt(V)};else if(typeof MessageChannel<"u"){var ot=new MessageChannel,Nt=ot.port2;ot.port1.onmessage=V,N=function(){Nt.postMessage(null)}}else N=function(){z(V,0)};function J(r){x=r,F||(F=!0,N())}function W(r,c){T=z(function(){r(t.unstable_now())},c)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(r){r.callback=null},t.unstable_continueExecution=function(){E||h||(E=!0,J($))},t.unstable_forceFrameRate=function(r){0>r||125<r?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):et=0<r?Math.floor(1e3/r):5},t.unstable_getCurrentPriorityLevel=function(){return d},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(r){switch(d){case 1:case 2:case 3:var c=3;break;default:c=d}var f=d;d=c;try{return r()}finally{d=f}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(r,c){switch(r){case 1:case 2:case 3:case 4:case 5:break;default:r=3}var f=d;d=r;try{return c()}finally{d=f}},t.unstable_scheduleCallback=function(r,c,f){var v=t.unstable_now();switch(typeof f=="object"&&f!==null?(f=f.delay,f=typeof f=="number"&&0<f?v+f:v):f=v,r){case 1:var _=-1;break;case 2:_=250;break;case 5:_=1073741823;break;case 4:_=1e4;break;default:_=5e3}return _=f+_,r={id:O++,callback:c,priorityLevel:r,startTime:f,expirationTime:_,sortIndex:-1},f>v?(r.sortIndex=f,e(g,r),n(l)===null&&r===n(g)&&(y?(Z(T),T=-1):y=!0,W(q,f-v))):(r.sortIndex=_,e(l,r),E||h||(E=!0,J($))),r},t.unstable_shouldYield=it,t.unstable_wrapCallback=function(r){var c=d;return function(){var f=d;d=c;try{return r.apply(this,arguments)}finally{d=f}}}})(It);Rt.exports=It;var ye=Rt.exports,st;(function(t){t.STRING="string",t.NUMBER="number",t.INTEGER="integer",t.BOOLEAN="boolean",t.ARRAY="array",t.OBJECT="object"})(st||(st={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var rt;(function(t){t.LANGUAGE_UNSPECIFIED="language_unspecified",t.PYTHON="python"})(rt||(rt={}));var at;(function(t){t.OUTCOME_UNSPECIFIED="outcome_unspecified",t.OUTCOME_OK="outcome_ok",t.OUTCOME_FAILED="outcome_failed",t.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(at||(at={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ct=["user","model","function","system"];var ut;(function(t){t.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",t.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",t.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",t.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",t.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"})(ut||(ut={}));var lt;(function(t){t.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",t.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",t.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",t.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",t.BLOCK_NONE="BLOCK_NONE"})(lt||(lt={}));var dt;(function(t){t.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",t.NEGLIGIBLE="NEGLIGIBLE",t.LOW="LOW",t.MEDIUM="MEDIUM",t.HIGH="HIGH"})(dt||(dt={}));var ft;(function(t){t.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",t.SAFETY="SAFETY",t.OTHER="OTHER"})(ft||(ft={}));var D;(function(t){t.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",t.STOP="STOP",t.MAX_TOKENS="MAX_TOKENS",t.SAFETY="SAFETY",t.RECITATION="RECITATION",t.LANGUAGE="LANGUAGE",t.OTHER="OTHER"})(D||(D={}));var ht;(function(t){t.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",t.RETRIEVAL_QUERY="RETRIEVAL_QUERY",t.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",t.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",t.CLASSIFICATION="CLASSIFICATION",t.CLUSTERING="CLUSTERING"})(ht||(ht={}));var gt;(function(t){t.MODE_UNSPECIFIED="MODE_UNSPECIFIED",t.AUTO="AUTO",t.ANY="ANY",t.NONE="NONE"})(gt||(gt={}));var Et;(function(t){t.MODE_UNSPECIFIED="MODE_UNSPECIFIED",t.MODE_DYNAMIC="MODE_DYNAMIC"})(Et||(Et={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C extends Error{constructor(e){super(`[GoogleGenerativeAI Error]: ${e}`)}}class A extends C{constructor(e,n){super(e),this.response=n}}class wt extends C{constructor(e,n,i,o){super(e),this.status=n,this.statusText=i,this.errorDetails=o}}class b extends C{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mt="https://generativelanguage.googleapis.com",Dt="v1beta",Lt="0.21.0",jt="genai-js";var S;(function(t){t.GENERATE_CONTENT="generateContent",t.STREAM_GENERATE_CONTENT="streamGenerateContent",t.COUNT_TOKENS="countTokens",t.EMBED_CONTENT="embedContent",t.BATCH_EMBED_CONTENTS="batchEmbedContents"})(S||(S={}));class Gt{constructor(e,n,i,o,s){this.model=e,this.task=n,this.apiKey=i,this.stream=o,this.requestOptions=s}toString(){var e,n;const i=((e=this.requestOptions)===null||e===void 0?void 0:e.apiVersion)||Dt;let s=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||Mt}/${i}/${this.model}:${this.task}`;return this.stream&&(s+="?alt=sse"),s}}function Ut(t){const e=[];return t?.apiClient&&e.push(t.apiClient),e.push(`${jt}/${Lt}`),e.join(" ")}async function Ft(t){var e;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",Ut(t.requestOptions)),n.append("x-goog-api-key",t.apiKey);let i=(e=t.requestOptions)===null||e===void 0?void 0:e.customHeaders;if(i){if(!(i instanceof Headers))try{i=new Headers(i)}catch(o){throw new b(`unable to convert customHeaders value ${JSON.stringify(i)} to Headers: ${o.message}`)}for(const[o,s]of i.entries()){if(o==="x-goog-api-key")throw new b(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new b(`Header name ${o} can only be set using the apiClient field`);n.append(o,s)}}return n}async function xt(t,e,n,i,o,s){const a=new Gt(t,e,n,i,s);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},Kt(s)),{method:"POST",headers:await Ft(a),body:o})}}async function U(t,e,n,i,o,s={},a=fetch){const{url:u,fetchOptions:l}=await xt(t,e,n,i,o,s);return Ht(u,l,a)}async function Ht(t,e,n=fetch){let i;try{i=await n(t,e)}catch(o){kt(o,t)}return i.ok||await Pt(i,t),i}function kt(t,e){let n=t;throw t instanceof wt||t instanceof b||(n=new C(`Error fetching from ${e.toString()}: ${t.message}`),n.stack=t.stack),n}async function Pt(t,e){let n="",i;try{const o=await t.json();n=o.error.message,o.error.details&&(n+=` ${JSON.stringify(o.error.details)}`,i=o.error.details)}catch{}throw new wt(`Error fetching from ${e.toString()}: [${t.status} ${t.statusText}] ${n}`,t.status,t.statusText,i)}function Kt(t){const e={};if(t?.signal!==void 0||t?.timeout>=0){const n=new AbortController;t?.timeout>=0&&setTimeout(()=>n.abort(),t.timeout),t?.signal&&t.signal.addEventListener("abort",()=>{n.abort()}),e.signal=n.signal}return e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q(t){return t.text=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),K(t.candidates[0]))throw new A(`${m(t)}`,t);return Yt(t)}else if(t.promptFeedback)throw new A(`Text not available. ${m(t)}`,t);return""},t.functionCall=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),K(t.candidates[0]))throw new A(`${m(t)}`,t);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),vt(t)[0]}else if(t.promptFeedback)throw new A(`Function call not available. ${m(t)}`,t)},t.functionCalls=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),K(t.candidates[0]))throw new A(`${m(t)}`,t);return vt(t)}else if(t.promptFeedback)throw new A(`Function call not available. ${m(t)}`,t)},t}function Yt(t){var e,n,i,o;const s=[];if(!((n=(e=t.candidates)===null||e===void 0?void 0:e[0].content)===null||n===void 0)&&n.parts)for(const a of(o=(i=t.candidates)===null||i===void 0?void 0:i[0].content)===null||o===void 0?void 0:o.parts)a.text&&s.push(a.text),a.executableCode&&s.push("\n```"+a.executableCode.language+`
`+a.executableCode.code+"\n```\n"),a.codeExecutionResult&&s.push("\n```\n"+a.codeExecutionResult.output+"\n```\n");return s.length>0?s.join(""):""}function vt(t){var e,n,i,o;const s=[];if(!((n=(e=t.candidates)===null||e===void 0?void 0:e[0].content)===null||n===void 0)&&n.parts)for(const a of(o=(i=t.candidates)===null||i===void 0?void 0:i[0].content)===null||o===void 0?void 0:o.parts)a.functionCall&&s.push(a.functionCall);if(s.length>0)return s}const Bt=[D.RECITATION,D.SAFETY,D.LANGUAGE];function K(t){return!!t.finishReason&&Bt.includes(t.finishReason)}function m(t){var e,n,i;let o="";if((!t.candidates||t.candidates.length===0)&&t.promptFeedback)o+="Response was blocked",!((e=t.promptFeedback)===null||e===void 0)&&e.blockReason&&(o+=` due to ${t.promptFeedback.blockReason}`),!((n=t.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(o+=`: ${t.promptFeedback.blockReasonMessage}`);else if(!((i=t.candidates)===null||i===void 0)&&i[0]){const s=t.candidates[0];K(s)&&(o+=`Candidate was blocked due to ${s.finishReason}`,s.finishMessage&&(o+=`: ${s.finishMessage}`))}return o}function L(t){return this instanceof L?(this.v=t,this):new L(t)}function qt(t,e,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=n.apply(t,e||[]),o,s=[];return o={},a("next"),a("throw"),a("return"),o[Symbol.asyncIterator]=function(){return this},o;function a(d){i[d]&&(o[d]=function(h){return new Promise(function(E,y){s.push([d,h,E,y])>1||u(d,h)})})}function u(d,h){try{l(i[d](h))}catch(E){p(s[0][3],E)}}function l(d){d.value instanceof L?Promise.resolve(d.value.v).then(g,O):p(s[0][2],d)}function g(d){u("next",d)}function O(d){u("throw",d)}function p(d,h){d(h),s.shift(),s.length&&u(s[0][0],s[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pt=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function $t(t){const e=t.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=Wt(e),[i,o]=n.tee();return{stream:Jt(i),response:Vt(o)}}async function Vt(t){const e=[],n=t.getReader();for(;;){const{done:i,value:o}=await n.read();if(i)return Q(Xt(e));e.push(o)}}function Jt(t){return qt(this,arguments,function*(){const n=t.getReader();for(;;){const{value:i,done:o}=yield L(n.read());if(o)break;yield yield L(Q(i))}})}function Wt(t){const e=t.getReader();return new ReadableStream({start(i){let o="";return s();function s(){return e.read().then(({value:a,done:u})=>{if(u){if(o.trim()){i.error(new C("Failed to parse stream"));return}i.close();return}o+=a;let l=o.match(pt),g;for(;l;){try{g=JSON.parse(l[1])}catch{i.error(new C(`Error parsing JSON response: "${l[1]}"`));return}i.enqueue(g),o=o.substring(l[0].length),l=o.match(pt)}return s()})}}})}function Xt(t){const e=t[t.length-1],n={promptFeedback:e?.promptFeedback};for(const i of t){if(i.candidates)for(const o of i.candidates){const s=o.index;if(n.candidates||(n.candidates=[]),n.candidates[s]||(n.candidates[s]={index:o.index}),n.candidates[s].citationMetadata=o.citationMetadata,n.candidates[s].groundingMetadata=o.groundingMetadata,n.candidates[s].finishReason=o.finishReason,n.candidates[s].finishMessage=o.finishMessage,n.candidates[s].safetyRatings=o.safetyRatings,o.content&&o.content.parts){n.candidates[s].content||(n.candidates[s].content={role:o.content.role||"user",parts:[]});const a={};for(const u of o.content.parts)u.text&&(a.text=u.text),u.functionCall&&(a.functionCall=u.functionCall),u.executableCode&&(a.executableCode=u.executableCode),u.codeExecutionResult&&(a.codeExecutionResult=u.codeExecutionResult),Object.keys(a).length===0&&(a.text=""),n.candidates[s].content.parts.push(a)}}i.usageMetadata&&(n.usageMetadata=i.usageMetadata)}return n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function St(t,e,n,i){const o=await U(e,S.STREAM_GENERATE_CONTENT,t,!0,JSON.stringify(n),i);return $t(o)}async function At(t,e,n,i){const s=await(await U(e,S.GENERATE_CONTENT,t,!1,JSON.stringify(n),i)).json();return{response:Q(s)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tt(t){if(t!=null){if(typeof t=="string")return{role:"system",parts:[{text:t}]};if(t.text)return{role:"system",parts:[t]};if(t.parts)return t.role?t:{role:"system",parts:t.parts}}}function j(t){let e=[];if(typeof t=="string")e=[{text:t}];else for(const n of t)typeof n=="string"?e.push({text:n}):e.push(n);return Qt(e)}function Qt(t){const e={role:"user",parts:[]},n={role:"function",parts:[]};let i=!1,o=!1;for(const s of t)"functionResponse"in s?(n.parts.push(s),o=!0):(e.parts.push(s),i=!0);if(i&&o)throw new C("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!i&&!o)throw new C("No content is provided for sending chat message.");return i?e:n}function zt(t,e){var n;let i={model:e?.model,generationConfig:e?.generationConfig,safetySettings:e?.safetySettings,tools:e?.tools,toolConfig:e?.toolConfig,systemInstruction:e?.systemInstruction,cachedContent:(n=e?.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const o=t.generateContentRequest!=null;if(t.contents){if(o)throw new b("CountTokensRequest must have one of contents or generateContentRequest, not both.");i.contents=t.contents}else if(o)i=Object.assign(Object.assign({},i),t.generateContentRequest);else{const s=j(t);i.contents=[s]}return{generateContentRequest:i}}function _t(t){let e;return t.contents?e=t:e={contents:[j(t)]},t.systemInstruction&&(e.systemInstruction=Tt(t.systemInstruction)),e}function Zt(t){return typeof t=="string"||Array.isArray(t)?{content:j(t)}:t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ct=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],te={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function ee(t){let e=!1;for(const n of t){const{role:i,parts:o}=n;if(!e&&i!=="user")throw new C(`First content should be with role 'user', got ${i}`);if(!ct.includes(i))throw new C(`Each item should include role field. Got ${i} but valid roles are: ${JSON.stringify(ct)}`);if(!Array.isArray(o))throw new C("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new C("Each Content should have at least one part");const s={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const u of o)for(const l of Ct)l in u&&(s[l]+=1);const a=te[i];for(const u of Ct)if(!a.includes(u)&&s[u]>0)throw new C(`Content with role '${i}' can't contain '${u}' part`);e=!0}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yt="SILENT_ERROR";class ne{constructor(e,n,i,o={}){this.model=n,this.params=i,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=e,i?.history&&(ee(i.history),this._history=i.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(e,n={}){var i,o,s,a,u,l;await this._sendPromise;const g=j(e),O={safetySettings:(i=this.params)===null||i===void 0?void 0:i.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(s=this.params)===null||s===void 0?void 0:s.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(u=this.params)===null||u===void 0?void 0:u.systemInstruction,cachedContent:(l=this.params)===null||l===void 0?void 0:l.cachedContent,contents:[...this._history,g]},p=Object.assign(Object.assign({},this._requestOptions),n);let d;return this._sendPromise=this._sendPromise.then(()=>At(this._apiKey,this.model,O,p)).then(h=>{var E;if(h.response.candidates&&h.response.candidates.length>0){this._history.push(g);const y=Object.assign({parts:[],role:"model"},(E=h.response.candidates)===null||E===void 0?void 0:E[0].content);this._history.push(y)}else{const y=m(h.response);y&&console.warn(`sendMessage() was unsuccessful. ${y}. Inspect response object for details.`)}d=h}),await this._sendPromise,d}async sendMessageStream(e,n={}){var i,o,s,a,u,l;await this._sendPromise;const g=j(e),O={safetySettings:(i=this.params)===null||i===void 0?void 0:i.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(s=this.params)===null||s===void 0?void 0:s.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(u=this.params)===null||u===void 0?void 0:u.systemInstruction,cachedContent:(l=this.params)===null||l===void 0?void 0:l.cachedContent,contents:[...this._history,g]},p=Object.assign(Object.assign({},this._requestOptions),n),d=St(this._apiKey,this.model,O,p);return this._sendPromise=this._sendPromise.then(()=>d).catch(h=>{throw new Error(yt)}).then(h=>h.response).then(h=>{if(h.candidates&&h.candidates.length>0){this._history.push(g);const E=Object.assign({},h.candidates[0].content);E.role||(E.role="model"),this._history.push(E)}else{const E=m(h);E&&console.warn(`sendMessageStream() was unsuccessful. ${E}. Inspect response object for details.`)}}).catch(h=>{h.message!==yt&&console.error(h)}),d}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ie(t,e,n,i){return(await U(e,S.COUNT_TOKENS,t,!1,JSON.stringify(n),i)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oe(t,e,n,i){return(await U(e,S.EMBED_CONTENT,t,!1,JSON.stringify(n),i)).json()}async function se(t,e,n,i){const o=n.requests.map(a=>Object.assign(Object.assign({},a),{model:e}));return(await U(e,S.BATCH_EMBED_CONTENTS,t,!1,JSON.stringify({requests:o}),i)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(e,n,i={}){this.apiKey=e,this._requestOptions=i,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=Tt(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(e,n={}){var i;const o=_t(e),s=Object.assign(Object.assign({},this._requestOptions),n);return At(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(i=this.cachedContent)===null||i===void 0?void 0:i.name},o),s)}async generateContentStream(e,n={}){var i;const o=_t(e),s=Object.assign(Object.assign({},this._requestOptions),n);return St(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(i=this.cachedContent)===null||i===void 0?void 0:i.name},o),s)}startChat(e){var n;return new ne(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},e),this._requestOptions)}async countTokens(e,n={}){const i=zt(e,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),n);return ie(this.apiKey,this.model,i,o)}async embedContent(e,n={}){const i=Zt(e),o=Object.assign(Object.assign({},this._requestOptions),n);return oe(this.apiKey,this.model,i,o)}async batchEmbedContents(e,n={}){const i=Object.assign(Object.assign({},this._requestOptions),n);return se(this.apiKey,this.model,e,i)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e){this.apiKey=e}getGenerativeModel(e,n){if(!e.model)throw new C("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new Ot(this.apiKey,e,n)}getGenerativeModelFromCachedContent(e,n,i){if(!e.name)throw new b("Cached content must contain a `name` field.");if(!e.model)throw new b("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const a of o)if(n?.[a]&&e[a]&&n?.[a]!==e[a]){if(a==="model"){const u=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,l=e.model.startsWith("models/")?e.model.replace("models/",""):e.model;if(u===l)continue}throw new b(`Different value for "${a}" specified in modelParams (${n[a]}) and cachedContent (${e[a]})`)}const s=Object.assign(Object.assign({},n),{model:e.model,tools:e.tools,toolConfig:e.toolConfig,systemInstruction:e.systemInstruction,cachedContent:e});return new Ot(this.apiKey,s,i)}}function re(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function mt(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);e&&(i=i.filter(function(o){return Object.getOwnPropertyDescriptor(t,o).enumerable})),n.push.apply(n,i)}return n}function bt(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?mt(Object(n),!0).forEach(function(i){re(t,i,n[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):mt(Object(n)).forEach(function(i){Object.defineProperty(t,i,Object.getOwnPropertyDescriptor(n,i))})}return t}function ae(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return function(i){return e.reduceRight(function(o,s){return s(o)},i)}}function M(t){return function e(){for(var n=this,i=arguments.length,o=new Array(i),s=0;s<i;s++)o[s]=arguments[s];return o.length>=t.length?t.apply(this,o):function(){for(var a=arguments.length,u=new Array(a),l=0;l<a;l++)u[l]=arguments[l];return e.apply(n,[].concat(o,u))}}}function Y(t){return{}.toString.call(t).includes("Object")}function ce(t){return!Object.keys(t).length}function G(t){return typeof t=="function"}function ue(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function le(t,e){return Y(e)||R("changeType"),Object.keys(e).some(function(n){return!ue(t,n)})&&R("changeField"),e}function de(t){G(t)||R("selectorType")}function fe(t){G(t)||Y(t)||R("handlerType"),Y(t)&&Object.values(t).some(function(e){return!G(e)})&&R("handlersType")}function he(t){t||R("initialIsRequired"),Y(t)||R("initialType"),ce(t)&&R("initialContent")}function ge(t,e){throw new Error(t[e]||t.default)}var Ee={initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"},R=M(ge)(Ee),P={changes:le,selector:de,handler:fe,initial:he};function ve(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};P.initial(t),P.handler(e);var n={current:t},i=M(Ce)(n,e),o=M(_e)(n),s=M(P.changes)(t),a=M(pe)(n);function u(){var g=arguments.length>0&&arguments[0]!==void 0?arguments[0]:function(O){return O};return P.selector(g),g(n.current)}function l(g){ae(i,o,s,a)(g)}return[u,l]}function pe(t,e){return G(e)?e(t.current):e}function _e(t,e){return t.current=bt(bt({},t.current),e),e}function Ce(t,e,n){return G(e)?e(t.current):Object.keys(n).forEach(function(i){var o;return(o=e[i])===null||o===void 0?void 0:o.call(e,t.current[i])}),n}var me={create:ve};export{Oe as G,me as i,ye as s};
