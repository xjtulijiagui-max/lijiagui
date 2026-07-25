const skills = [
  ['S01', '支付行业友商情报检索与竞争简报', '检索公开信息，形成可追溯的友商卡片、对比矩阵与机会判断。', '市场、产品、战略、销售管理', '进阶', '35 分钟', '你是支付行业竞争情报分析师。围绕【调研对象】检索公开信息，截止日期为【日期】。比较产品定位、目标客户、核心能力、渠道生态、AI应用、近期动作和风险。关键事实注明来源与时间；无法确认的标记“待验证”。输出管理摘要、友商卡片、对比矩阵、SWOT、三个机会假设和一线验证问题。'],
  ['S02', '商户入网资料清单审核与风险提示', '辅助完成资料完整性、一致性、有效期和基础风险检查。', '商户运营、销售支持、合规、审核', '入门', '30 分钟', '你是商户入网预审助手。依据【审核规则】和【商户资料】，完成完整性、字段一致性、有效期和基础风险检查。不得给出最终准入决定。输出审核摘要、逐项检查表、问题分级、补件清单、补件通知和人工复核事项。'],
  ['S03', '交易经营数据分析与异常洞察', '完成数据质量检查、指标计算、趋势分析、异常识别和行动建议。', '经营分析、财务、产品、运营、管理层', '入门', '40 分钟', '你是支付公司经营分析师。分析附件数据，先检查数据质量和口径，再计算交易额、笔数、客单价、活跃商户、退款率和费率收入，按【区域/渠道/商户类型】比较。输出管理摘要、关键指标、趋势与异常、原因假设、三项行动建议和图表建议。', 'S03_交易经营数据分析.csv'],
  ['S04', '差异账智能归因与处置建议', '结合规则和历史案例，对差异分类、归集证据并分流责任。', '清结算、财务、运营、技术支持', '进阶', '40 分钟', '你是清结算差异分析助手。依据【差异账明细】【规则】【历史案例】，逐笔判断差异类型，列出证据、置信度、缺失信息和处置路径。不得自动调账或关闭差异。最后统计高频根因并给出规则、流程、系统改进建议。', 'S04_差异账智能归因.csv'],
  ['S05', '协议规则解析与分润返佣校验', '将自然语言协议转成结构化规则并复算交易明细。', '渠道、财务、法务、产品运营', '进阶', '45 分钟', '你是协议规则数字化助手。从【协议文本】提取主体、范围、生效时间、费率、阶梯、封顶、返佣条件、结算周期、例外和优先级，形成规则表；再校验【计算明细】，逐条说明复算过程、差异和待确认项。每条规则引用原文，不得补造条款。', 'S05_协议规则分润校验.csv'],
  ['S06', '客户画像、分群与营销机会识别', '基于合规可用特征进行可解释分群，生成下一最佳行动。', '销售、市场、客户运营、产品', '进阶', '40 分钟', '你是支付行业客户运营分析师。基于脱敏数据，围绕【增长/留存/交叉销售】建立画像维度并形成可解释分群。输出分群规则、各群特征、需求、机会与风险、下一最佳行动、客户经理任务和效果指标。不得使用未授权敏感属性。', 'S06_客户画像分群.csv'],
  ['S07', '售后工单分析与智能应答', '对工单分类、定级、生成回复草稿和升级建议，并发现知识缺口。', '客服、售后、运营、产品支持', '入门', '35 分钟', '你是支付业务售后工单助手。依据【工单】【知识库】【SLA】，识别诉求、类型、紧急程度和情绪，给出处理步骤、回复草稿和升级建议。不得承诺未确认事项。最后汇总高频问题、根因假设和知识库补充建议。', 'S07_售后工单分析.csv'],
  ['S08', '服务商知识库与培训问答助手', '把制度与 SOP 转为 FAQ、机器人知识、微课和测验题。', '渠道运营、培训、客服、服务商管理', '入门', '35 分钟', '你是服务商培训与知识库助手。将附件整理为分主题知识目录、20条FAQ及标准答案、30分钟培训提纲、10道情景测验题及答案、版本冲突和知识缺口清单。每个答案标注材料章节；无法确认时建议转人工。'],
  ['S09', '客服沟通质检、情绪与禁语提醒', '依据明确规则对脱敏会话做辅助质检并生成替代表达。', '客服运营、质检、培训、合规', '进阶', '35 分钟', '你是客服质检辅助员。依据【服务标准】【禁语清单】【评分规则】分析脱敏会话。每项问题引用证据并对应规则，输出评分、情绪变化、禁语或合规风险、流程遗漏、替代表达和辅导建议。不得进行人格评价，争议项标为人工复核。'],
  ['S10', '项目进度催办与风险预警', '识别逾期、依赖和质量风险，生成分级催办与管理周报。', '项目经理、产品经理、部门负责人', '入门', '35 分钟', '你是项目管理助手。分析【项目任务表】，识别逾期、临期、无更新、依赖阻塞、返工和质量风险，并按影响×紧急程度分级。输出项目摘要、风险清单、关键依赖、催办草稿、升级建议和下周跟踪计划。不得建议未经确认的自动发送。'],
  ['S11', 'OA流程设计与审批材料生成', '把口头需求转成节点、表单、权限、例外和验收方案。', '运营、人力、财务、行政、流程管理', '入门', '35 分钟', '你是企业流程设计师。将【业务需求】转为可配置OA流程。输出流程目标、角色、节点、输入输出、条件分支、表单字段、权限、退回/撤回/加签/超时规则、审计要求、测试用例和验收清单，并检查分支冲突、死循环和权限过宽。'],
  ['S12', '合同函件审查与法律报告初稿', '辅助识别合同风险、生成修改建议、函件与法律研究初稿。', '法务、采购、业务管理', '进阶', '45 分钟', '你是企业法务辅助助手。依据【合同文本】【公司立场】【审查规则】逐条输出原文、风险类型、理由、严重度、修改建议和替代文本；形成法律报告或函件初稿，并列出需律师复核事项。不得虚构法规或案例，本输出不构成正式法律意见。'],
  ['S13', '税务政策解读与税务风险提示', '把政策原文转成适用条件、业务影响、检查表与复核问题。', '财务、税务、经营管理', '进阶', '40 分钟', '你是企业税务政策解读助手。依据【权威政策原文】和【业务背景】提取发布机关、文号、生效时间、适用主体、计税规则、优惠、申报和凭证要求，并映射业务流程。输出政策摘要、适用性、业务影响、风险检查表、资料清单和需专业复核的问题。本输出不构成税务意见。'],
  ['S14', '行业方案PPT与汇报材料生成', '把零散材料转成结论型标题、逐页内容、图表建议和讲解口径。', '全员、产品、市场、管理层', '入门', '35 分钟', '你是管理咨询式PPT顾问。将【原始材料】整理成面向【汇报对象】的【页数】页PPT。逐页输出结论型标题、核心内容、建议图表、讲解要点和数据来源。要求一页一事、逻辑闭环、不得编造数据，并列出待补材料。'],
  ['S15', '会议纪要、行动项与提醒计划', '将会议原始记录转成决定、行动项、责任人、截止时间和提醒。', '全员、项目管理、部门负责人', '入门', '25 分钟', '你是会议纪要与行动管理助手。将【会议原始记录】整理为会议摘要、关键决定、主要讨论、行动项（事项/责任人/截止时间/交付标准/依赖）、待确认问题、风险和跟进提醒。不得把讨论意见当成决定，缺失信息标记待确认。'],
  ['S16', '质量体系、产研流程与测试效率优化', '对缺陷与流程数据分类、逃逸分析、回归设计和改进。', '产品、研发、测试、质量管理', '进阶', '45 分钟', '你是支付产品质量分析助手。分析【缺陷清单】【版本信息】【质量规则】，按模块、严重度、发现阶段、根因和是否逃逸分类。输出高频问题、关键风险、根因假设、回归测试重点、流程控制点和改进计划。区分现象与根因，不把相关性当因果。'],
  ['S17', '个人AI工作台搭建与Skill调用路由', '将岗位任务、知识、工具、记忆、安全边界和 Skill 路由组合为个人 AI 助手。', '全体学员、业务骨干、管理者', '高级', '50 分钟', '你是企业AI助理架构师。根据【岗位职责】【高频任务】【Skill清单】【知识与工具权限】设计个人AI工作台。输出任务地图、AI助理角色与系统提示词、Skill路由规则、必需追问、知识/工具/记忆配置、安全边界、人工审批点、10条测试用例和评分表。高风险任务必须人工确认。'],
];

