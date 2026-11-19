
(function(){
  "use strict";
  var T = window.__TOPIC__, ALL = window.__ALL__ || [];
  var DEFAULT_WS = "D:\\WorkBuddy-财务工作区";
  var PLAN_LINE = "请先给出处理计划，先不执行；等我确认计划后，再按计划执行。";
  var ns = "wbfin:" + T.id + ":";
  var store = {
    get:function(k,d){ try{ var v=localStorage.getItem(ns+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
    set:function(k,v){ try{ localStorage.setItem(ns+k, JSON.stringify(v)); }catch(e){} }
  };
  function $(s){ return document.querySelector(s); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }

  function join(){ return Array.prototype.slice.call(arguments).join("\\"); }
  function pathSet(ws){
    var sep = "\\";
    return {
      WS:ws, SEP:sep,
      IN1:join(ws,"01-原始数据","专题一-报表处理"),
      IN2:join(ws,"01-原始数据","专题二-数据校验"),
      IN3:join(ws,"01-原始数据","专题三-财务信息抽取"),
      IN4:join(ws,"01-原始数据","专题四-合同审阅"),
      IN5:join(ws,"01-原始数据","专题五-合规检查"),
      IN6:join(ws,"01-原始数据","专题六-费用分析"),
      OUT:join(ws,"02-处理结果")+sep,
      CHK:join(ws,"04-校验报告")+sep,
      TPL:join(ws,"03-报表模板")+sep,
      CON:join(ws,"合同审阅")+sep
    };
  }
  function optOn(id, def){
    var saved = store.get("opts", {});
    return (id in saved) ? !!saved[id] : !!def;
  }
  function setOpt(id, v){
    var saved = store.get("opts", {});
    saved[id] = !!v; store.set("opts", saved); render();
  }
  function renderPrompt(){
    var P = pathSet(($("#ws").value || DEFAULT_WS).trim().replace(/[\\/]+$/,"") || DEFAULT_WS);
    var text = T.prompt.tpl;
    text = text.replace("<<PLAN>>", optOn("plan", true) ? PLAN_LINE : "<<DEL>>");
    (T.prompt.options||[]).forEach(function(o){
      text = text.replace("<<OPT:"+o.id+">>", optOn(o.id,o.def) ? o.line : "<<DEL>>");
    });
    text = text.replace(/\{(WS|SEP|IN[1-6]|OUT|CHK|TPL|CON)\}/g, function(_,k){ return P[k]; });
    return text.split("\n").filter(function(l){ return l !== "<<DEL>>"; }).join("\n");
  }
  function render(){
    $("#prompt").textContent = renderPrompt();
  }

  /* 复制 */
  function flash(txt, ok){
    var b = $("#copy"), old = b.getAttribute("data-label") || b.textContent;
    b.setAttribute("data-label", old);
    b.textContent = txt; b.classList.toggle("ok", !!ok);
    setTimeout(function(){ b.textContent = old; b.classList.remove("ok"); }, 1800);
  }
  function copyPrompt(){
    var text = renderPrompt();
    var done = function(){ flash("✓ 已复制", true); };
    var fallback = function(){
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly","");
      ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand("copy"); done(); }
      catch(e){ flash("复制失败，请手动选中", false); }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  }

  /* 选项 & 路径 */
  function buildOpts(){
    var box = $("#opts");
    var list = [{id:"plan", label:"保留「先给计划再执行」的 Plan 指令", tag:"推荐", def:true}]
      .concat(T.prompt.options || []);
    box.innerHTML = list.map(function(o){
      var on = optOn(o.id, o.def);
      return '<label class="opt"><input type="checkbox" data-oid="'+o.id+'"'+(on?' checked':'')+'>'
        + '<span class="opt-txt">'+esc(o.label)+(o.tag?'<span class="opt-tag">'+esc(o.tag)+'</span>':'')+'</span></label>';
    }).join("");
    box.querySelectorAll("input[data-oid]").forEach(function(cb){
      cb.addEventListener("change", function(){ setOpt(cb.getAttribute("data-oid"), cb.checked); });
    });
  }

  /* 清单 */
  function buildChecklist(){
    var ul = $("#checklist"), saved = store.get("chk", {});
    ul.innerHTML = (T.checklist||[]).map(function(c,i){
      var on = !!saved[i];
      return '<li'+(on?' class="done"':'')+'><input type="checkbox" data-ci="'+i+'"'+(on?' checked':'')+'>'
        + '<span>'+esc(c)+'</span></li>';
    }).join("");
    ul.querySelectorAll("input[data-ci]").forEach(function(cb){
      cb.addEventListener("change", function(){
        var s = store.get("chk", {});
        s[cb.getAttribute("data-ci")] = cb.checked; store.set("chk", s);
        cb.closest("li").classList.toggle("done", cb.checked);
        updateProg();
      });
    });
    updateProg();
  }
  function updateProg(){
    var boxes = document.querySelectorAll("#checklist input");
    var n = 0; boxes.forEach(function(b){ if(b.checked) n++; });
    $("#prog").textContent = n + " / " + boxes.length;
  }

  document.addEventListener("DOMContentLoaded", function(){
    $("#ws").value = store.get("ws", DEFAULT_WS);
    $("#ws").addEventListener("input", function(){ store.set("ws", $("#ws").value); render(); });
    buildOpts(); buildChecklist(); render();
    $("#copy").addEventListener("click", copyPrompt);
  });
})();
