/* ============================================================
   预测式营销 · 跟练台  —  交互逻辑
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 1900);
  }

  /* ---------- clipboard ---------- */
  async function copy(text, label) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;top:0;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast("已复制" + (label ? "：" + label : "") + "　去 AI 对话框按 Ctrl+V");
      return true;
    } catch (e) {
      toast("复制失败，请手动选中复制");
      return false;
    }
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    toast("已开始下载：" + filename);
  }

  /* ---------- tiny markdown ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function md(src) {
    const lines = src.split(/\r?\n/);
    const out = [];
    let i = 0;
    let para = [];
    const flush = () => {
      if (para.length) {
        out.push("<p>" + inline(para.join(" ")) + "</p>");
        para = [];
      }
    };
    while (i < lines.length) {
      const raw = lines[i];
      const line = raw.trim();

      if (!line) { flush(); i++; continue; }

      if (/^---+\s*$/.test(line)) { flush(); out.push("<hr>"); i++; continue; }

      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        flush();
        const lv = Math.min(h[1].length, 3);
        out.push("<h" + lv + ">" + inline(h[2]) + "</h" + lv + ">");
        i++; continue;
      }

      if (/^>\s?/.test(line)) {
        flush();
        const bq = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
          bq.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        out.push("<blockquote>" + bq.map(x => inline(x)).join("<br>") + "</blockquote>");
        continue;
      }

      if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1].trim())) {
        flush();
        const cells = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
        const head = cells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i].trim())) {
          rows.push(cells(lines[i].trim()));
          i++;
        }
        let t = "<table><thead><tr>" + head.map(c => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>";
        rows.forEach(r => {
          t += "<tr>" + r.map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>";
        });
        t += "</tbody></table>";
        out.push(t);
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        flush();
        const li = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          li.push("<li>" + inline(lines[i].trim().replace(/^[-*]\s+/, "")) + "</li>");
          i++;
        }
        out.push("<ul>" + li.join("") + "</ul>");
        continue;
      }

      para.push(line);
      i++;
    }
    flush();
    return out.join("\n");
  }

  /* ---------- progress ---------- */
  const PKEY = "psl-progress-v1";
  let doneSet = new Set();
  try { doneSet = new Set(JSON.parse(localStorage.getItem(PKEY) || "[]")); } catch (e) {}
  function saveDone() {
    try { localStorage.setItem(PKEY, JSON.stringify(Array.from(doneSet))); } catch (e) {}
    const n = doneSet.size, total = EXERCISES.length;
    const pct = Math.round((n / total) * 100);
    const bar = $("#pbar");
    if (bar) bar.style.width = pct + "%";
  }

  /* ---------- render exercises ---------- */
  const exWrap = $("#exlist");
  const modBar = $("#modbar");
  const modAside = $("#modaside");
  let activeMod = 0;

  const modCount = mid => EXERCISES.filter(e => mid === 0 || e.module === mid).length;

  function renderModBar() {
    const total = modCount(0);

    /* 桌面：左侧栏竖排模块索引 */
    if (modAside) {
      const items = ['<button class="mod-item on" data-m="0"><span class="n">—</span><span class="nm">全部</span><span class="ct">' + total + "</span></button>"];
      MODULES.forEach(m => {
        items.push(
          '<button class="mod-item" data-m="' + m.id + '">' +
            '<span class="n">' + m.no + "</span>" +
            '<span class="nm">' + esc(m.name) + "</span>" +
            '<span class="ct">' + modCount(m.id) + "</span>" +
          "</button>"
        );
      });
      modAside.innerHTML = items.join("");
    }

    /* 窄屏：侧栏隐藏，练习区顶部保留胶囊条 */
    if (modBar) {
      const btns = ['<button class="mod-pill on" data-m="0">全部 ' + total + " 练</button>"];
      MODULES.forEach(m => {
        btns.push('<button class="mod-pill" data-m="' + m.id + '">模块' + m.no + " · " + m.name + "</button>");
      });
      modBar.innerHTML = btns.join("");
    }
  }

  /* 模块筛选：侧栏索引与窄屏胶囊共用同一状态 */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-m]");
    if (!b) return;
    activeMod = +b.dataset.m;
    $$("[data-m]").forEach(x => x.classList.toggle("on", +x.dataset.m === activeMod));
    renderExercises();
    const d = $("#drills");
    if (d) {
      const top = d.getBoundingClientRect().top;
      if (top < 0 || top > 140) d.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  function renderExercises() {
    if (!exWrap) return;
    const list = EXERCISES.filter(e => activeMod === 0 || e.module === activeMod);
    exWrap.innerHTML = list.map(e => {
      const isDone = doneSet.has(e.id);
      const kit = (typeof STARTKIT !== "undefined" ? STARTKIT.find(k => k.ex === e.id) : null);
      const kitBlk = kit ? `
        <div class="prompt kit">
          <div class="prompt-h">
            <span class="nm">开局消息 · 已配 ${esc(kit.who)}</span>
            <button class="copy strong" data-copy="k-${e.id}">复制整条</button>
            <button class="copy" data-max="k-${e.id}">展开</button>
          </div>
          <p class="kit-note">${esc(kit.reason)}</p>
          <pre id="k-${e.id}">${esc(kit.kit)}</pre>
        </div>` : "";
      const proms = e.prompts.map((p, pi) => `
        <div class="prompt">
          <div class="prompt-h">
            <span class="nm">${esc(p.name)}</span>
            <button class="copy" data-copy="p-${e.id}-${pi}">复制</button>
            <button class="copy" data-max="${e.id}-${pi}">展开</button>
          </div>
          <pre id="p-${e.id}-${pi}">${esc(p.text)}</pre>
        </div>`).join("");

      return `
      <article class="ex ${isDone ? "done" : ""}" data-ex="${e.id}" id="ex${e.id}">
        <div class="ex-head">
          <div class="ex-no">${e.id === 0 ? "0" : e.id}</div>
          <div class="ex-tt">
            <h4>练习 ${e.id} · ${esc(e.title)}
              <span class="pill">${esc(e.tag)}</span>
              <span class="pill grey">${esc(e.minutes)}</span>
            </h4>
            <p>${esc(e.q)}</p>
          </div>
          <span class="ex-chev">▾</span>
        </div>
        <div class="ex-body">
          <dl class="kv lead">
            <dt>一线痛点</dt><dd>${esc(e.pain)}</dd>
            <dt>要准备</dt><dd>${esc(e.input)}</dd>
          </dl>
          ${kitBlk}
          ${kit ? '<p class="mini-h raw-h">提示词原文 · 换成你自己的客户时用</p>' : ""}
          ${proms}
          <div class="cols2">
            <div>
              <p class="mini-h">好结果的样子</p>
              <ul class="tick">${e.good.map(g => "<li>" + esc(g) + "</li>").join("")}</ul>
            </div>
            <div>
              <p class="mini-h">把关点（AI 替不了你）</p>
              <ul class="warn">${e.guard.map(g => "<li>" + esc(g) + "</li>").join("")}</ul>
            </div>
          </div>
          <div class="done-row">
            <label><input type="checkbox" data-done="${e.id}" ${isDone ? "checked" : ""}> 标记完成</label>
            <span style="margin-left:auto">练习 ${e.id} / 10</span>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- exercise interactions (delegated) ---------- */
  document.addEventListener("click", e => {
    /* copy */
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      const pre = document.getElementById(cp.dataset.copy);
      if (pre) {
        copy(pre.textContent, cp.dataset.copy.startsWith("k-") ? "开局消息" : "提示词");
        const old = cp.textContent;
        cp.textContent = "已复制";
        cp.classList.add("ok");
        setTimeout(() => { cp.textContent = old; cp.classList.remove("ok"); }, 1600);
      }
      return;
    }
    /* expand prompt */
    const mx = e.target.closest("[data-max]");
    if (mx) {
      const box = mx.closest(".prompt");
      box.classList.toggle("max");
      mx.textContent = box.classList.contains("max") ? "收起" : "展开";
      return;
    }
    /* copy customer transcript / download */
    const cc = e.target.closest("[data-ccopy]");
    if (cc) {
      const c = CUSTOMERS[+cc.dataset.ccopy];
      if (c) copy(transcriptOf(c.body), c.id + " 录音转写");
      return;
    }
    const cd = e.target.closest("[data-cdl]");
    if (cd) { toast("正在下载：" + cd.dataset.cdl); return; }

    /* accordion */
    const head = e.target.closest(".ex-head");
    if (head) {
      const art = head.parentElement;
      art.classList.toggle("open");
      return;
    }
  });

  document.addEventListener("change", e => {
    const cb = e.target.closest("[data-done]");
    if (!cb) return;
    const id = +cb.dataset.done;
    if (cb.checked) doneSet.add(id); else doneSet.delete(id);
    saveDone();
    cb.closest(".ex").classList.toggle("done", cb.checked);
  });

  /* ---------- render customers ---------- */
  const HOOKS = {
    C01: "理赔刚结案、儿子 20 天后结婚、背着 80 万经营贷——需求不是保险，是现金流。",
    C02: "孕 21 周、家庭唯一现金来源、被一句「孩子上小学就晚了」击中。",
    C03: "三次打开计划书没回。用 IRR 说话，真实卡点却是「明年要换学区房」。",
    C04: "理赔等了 18 天，续期 9 天后到期，明确说「我这次是真想退了」。",
    C05: "离职团险失效、新公司 1 月才转正，中间三个月毫无保障，他自己不知道。",
    C06: "被「保证收益」伤过，开场第一句就是「你们这个是不是又是骗人的」。",
    C07: "甲状腺结节 TI-RADS 3 类，方案讲完了，卡在「到底能不能保」。",
    C08: "两次说「回去和爱人商量」，其实未婚——这是一句礼貌性拒绝。"
  };

  function transcriptOf(body) {
    const i = body.indexOf("## 二、");
    if (i < 0) return body;
    const j = body.indexOf("\n## ", i + 3);
    return (j < 0 ? body.slice(i) : body.slice(i, j)).trim();
  }

  function renderCustomers() {
    const box = $("#custlist");
    if (!box || typeof CUSTOMERS === "undefined") return;
    box.innerHTML = CUSTOMERS.map((c, idx) => {
      const short = c.title.replace(/^C\d+\s*·\s*/, "");
      return `
      <article class="cust">
        <div class="top">
          <span class="cid">${c.id}</span>
          <div>
            <h4>${esc(short)}</h4>
            <p class="meta">约 10 分钟录音 · 已脱敏 · 虚构示例</p>
          </div>
        </div>
        <p class="hook">${esc(HOOKS[c.id] || "")}</p>
        <div class="acts">
          <button class="copy" data-ccopy="${idx}">复制录音转写</button>
          <a class="copy" href="data/${encodeURIComponent(c.file)}" download>下载 .md</a>
          <a class="copy" href="data/${encodeURIComponent(c.file)}" target="_blank" rel="noopener">原件</a>
        </div>
        <details>
          <summary>展开全文（含参考答案）</summary>
          <div class="md">${md(c.body)}</div>
        </details>
      </article>`;
    }).join("");
  }

  /* ---------- downloads ---------- */
  const DLS = [
    { t: "AGENTS.md 身份文件初稿", s: "六节骨架 + 合规红线 + 快捷指令，改【】即可用", href: "AGENTS.md", ic: "▤" },
    { t: "8 位客户数据集（合集）", s: "约 3.7 万字 · 8 份 10 分钟录音转写 + 参考答案", href: "data/全部客户数据集.md", ic: "▦" },
    { t: "11 条开局消息（客户已配好）", s: "提示词 + 客户素材合成一条 · 复制即练", href: "prompts/11条开局消息.md", ic: "▶" },
    { t: "11 个练习提示词（合集）", s: "按五段配方写成 · 可整段复制", href: "prompts/全部提示词合集.md", ic: "◆" },
    { t: "客群名单（12 人 CSV）", s: "练习 4 意向打分用 · 可直接导入表格", href: "data/客群名单.csv", ic: "▩" }
  ];

  function renderDls() {
    const box = $("#dllist");
    if (!box) return;
    box.innerHTML = DLS.map(d => `
      <a class="dl" href="${encodeURI(d.href)}" download>
        <span class="ic">${d.ic}</span>
        <span class="tx"><b>${esc(d.t)}</b><span>${esc(d.s)}</span></span>
        <span class="arw">↓</span>
      </a>`).join("");
  }

  /* ---------- AGENTS.md generator ---------- */
  const AG_DEF = {
    agCust: "【例如：35—55 岁、家庭年收入 20—60 万、有房贷有孩子的城市中产】",
    agCap: "【例如：8 位】",
    agTone: "【例如：先给结论再给理由；微信话术不超过 60 字】",
    agRole: "【例如：银行网点理财经理】",
    agProd: "【例如：重疾险 + 定期寿险 + 年金险 + 百万医疗】",
    agGoal: "【例如：开门红首月新单保费 12 万】"
  };

  function buildAgents() {
    const v = k => {
      const el = document.getElementById(k);
      const val = el ? el.value.trim() : "";
      return val || AG_DEF[k];
    };
    return `# AGENTS.md · 我的身份文件（预测式营销底座）

> 用法：把本文件放在你的 AI 工作空间根目录，或在新对话第一条整段粘贴。
> 凡是【】里的内容，替换成你自己的情况。改完删掉本行和上面的说明。

---

## 1. 你是谁

你是我的**专属销售助理**，帮我做预测式营销。

你的工作不是陪我聊天，是替我完成"看线索 → 推演 → 写依据 → 定行动"这四步，让我在打电话之前就知道：先打谁、说什么、何时开口、谁会走、能成多少。

你的判断是**假设**，不是结论。每条判断后面必须写"依据"，依据只能来自我给你的材料。

---

## 2. 我是谁

- **我的岗位**：${v("agRole")}
- **我所在机构**：【待补充：机构名称】
- **我的业务线**：【待补充：银保 / 个险 / 养老险 / 产险 / 综合】
- **我主推的产品**：${v("agProd")}
- **我的主要客户**：${v("agCust")}
- **我服务的区域**：【待补充：网点或片区】
- **我每天能联系的客户数**：${v("agCap")}
- **我每周能约到的面谈数**：【待补充：例如 3 位】
- **我正在冲的目标**：${v("agGoal")}
- **我的说话习惯**：【待补充：客户怎么称呼我，我怎么称呼客户】

---

## 3. 怎么跟我说话

1. **先给结论，再给理由。** 我要的是能立刻用的东西，不是分析过程。
2. **微信话术不超过 60 字。** 超过 60 字的，客户不会读。
3. **每条判断后面标「依据」。** 格式：\`依据：客户原话"……"\` 或 \`依据：名单字段"近30天互动3次"\`。
4. **不确定就写「待补充」。** 不要用"一般来说""通常情况下"填空。
5. **给选项，不给答案。** 涉及取舍的地方（比如先做哪个产品），给 2—3 个方案和各自的代价，让我选。
6. **表格优先。** 名单类、对比类、排序类内容，一律用表格输出，不要写成段落。
7. **中文回答，不夹英文。** 专业词保留原文（如 IRR、TI-RADS），但不要中英混排。
8. **${v("agTone")}**

---

## 4. 合规红线（不可越过）

1. **只用我提供的信息。** 不许编造客户的年龄、职业、家庭、收入、体检结果。缺什么就写"待补充"，并告诉我该问什么。
2. **不做承诺性表述。** "保证""一定赔""稳赚""最高收益""肯定没问题"这类词，一个都不许出现。
3. **金额、比例、条款原文一律留空。** 用【】占位，由我按公司系统或合同填真实数字。你不许自己算一个数字填进去。
4. **涉及健康告知，不许替客户下结论。** 只能说"要看核保结果"，不能说"这个能保"或"这个不能保"。
5. **发现敏感信息，立即提醒我。** 身份证号、银行卡号、完整手机号、病历原文、家庭住址——一旦出现，先提醒我脱敏，再继续。
6. **收益演示必须标"非保证"。** 提到任何演示利益，后面加一句"演示部分不保证，以合同为准"。
7. **不评价同业、不比较具体公司产品。** 只讲我们自己的条款逻辑。
8. **话术最终要人工复核。** 你给的话术是初稿，我发出去之前会按公司口径再核一遍。

---

## 5. 快捷指令

| 指令 | 你做什么 |
|---|---|
| \`画像\` + 一位客户信息 | 一句话画像、家庭与现金流判断、3 个没说出口的担忧、3 个可切入话题、2 句微信开场白、3 个该补问的问题 |
| \`时机\` + 客户备注 | 本周该联系名单、每人命中的信号类型、引用原话的开场白、紧急度排序 |
| \`朋友圈\` + 客群描述 | 本周客群最关心的 5 件事（各附理由）+ 周一到周日 7 条（配图建议、正文 80—150 字、发布时间、预计互动人群） |
| \`打分\` + 客群名单 | 需求 40% + 温度 35% + 触达 25% 的综合分、A/B/C 分层、今日攻坚顺序、每人一句话理由 |
| \`异议\` + 客户原话 | 五个异议、每个背后真正在意什么、共情版 / 数据版 / 提问版三版回应、一句"不建议说的话" |
| \`跟进\` + 一件事 + 客户列表 | 一客一文，同一件事对不同人写不同版本，每条 60—100 字，【】留给我的真实细节 |
| \`预警\` + 互动记录 | 流失风险分（1—10）、命中的信号类型、先做什么再说什么的挽回顺序、挽回话术 |
| \`业绩\` + 目标 + 商机清单 | 加权金额、最可能完成额、与目标差距、追赶方案（谁、做什么、哪天前） |
| \`复盘\` + 聊天记录 | 成交概率区间、加分信号、减分信号、一句"要改的话"及改写版 |
| \`周一名单\` | 本周该打的 10 个人，按顺序，每人一句开场白 |
| \`本周客群\` | 触发全套（画像 → 时机 → 朋友圈 → 打分 → 异议 → 跟进 → 预警 → 业绩 → 复盘），缺输入标"待补充" |

---

## 6. 开工确认

第一次对话时，回复以下内容，然后开始干活：

> **身份文件已读取。**
> 我是你的${v("agRole")}助理，主推${v("agProd")}。
> 你的主要客户是${v("agCust")}，每天能联系${v("agCap")}，当前目标是${v("agGoal")}。
> 我会遵守三条最硬的红线：
> ① 只用你给的信息，缺的标"待补充"，不编造；
> ② 不做承诺性表述，金额和条款留【】；
> ③ 涉及健康告知，我只说"看核保结果"，不替你下结论。
> 现在告诉我，今天想先做哪一件？

---

## 附：判断的写法（示例）

**❌ 不合格的写法**
> 这位客户风险意识较强，建议尽快跟进重疾险加保。

**✅ 合格的写法**
> **判断：** 这位客户真正的卡点是现金流，不是需求。
> **依据：** 客户原话"今年钱是真紧，车间那边还压着八十万的贷款"；名单字段"近30天互动2次"。
> **行动：** 周四面谈带现金流表，先给"最省的方案"，不谈加保。
> **待补充：** 客户现有保单的年缴保费、是否有其他贷款。

---

*本文件每次更新后，请在下一次对话里重新粘贴一次，或在 AI 的"设置/记忆"里替换旧版本。*
`;
  }

  let agText = "";
  function initAgents() {
    const gen = $("#agGen"), out = $("#agOut");
    if (!gen) return;
    const run = () => {
      agText = buildAgents();
      out.textContent = agText;
      out.classList.add("max");
      toast("已生成，检查【】占位后复制");
    };
    gen.addEventListener("click", run);
    $("#agCopy").addEventListener("click", () => {
      if (!agText) run();
      copy(agText, "AGENTS.md");
    });
    $("#agDl").addEventListener("click", () => {
      if (!agText) run();
      download("AGENTS.md", agText);
    });
    run();
  }

  /* ---------- score calculator ---------- */
  const TIERS = s => (s >= 7.5 ? "A" : s >= 5 ? "B" : "C");

  function initScore() {
    const tbl = $("#scoreTbl");
    if (!tbl || typeof ROSTER === "undefined") return;
    const tb = $("tbody", tbl);

    const rows = ROSTER.map((r, i) => `
      <tr data-i="${i}">
        <td><b>${esc(r["编号"])}</b></td>
        <td><input type="number" min="1" max="10" step="0.5" data-k="d" data-i="${i}"></td>
        <td><input type="number" min="1" max="10" step="0.5" data-k="t" data-i="${i}"></td>
        <td><input type="number" min="1" max="10" step="0.5" data-k="c" data-i="${i}"></td>
        <td class="num" data-out="s-${i}">—</td>
        <td data-out="g-${i}">—</td>
        <td style="color:var(--ink-3); font-size:12px; max-width:280px;">${esc(r["关键备注"])}</td>
      </tr>`).join("");
    tb.innerHTML = rows;

    function recalc() {
      let aCount = 0, scored = 0, best = null;
      ROSTER.forEach((r, i) => {
        const d = parseFloat($('input[data-k="d"][data-i="' + i + '"]', tb).value);
        const t = parseFloat($('input[data-k="t"][data-i="' + i + '"]', tb).value);
        const c = parseFloat($('input[data-k="c"][data-i="' + i + '"]', tb).value);
        const sCell = $('[data-out="s-' + i + '"]', tb);
        const gCell = $('[data-out="g-' + i + '"]', tb);
        if (isNaN(d) || isNaN(t) || isNaN(c)) {
          sCell.textContent = "—"; gCell.innerHTML = "—"; return;
        }
        const s = d * 0.4 + t * 0.35 + c * 0.25;
        const g = TIERS(s);
        scored++;
        if (g === "A") aCount++;
        sCell.textContent = s.toFixed(1);
        gCell.innerHTML = '<span class="tier ' + g + '">' + g + "</span>";
        if (!best || s > best.s) best = { id: r["编号"], s: s };
      });
      $("#aCount").textContent = aCount;
      $("#topPick").textContent = best ? best.id + "（" + best.s.toFixed(1) + "）" : "—";
      const hint = $("#aHint");
      if (!scored) { hint.textContent = "尚未打分"; hint.className = "v"; }
      else if (aCount > scored * 0.3) {
        hint.textContent = "A 层偏多，标准可能太松";
        hint.className = "v warn";
      } else {
        hint.textContent = "分层合理";
        hint.className = "v good";
      }
    }

    tbl.addEventListener("input", recalc);

    $("#loadRoster").addEventListener("click", () => {
      const demo = [8, 9, 7], demoMap = {
        C01: [7, 7, 8], C02: [9, 9, 8], C03: [7, 6, 7], C04: [6, 8, 9],
        C05: [9, 6, 9], C06: [7, 7, 6], C07: [8, 9, 9], C08: [7, 4, 9],
        C09: [6, 2, 5], C10: [5, 2, 6], C11: [8, 8, 7], C12: [7, 5, 6]
      };
      ROSTER.forEach((r, i) => {
        const v = demoMap[r["编号"]] || demo;
        ["d", "t", "c"].forEach((k, j) => {
          $('input[data-k="' + k + '"][data-i="' + i + '"]', tb).value = v[j];
        });
      });
      recalc();
      toast("示例分已载入——试试改一个数，看排序怎么变");
    });

    $("#clearScore").addEventListener("click", () => {
      $$("#scoreTbl input").forEach(i => (i.value = ""));
      recalc();
    });
  }

  /* ---------- performance calculator ---------- */
  const STAGES = [
    ["初次接触", 0.10],
    ["需求确认", 0.30],
    ["方案已讲·观望", 0.35],
    ["方案讲解", 0.50],
    ["异议处理", 0.65],
    ["待签单", 0.80]
  ];

  function initPerf() {
    const tbl = $("#perfTbl");
    if (!tbl) return;
    const tb = $("tbody", tbl);

    function addRow(name, amt, stage) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="opp-name" style="min-width:110px;" value="${name || ""}" placeholder="客户"></td>
        <td><input type="number" class="opp-amt" style="width:110px; text-align:right;" value="${amt || ""}" placeholder="0"></td>
        <td><select class="opp-stage" style="min-width:104px;">
          ${STAGES.map((s, i) => `<option value="${s[1]}" ${stage === s[1] ? "selected" : ""}>${s[0]} ${Math.round(s[1] * 100)}%</option>`).join("")}
        </select></td>
        <td class="num opp-w">0</td>
        <td><button class="copy opp-del">删</button></td>`;
      tb.appendChild(tr);
    }

    function recalc() {
      let pipe = 0;
      $$("tr", tb).forEach(tr => {
        const amt = parseFloat($(".opp-amt", tr).value) || 0;
        const rate = parseFloat($(".opp-stage", tr).value) || 0;
        const w = amt * rate;
        $(".opp-w", tr).textContent = w.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
        pipe += w;
      });
      const goal = parseFloat($("#perfGoal").value) || 0;
      const done = parseFloat($("#perfDone").value) || 0;
      const days = Math.max(parseFloat($("#perfDays").value) || 1, 1);
      const probable = done + pipe;
      const gap = goal - probable;

      const fmt = n => n.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
      $("#pipeW").textContent = fmt(pipe);
      $("#probable").textContent = fmt(probable);
      const gEl = $("#gap");
      gEl.textContent = (gap > 0 ? "差 " : "超 ") + fmt(Math.abs(gap));
      gEl.className = "v " + (gap > 0 ? "warn" : "good");
      $("#perDay").textContent = gap > 0 ? fmt(gap / days) : "已达成";
    }

    addRow("D01 张姐", 30000, 0.65);
    addRow("D02 刘总", 50000, 0.35);
    addRow("D03 陈先生", 30000, 0.65);
    addRow("D04 孙女士", 15000, 0.10);
    addRow("D06 王工", 24000, 0.50);

    tbl.addEventListener("input", recalc);
    tbl.addEventListener("change", recalc);
    tbl.addEventListener("click", e => {
      if (e.target.classList.contains("opp-del")) {
        e.target.closest("tr").remove();
        recalc();
      }
    });
    $("#addOpp").addEventListener("click", () => addRow("", "", 0.30));
    ["perfGoal", "perfDone", "perfDays"].forEach(id => $("#" + id).addEventListener("input", recalc));
    recalc();
  }

  /* ---------- scrollspy ---------- */
  function initSpy() {
    const links = $$("#toc a");
    if (!links.length) return;
    const secs = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-84px 0px -64% 0px", threshold: 0 });
    secs.forEach(s => obs.observe(s));
  }

  /* ---------- boot ---------- */
  renderModBar();
  renderExercises();
  renderCustomers();
  renderDls();
  initAgents();
  initScore();
  initPerf();
  initSpy();
  saveDone();

  /* open exercise 0 by default */
  const first = $("#ex0");
  if (first) first.classList.add("open");
})();