const categories = [
  ['all', '全部 Skill'], ['entry', '入门'], ['advanced', '进阶'], ['management', '管理与工作台'],
];
const state = { active: 'all' };
const nav = document.querySelector('#nav-list');
const grid = document.querySelector('#skill-grid');
const count = document.querySelector('#skill-count');
const toast = document.querySelector('#toast');
const workflowPrompts = {
  discovery: '{{银盛支付商户入网审核流程}}，请搜索并补充完整，输出为 Mermaid 流程图。',
  redesign: '分析以上流程中哪些环节可以引入AI，并运用SCAMPER方法重新设计流程，输出一张新的Mermaid流程图；其中，AI介入节点请使用另一种颜色标注。',
};

const inCategory = (skill, category) => category === 'all'
  || (category === 'entry' && skill[4] === '入门')
  || (category === 'advanced' && skill[4] === '进阶')
  || (category === 'management' && ['S10', 'S11', 'S14', 'S15', 'S17'].includes(skill[0]));

const safeText = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const skillFilename = ([id, title]) => `银盛支付_${id}_${title}.zip`;
const badgeClass = (level) => level === '进阶' ? 'advanced' : level === '高级' ? 'master' : '';

function draw() {
  const visible = skills.filter((skill) => inCategory(skill, state.active));
  nav.innerHTML = categories.map(([key, label], index) => {
    const total = skills.filter((skill) => inCategory(skill, key)).length;
    return `<button class="nav-button" type="button" data-filter="${key}" aria-current="${key === state.active}"><span class="nav-number">${String(index + 1).padStart(2, '0')}</span><span>${label}</span><span class="nav-count">${total}</span></button>`;
  }).join('');
  count.textContent = `当前显示 ${visible.length} 个 Skill`;
  grid.innerHTML = visible.map((skill) => {
    const [id, title, description, role, level, duration, prompt, dataset] = skill;
    const file = encodeURIComponent(skillFilename(skill));
    const datasetAction = dataset ? `<a class="button simulated-data" href="downloads/%E6%A8%A1%E6%8B%9F%E6%95%B0%E6%8D%AE/${encodeURIComponent(dataset)}" download>下载模拟数据 ↓</a>` : '';
    return `<article class="skill-card" id="${id}"><div class="skill-top"><span class="skill-id">${id}</span><div class="badges"><span class="badge ${badgeClass(level)}">${level}</span><span class="badge">${duration}</span></div></div><h3>${title}</h3><p class="description">${description}</p><p class="role">适用对象：${role}</p><blockquote class="prompt">${safeText(prompt)}</blockquote><div class="card-actions${dataset ? ' with-data' : ''}">${datasetAction}<button class="button" type="button" data-copy="${id}">复制提示词</button><a class="button download" href="downloads/${file}" download>下载独立 Skill ↓</a></div></article>`;
  }).join('');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  toast.textContent = '提示词已复制，可直接粘贴使用';
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

nav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  state.active = button.dataset.filter;
  draw();
});
grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const skill = skills.find(([id]) => id === button.dataset.copy);
  copyText(skill[6]);
});
document.querySelector('#copy-starter').addEventListener('click', () => copyText(skills.find(([id]) => id === 'S03')[6]));
document.querySelectorAll('[data-flow-copy]').forEach((button) => button.addEventListener('click', () => copyText(workflowPrompts[button.dataset.flowCopy])));
document.querySelector('[data-expert-copy]').addEventListener('click', () => copyText(document.querySelector('#expert-prompt-text').textContent.trim()));
draw();
