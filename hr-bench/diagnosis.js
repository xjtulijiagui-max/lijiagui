// ============================================================
// 组织健康度快速诊断 - 核心逻辑
// 基于"事-岗-人-钱-险"五维组织人力体系模型
// ============================================================

// ===== 诊断题目数据 =====
// 每道题：id, 维度, 题目文本, 影响面(1-5), 紧迫性(1-5)
const QUESTIONS = [
  // 事（战略与流程）
  { id: 's1', dim: 'shi', text: '公司年度战略目标清晰、可量化（如明确的营收目标、市场份额等）', impact: 5, urgency: 5 },
  { id: 's2', dim: 'shi', text: '战略目标已拆解到每个部门，各部门清楚自己要打的"硬仗"', impact: 5, urgency: 4 },
  { id: 's3', dim: 'shi', text: '核心业务流程已标准化，新人能在1个月内独立上手', impact: 4, urgency: 3 },
  { id: 's4', dim: 'shi', text: '跨部门协作顺畅，不存在明显的推诿和效率堵点', impact: 4, urgency: 3 },
  { id: 's5', dim: 'shi', text: '公司有明确的"必赢之战"清单，全员对优先级达成共识', impact: 4, urgency: 4 },

  // 岗（架构与岗位）
  { id: 'g1', dim: 'gang', text: '组织架构与当前业务模式匹配，管理层级精简高效', impact: 5, urgency: 4 },
  { id: 'g2', dim: 'gang', text: '每个岗位职责清晰，没有"一件事多人管"或"没人管"的灰色地带', impact: 4, urgency: 4 },
  { id: 'g3', dim: 'gang', text: '关键岗位有明确的任职资格标准（不只是"凭感觉招人"）', impact: 4, urgency: 3 },
  { id: 'g4', dim: 'gang', text: '部门编制基于人效数据测算，而非"不够了就加人"', impact: 4, urgency: 3 },
  { id: 'g5', dim: 'gang', text: '用工模式合理搭配（核心岗全职 + 辅助岗灵活 + 非核心外包）', impact: 3, urgency: 3 },

  // 人（人才与团队）
  { id: 'r1', dim: 'ren', text: '核心岗位（如销售总监、技术骨干）人员能力与岗位要求匹配', impact: 5, urgency: 5 },
  { id: 'r2', dim: 'ren', text: '公司定期做人才盘点，清楚谁是高潜、谁需提升、谁该淘汰', impact: 4, urgency: 3 },
  { id: 'r3', dim: 'ren', text: '招聘有清晰的人才画像和标准流程，不是"看着顺眼就要"', impact: 4, urgency: 4 },
  { id: 'r4', dim: 'ren', text: '员工培养有针对性方案，不是"一刀切培训"', impact: 3, urgency: 2 },
  { id: 'r5', dim: 'ren', text: '关键人才年流失率控制在15%以内', impact: 4, urgency: 5 },

  // 钱（薪酬与成本）
  { id: 'q1', dim: 'qian', text: '薪酬水平基于岗位价值和实际贡献，而非"谈出来"的', impact: 5, urgency: 4 },
  { id: 'q2', dim: 'qian', text: '激励机制与业务目标直接挂钩（如销售提成与回款挂钩）', impact: 5, urgency: 4 },
  { id: 'q3', dim: 'qian', text: '不存在严重的"新老员工薪酬倒挂"问题', impact: 4, urgency: 3 },
  { id: 'q4', dim: 'qian', text: '人力成本结构合理（固定薪资/绩效奖金/福利比例适当）', impact: 4, urgency: 3 },
  { id: 'q5', dim: 'qian', text: '有年度人力成本预算，并定期监控执行情况', impact: 4, urgency: 3 },

  // 险（用工风险）
  { id: 'w1', dim: 'xian', text: '社保公积金全员足额缴纳，不存在漏缴、少缴、按最低基数缴纳的情况', impact: 5, urgency: 5 },
  { id: 'w2', dim: 'xian', text: '用工模式合规（劳务派遣/外包/非全日制等），不存在"假外包真派遣"或名为外包实为劳动关系的风险', impact: 5, urgency: 4 },
  { id: 'w3', dim: 'xian', text: '退休返聘人员已签劳务协议并购买商业意外险，工伤责任风险有预案', impact: 4, urgency: 4 },
  { id: 'w4', dim: 'xian', text: '人员淘汰/解除劳动合同有制度依据和标准流程，不存在违法解除赔偿风险', impact: 5, urgency: 5 },
  { id: 'w5', dim: 'xian', text: '劳动合同入职1个月内签订、到期前30天续签，不存在未签合同双倍工资风险', impact: 5, urgency: 4 },
];

const DIMENSION_INFO = {
  shi:  { name: '事', full: '战略与流程', color: '#1a56db', icon: '事' },
  gang: { name: '岗', full: '架构与岗位', color: '#0891b2', icon: '岗' },
  ren:  { name: '人', full: '人才与团队', color: '#7c3aed', icon: '人' },
  qian: { name: '钱', full: '薪酬与成本', color: '#ea580c', icon: '钱' },
  xian: { name: '险', full: '用工风险', color: '#dc2626', icon: '险' },
};

const SCORE_LABELS = {
  1: '完全不符合',
  2: '不太符合',
  3: '一般',
  4: '比较符合',
  5: '完全符合',
};

// ===== 问题根因分析模板 =====
const ROOT_CAUSE = {
  s1: '公司缺乏系统的战略规划流程，或战略仅停留在老板脑中，未形成书面共识',
  s2: '战略解码环节缺失，目标没有自上而下拆解到可执行的行动层面',
  s3: '依赖"师傅带徒弟"的经验传承，未将隐性知识显性化、流程化',
  s4: '部门KPI各自为政，缺少跨部门协作机制和共同的考核维度',
  s5: '缺少"硬仗清单"方法论，战略执行缺乏聚焦和优先级管理',
  g1: '组织架构调整滞后于业务发展，历史包袱导致层级冗余',
  g2: '岗位说明书长期未更新，或从未系统梳理过岗位职责边界',
  g3: '凭经验招人，未建立基于岗位胜任力的任职资格体系',
  g4: '编制管理粗放，缺乏人效指标作为扩编/缩编的决策依据',
  g5: '对灵活用工和外包模式认知不足，过度依赖全职用工',
  r1: '关键岗位选拔标准模糊，"能把活干完"不等于"胜任岗位"',
  r2: '缺乏人才盘点机制，对团队人才现状"底数不清"',
  r3: '招聘需求临时化，未建立标准化招聘流程和人才画像',
  r4: '培训预算和资源有限，且未与岗位胜任力模型挂钩',
  r5: '激励机制和职业发展通道缺失，关键人才缺乏归属感和成长空间',
  q1: '薪酬体系缺乏岗位价值评估基础，定薪靠谈判而非体系',
  q2: '绩效考核与薪酬激励脱节，"干多干少差不多"',
  q3: '市场薪酬水平上涨，而内部调薪机制僵化，导致新老倒挂',
  q4: '人力成本未做结构化分析，固定成本占比过高，弹性不足',
  q5: '人力成本管理被动，缺乏事前预算和事中监控机制',
  w1: '社保合规意识薄弱，为节约成本按最低基数缴纳或漏缴，存在补缴+滞纳金+行政处罚风险',
  w2: '用工模式设计不合规，"假外包真派遣"或未区分劳动关系与劳务关系，一旦发生纠纷极易被认定事实劳动关系',
  w3: '退休返聘人员管理粗放，未签劳务协议、未购商业险，一旦发生意外企业承担全部赔偿责任',
  w4: '解除劳动合同缺乏制度依据和证据链，"想辞就辞"导致违法解除，面临2N赔偿或恢复劳动关系风险',
  w5: '劳动合同签订不规范，入职未及时签、到期未续签，存在双倍工资赔偿风险（最长11个月）',
};

// ===== 状态管理 =====
let appState = {
  companyInfo: {},
  answers: {},  // { questionId: score(1-5) }
  diagnosisResult: null,
};

// ===== 页面导航 =====
function goToPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageName);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ===== 信息采集验证 =====
function collectCompanyInfo() {
  const info = {
    name: document.getElementById('company-name').value.trim() || '贵公司',
    industry: document.getElementById('company-industry').value,
    size: getRadioValue('size'),
    revenue: getRadioValue('revenue') || '未提供',
    efficiency: getRadioValue('efficiency'),
    growth: getRadioValue('growth'),
    stage: getRadioValue('stage'),
    painPoints: getCheckboxValues('pain'),
  };

  if (!info.industry) {
    showToast('请选择所属行业');
    return null;
  }
  if (!info.size) {
    showToast('请选择企业人数');
    return null;
  }
  if (!info.efficiency) {
    showToast('请选择人效比（人均营业收入）');
    return null;
  }
  if (!info.growth) {
    showToast('请选择近三年业绩平均增速');
    return null;
  }
  if (!info.stage) {
    showToast('请选择发展阶段');
    return null;
  }

  return info;
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function getCheckboxValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(30,41,59,0.9);color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;pointer-events:none;animation:fadeIn 0.2s ease;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

// 多选限制3个
document.addEventListener('change', function(e) {
  if (e.target.name === 'pain') {
    const checked = document.querySelectorAll('input[name="pain"]:checked');
    if (checked.length > 3) {
      e.target.checked = false;
      showToast('最多选择3个');
    }
  }
});

// ===== 问卷渲染 =====
function goToSurvey() {
  const info = collectCompanyInfo();
  if (!info) return;

  appState.companyInfo = info;
  renderSurvey();
  goToPage('survey');
}

function renderSurvey() {
  const container = document.getElementById('survey-content');
  const dimensions = [
    { key: 'shi', label: '事 · 战略与流程', sub: '目标清晰度与执行落地' },
    { key: 'gang', label: '岗 · 架构与岗位', sub: '组织设计与编制管理' },
    { key: 'ren', label: '人 · 人才与团队', sub: '人岗匹配与梯队建设' },
    { key: 'qian', label: '钱 · 薪酬与成本', sub: '激励有效性与成本管控' },
    { key: 'xian', label: '险 · 用工风险', sub: '合规性与法律风险防范' },
  ];

  let html = '';
  dimensions.forEach(dim => {
    const questions = QUESTIONS.filter(q => q.dim === dim.key);
    html += `<div class="dimension-section">`;
    html += `<div class="dimension-header ${dim.key}">
      <div class="dimension-icon">${DIMENSION_INFO[dim.key].icon}</div>
      <div class="dimension-title">${dim.label}</div>
      <div class="dimension-subtitle">${dim.sub}</div>
    </div>`;

    questions.forEach((q, idx) => {
      html += `<div class="question-item" data-qid="${q.id}">
        <div class="question-text">${idx + 1}. ${q.text}</div>
        <div class="question-options">
          ${[1,2,3,4,5].map(score => `
            <button class="score-btn" data-qid="${q.id}" data-score="${score}" onclick="selectScore('${q.id}', ${score})">
              <span class="score-num">${score}</span>
              <span class="score-label">${SCORE_LABELS[score]}</span>
            </button>
          `).join('')}
        </div>
      </div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
  updateProgress();
}

function selectScore(qid, score) {
  appState.answers[qid] = score;

  // 更新按钮选中状态
  const buttons = document.querySelectorAll(`.score-btn[data-qid="${qid}"]`);
  buttons.forEach(btn => {
    btn.classList.remove('selected');
    if (parseInt(btn.dataset.score) === score) {
      btn.classList.add('selected');
    }
  });

  updateProgress();
}

function updateProgress() {
  const total = QUESTIONS.length;
  const answered = Object.keys(appState.answers).length;
  const percent = (answered / total) * 100;

  document.getElementById('survey-progress').style.width = percent + '%';
  document.getElementById('progress-text').textContent = `已完成 ${answered} / ${total} 题`;

  const btnGenerate = document.getElementById('btn-generate');
  if (answered === total) {
    btnGenerate.classList.remove('hidden');
    btnGenerate.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    btnGenerate.classList.add('hidden');
  }
}

// ===== 诊断核心逻辑 =====
function calculateScores() {
  const dimScores = {};
  const dimDetails = {};

  Object.keys(DIMENSION_INFO).forEach(dim => {
    const questions = QUESTIONS.filter(q => q.dim === dim);
    const totalScore = questions.reduce((sum, q) => sum + appState.answers[q.id], 0);
    const maxScore = questions.length * 5;
    const percentScore = Math.round((totalScore / maxScore) * 100);

    dimScores[dim] = percentScore;
    dimDetails[dim] = {
      score: percentScore,
      grade: getGrade(percentScore),
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        score: appState.answers[q.id],
        impact: q.impact,
        urgency: q.urgency,
        priority: q.impact * q.urgency,
        isWeakness: appState.answers[q.id] <= 3,
      })),
    };
  });

  // 综合健康度（五维加权平均，权重均等）
  const composite = Math.round(
    Object.values(dimScores).reduce((a, b) => a + b, 0) / 5
  );

  return { dimScores, dimDetails, composite };
}

function getGrade(score) {
  if (score >= 80) return { label: '健康', class: 'grade-healthy' };
  if (score >= 60) return { label: '亚健康', class: 'grade-subhealthy' };
  return { label: '病态', class: 'grade-critical' };
}

function identifyWeaknesses(dimDetails) {
  const weaknesses = [];

  Object.keys(dimDetails).forEach(dim => {
    dimDetails[dim].questions.forEach(q => {
      if (q.isWeakness) {
        weaknesses.push({
          ...q,
          dim,
          dimName: DIMENSION_INFO[dim].name,
          dimFull: DIMENSION_INFO[dim].full,
          dimColor: DIMENSION_INFO[dim].color,
          // 得分越低，问题越严重，优先级指数越高
          severityBoost: (4 - q.score) * 2, // 1分+6, 2分+4, 3分+2
          finalPriority: q.priority + (4 - q.score) * 2,
          rootCause: ROOT_CAUSE[q.id],
        });
      }
    });
  });

  // 按最终优先级排序
  weaknesses.sort((a, b) => b.finalPriority - a.finalPriority);

  return weaknesses.slice(0, 5);
}

function generateCausalChain(dimScores, weaknesses) {
  // 按"事→岗→人→钱→险"的维度顺序分析
  const dimOrder = ['shi', 'gang', 'ren', 'qian', 'xian'];
  const weakDims = dimOrder.filter(d => dimScores[d] < 70);

  if (weakDims.length === 0) {
    return {
      nodes: [{ dim: 'all', text: '各维度整体健康，建议持续优化薄弱环节，保持体系运转' }],
      type: 'healthy',
      insight: '',
    };
  }

  // 根据低分维度的组合生成因果分析
  const chainNodes = [];
  const weaknessByDim = {};
  weaknesses.forEach(w => {
    if (!weaknessByDim[w.dim]) weaknessByDim[w.dim] = [];
    weaknessByDim[w.dim].push(w);
  });

  weakDims.forEach(dim => {
    const dimWeaknesses = weaknessByDim[dim] || [];
    const topIssue = dimWeaknesses[0];
    if (topIssue) {
      chainNodes.push({
        dim,
        text: `${DIMENSION_INFO[dim].name}（${DIMENSION_INFO[dim].full}）：${topIssue.text.replace(/[（(].*?[)）]/g, '')}——导致后续环节缺乏支撑`,
      });
    } else {
      chainNodes.push({
        dim,
        text: `${DIMENSION_INFO[dim].name}（${DIMENSION_INFO[dim].full}）：该维度得分偏低（${dimScores[dim]}分），需要重点关注`,
      });
    }
  });

  // 体系化洞察：基于低分维度组合，生成系统性分析
  let insight = '';
  const hasShiWeak = weakDims.includes('shi');
  const hasGangWeak = weakDims.includes('gang');
  const hasQianWeak = weakDims.includes('qian');
  const hasXianWeak = weakDims.includes('xian');

  if (hasShiWeak && hasGangWeak) {
    insight = '战略目标不清晰→岗位设计缺乏依据→人岗匹配失准→激励无法精准→合规成本成为负担。根源在"事"和"岗"——战略解码到位、岗位体系搭好，后续的人、钱、险才有抓手。这不是修几个HR流程的问题，而是从源头理顺组织逻辑。';
  } else if (hasGangWeak && hasQianWeak) {
    insight = '岗位体系不健全→薪酬缺乏定薪依据→激励效果打折→人才流失→用工风险暴露。岗位用工模式优化后（核心岗全职+辅助岗灵活+非核心外包），释放的成本空间既能覆盖合规成本，又能转化为核心岗位的高薪吸引力——形成"省该省的、花该花的"正向循环。';
  } else if (hasXianWeak && (hasShiWeak || hasGangWeak)) {
    insight = '用工风险本质上是体系不完善的表征——岗位边界不清导致用工模式混乱，战略未拆解导致人员进出无标准。单纯修补合规问题治标不治本，把事岗人钱体系搭好，合规成本自然在可承担范围内，且组织效率提升带来的收益远超合规投入。';
  } else if (hasQianWeak) {
    insight = '薪酬激励体系不完善，根源往往在岗位价值评估缺失。当岗位体系理顺、用工模式优化后，固定成本占比下降、弹性激励空间释放，既能保障合规投入，又能用更有竞争力的薪酬吸引和留住核心人才。';
  } else {
    insight = '各维度存在关联性短板，建议从"事"维度入手理顺战略目标，带动岗位、人才、薪酬体系联动优化。体系化设计完成后，合规成本、人才投入、成本管控将形成良性循环。';
  }

  return { nodes: chainNodes, type: 'weak', insight };
}

function generateRoadmap(weaknesses, companyInfo) {
  const dimScores = {};
  Object.keys(DIMENSION_INFO).forEach(dim => {
    const questions = QUESTIONS.filter(q => q.dim === dim);
    const totalScore = questions.reduce((sum, q) => sum + appState.answers[q.id], 0);
    dimScores[dim] = Math.round((totalScore / (questions.length * 5)) * 100);
  });

  const weakDims = Object.entries(dimScores)
    .filter(([k, v]) => v < 70)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k);

  let improvementFocus = '';
  if (weakDims.includes('shi') || weakDims.includes('gang')) {
    improvementFocus = '先核对业务目标与岗位分工，梳理组织架构、岗位职责、任职资格和编制依据';
  } else if (weakDims.includes('qian') || weakDims.includes('ren')) {
    improvementFocus = '先核对人才盘点、薪酬和绩效数据，找出人岗匹配与激励规则中的具体问题';
  } else {
    improvementFocus = '复核战略、岗位、人才、薪酬和用工记录，优先处理证据明确且影响较大的问题';
  }

  const painText = companyInfo.painPoints[0] || '关键人效问题';

  return {
    phase1: {
      label: '核实问题',
      time: '建议第1个月，按企业实际调整',
      tasks: [
        '由HR牵头，与业务负责人逐项核实低分答案，记录事实依据、影响范围和待确认事项',
        improvementFocus,
        '选定本阶段优先处理的问题，明确负责人、所需资料和验收方式',
        '整理现行制度与实际执行差异，用工作台工具起草修订内容并交相关负责人审核',
      ],
      milestone: '形成经业务负责人确认的问题清单、事实依据和改进任务表',
      resource: 'HR负责人、相关业务负责人、现行制度与业务记录；涉及预算或用工事项时请财务或法务参与',
    },
    phase2: {
      label: '小范围试行',
      time: '建议第2-3个月，按企业实际调整',
      tasks: [
        '选择一个部门或岗位试行，明确开始条件、参与人员和反馈渠道',
        '根据实际问题完善岗位说明书、人才画像、绩效指标或薪酬测算，保留审核记录',
        '记录试行前的指标口径和数据基线，定期收集业务与员工反馈',
        '针对试行中出现的职责冲突、数据缺失和制度执行问题逐项修订',
      ],
      milestone: '保留试行记录、反馈清单、制度修订稿和是否扩大适用范围的判断依据',
      resource: 'HR执行人员、试行部门负责人、参与员工及相应的数据权限',
    },
    phase3: {
      label: '复盘与维护',
      time: '建议第4-12个月，按企业实际调整',
      tasks: [
        '由HR与业务负责人定期复盘，核对已完成事项、遗留问题和下一步责任人',
        '依据试行结果决定继续、调整或停止，成熟做法经审批后再扩大使用',
        '保持岗位、人才、薪酬、绩效和用工资料的版本记录，明确日常维护责任',
        '使用相同口径比较前后数据，区分业务变化与管理措施的影响',
      ],
      milestone: '形成可查阅的复盘记录、制度版本和任务状态，明确仍需改进的事项',
      resource: '企业内部HR与业务负责人；预算、制度和用工调整按企业审批程序办理',
    },
    goal6m: `检查“${painText}”相关任务是否执行，并用同口径数据与访谈记录评估变化；具体目标由企业根据基线自行确定`,
    goal12m: '复查岗位、人才、薪酬、绩效和用工制度的执行情况，保留有效做法并调整无效措施；本问卷不承诺分数、人效或成本的改善幅度',
  };
}

function recommendAgents(dimScores, weaknesses) {
  const recommendations = [];

  // 按维度得分排序（从低到高）
  const dimOrder = Object.keys(dimScores).sort((a, b) => dimScores[a] - dimScores[b]);

  const agentMap = {
    shi: {
      name: '战略解码助手',
      reason: '战略目标是组织运转的起点。战略解码助手能帮您将年度目标转化为硬仗清单和部门绩效合约，从源头理顺"事"的环节——事不清，则岗不准、人不适、钱无效。',
    },
    gang: {
      name: '岗位设计助手',
      reason: '岗位体系是连接战略与人才的桥梁。岗位设计助手能基于业务模式重新设计组织架构、输出岗位说明书+任职资格+编制建议+用工模式方案，让"岗"精准匹配"事"，同时释放非核心岗位成本空间。',
    },
    ren: {
      name: '人才甄选助手',
      reason: '人才管理环节薄弱，人岗匹配度不足。人才甄选助手能生成人才画像+结构化面试手册+人才Mapping方案，为人岗匹配判断提供参考。',
    },
    qian: {
      name: '薪酬方案助手',
      reason: '薪酬激励是驱动人效的核心杠杆。薪酬方案助手能生成宽带制薪酬体系+核心岗位薪酬区间+差异化激励方案+人力成本预算模型。岗位用工模式优化后释放的成本空间，可转化为核心岗位的高薪竞争力——"省该省的，花该花的"。',
    },
    xian: {
      name: '用工合规助手',
      reason: '用工合规是体系运转的底线保障。用工合规助手能生成风险清单+制度模板+合同模板+纠纷预案。注意：合规成本不是额外负担——事岗人钱体系搭好后，组织效率提升带来的收益远超合规投入。',
    },
  };

  // 推荐得分最低的1-2个维度对应的智能体
  const recommendCount = dimScores[dimOrder[0]] < 60 ? 2 : 1;
  for (let i = 0; i < Math.min(recommendCount, dimOrder.length); i++) {
    const dim = dimOrder[i];
    if (agentMap[dim]) {
      recommendations.push({
        name: agentMap[dim].name,
        reason: agentMap[dim].reason,
        priority: i + 1,
      });
    }
  }

  return recommendations;
}

// ===== 报告生成 =====
function generateReport() {
  goToPage('loading');

  const tips = [
    '正在分析五维健康度',
    '正在识别薄弱环节',
    '正在生成问题因果链',
    '正在规划行动路线图',
  ];
  let tipIdx = 0;
  const tipEl = document.getElementById('loading-tip');
  const tipInterval = setInterval(() => {
    tipIdx = (tipIdx + 1) % tips.length;
    tipEl.textContent = tips[tipIdx];
  }, 800);

  // 延迟1.5秒后生成报告（模拟分析过程，同时让用户看到加载动画）
  setTimeout(() => {
    clearInterval(tipInterval);

    const scores = calculateScores();
    const weaknesses = identifyWeaknesses(scores.dimDetails);
    const causalChain = generateCausalChain(scores.dimScores, weaknesses);
    const roadmap = generateRoadmap(weaknesses, appState.companyInfo);
    const agents = recommendAgents(scores.dimScores, weaknesses);

    appState.diagnosisResult = {
      ...scores,
      weaknesses,
      causalChain,
      roadmap,
      agents,
    };

    renderReport();
    goToPage('report');
  }, 1800);
}

// ===== 报告渲染 =====
function escapeReportText(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderReport() {
  const r = appState.diagnosisResult;
  const info = appState.companyInfo;
  const container = document.getElementById('report-content');

  const compositeGrade = getGrade(r.composite);

  let html = '';

  // 一、企业概况
  html += `<div class="report-section">
    <div class="report-section-title">一、企业概况</div>
    <table class="info-table">
      <tr><th>企业名称</th><td>${escapeReportText(info.name)}</td></tr>
      <tr><th>所属行业</th><td>${info.industry}</td></tr>
      <tr><th>企业规模</th><td>${info.size}</td></tr>
      <tr><th>年度营收</th><td>${info.revenue}</td></tr>
      <tr><th>人效比（人均营收）</th><td>${info.efficiency}</td></tr>
      <tr><th>近三年业绩增速</th><td>${info.growth}</td></tr>
      <tr><th>发展阶段</th><td>${info.stage}</td></tr>
      ${info.painPoints.length > 0 ? `<tr><th>核心痛点</th><td>${info.painPoints.join('、')}</td></tr>` : ''}
    </table>
  </div>`;

  // 二、五维健康度评分
  html += `<div class="report-section">
    <div class="report-section-title">二、五维健康度评分</div>
    <div class="score-overview">
      <div class="composite-score" style="color: ${compositeGrade.label === '健康' ? 'var(--green)' : compositeGrade.label === '亚健康' ? 'var(--amber)' : 'var(--red)'}">${r.composite}</div>
      <div class="composite-label">综合健康度</div>
      <div class="composite-grade ${compositeGrade.class}">${compositeGrade.label}</div>
    </div>
    <div class="chart-container">
      <canvas id="radar-chart"></canvas>
    </div>
    <div class="dim-score-grid">
      ${Object.keys(DIMENSION_INFO).map(dim => {
        const d = r.dimDetails[dim];
        const g = getGrade(d.score);
        return `<div class="dim-score-card ${dim}">
          <div class="dim-name">${DIMENSION_INFO[dim].name} · ${DIMENSION_INFO[dim].full}</div>
          <div class="dim-value">${d.score}</div>
          <div class="dim-grade" style="color:${g.label === '健康' ? 'var(--green)' : g.label === '亚健康' ? 'var(--amber)' : 'var(--red)'}">${g.label}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 三、Top 5 薄弱环节
  if (r.weaknesses.length > 0) {
    html += `<div class="report-section">
      <div class="report-section-title">三、Top ${r.weaknesses.length} 薄弱环节</div>
      <div class="weakness-list">
        ${r.weaknesses.map((w, i) => `
          <div class="weakness-item">
            <div class="weakness-rank r${i + 1}">${i + 1}</div>
            <div class="weakness-body">
              <div class="weakness-title">${w.text.replace(/[（(].*?[)）]/g, '')}</div>
              <div class="weakness-meta">
                <span>维度：${w.dimName}-${w.dimFull}</span>
                <span>得分：${w.score}/5</span>
                <span class="weakness-priority">优先级：${w.finalPriority}</span>
              </div>
              <div class="weakness-cause">根因：${w.rootCause}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  // 四、问题因果链
  html += `<div class="report-section">
    <div class="report-section-title">四、问题因果链</div>
    <div class="causal-chain">
      ${r.causalChain.type === 'healthy'
        ? `<p style="font-size:14px;color:var(--text-primary);line-height:1.6;">${r.causalChain.nodes[0].text}</p>`
        : `<div class="chain-flow">
          ${r.causalChain.nodes.map((node, i) => `
            <div class="chain-node">
              <div class="chain-dim ${node.dim}">${DIMENSION_INFO[node.dim] ? DIMENSION_INFO[node.dim].icon : '✓'}</div>
              <div class="chain-text">${node.text}</div>
            </div>
            ${i < r.causalChain.nodes.length - 1 ? '<div class="chain-arrow">↓</div>' : ''}
          `).join('')}
        </div>`
      }
    </div>
    ${r.causalChain.insight ? `<div class="chain-insight">
      <div class="chain-insight-label">体系化洞察</div>
      <p>${r.causalChain.insight}</p>
    </div>` : ''}
  </div>`;

  // 五、行动路线图
  html += `<div class="report-section">
    <div class="report-section-title">五、行动路线图</div>
    <div class="roadmap-timeline">
      <div class="roadmap-phase">
        <div class="phase-dot stop"></div>
        <span class="phase-label stop">${r.roadmap.phase1.label}</span>
        <div class="phase-time">${r.roadmap.phase1.time}</div>
        <ul class="phase-tasks">
          ${r.roadmap.phase1.tasks.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div class="phase-milestone"><strong>里程碑：</strong>${r.roadmap.phase1.milestone}</div>
        <div class="phase-milestone"><strong>所需资源：</strong>${r.roadmap.phase1.resource}</div>
      </div>
      <div class="roadmap-phase">
        <div class="phase-dot build"></div>
        <span class="phase-label build">${r.roadmap.phase2.label}</span>
        <div class="phase-time">${r.roadmap.phase2.time}</div>
        <ul class="phase-tasks">
          ${r.roadmap.phase2.tasks.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div class="phase-milestone"><strong>里程碑：</strong>${r.roadmap.phase2.milestone}</div>
        <div class="phase-milestone"><strong>所需资源：</strong>${r.roadmap.phase2.resource}</div>
      </div>
      <div class="roadmap-phase">
        <div class="phase-dot boost"></div>
        <span class="phase-label boost">${r.roadmap.phase3.label}</span>
        <div class="phase-time">${r.roadmap.phase3.time}</div>
        <ul class="phase-tasks">
          ${r.roadmap.phase3.tasks.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div class="phase-milestone"><strong>里程碑：</strong>${r.roadmap.phase3.milestone}</div>
        <div class="phase-milestone"><strong>所需资源：</strong>${r.roadmap.phase3.resource}</div>
      </div>
    </div>
    <div class="goal-card">
      <strong>6个月目标</strong>
      <p>${r.roadmap.goal6m}</p>
    </div>
    <div class="goal-card">
      <strong>12个月目标</strong>
      <p>${r.roadmap.goal12m}</p>
    </div>

    <!-- 落地路径总结 -->
    <div class="cta-roadmap">
      <div class="cta-roadmap-title">落地路径总结</div>
      <p class="cta-roadmap-desc">先核实问题，再用小范围试行检验方案。以下步骤供企业内部安排任务，时间与目标由HR和业务负责人结合实际确定。</p>
      <div class="cta-path-summary">
        <div class="cta-path-step">
          <div class="cta-path-num">1</div>
          <div class="cta-path-body">
            <strong>核实问题与责任</strong>
            <p>核对低分答案的事实依据，明确优先事项、责任人和验收方式。</p>
          </div>
        </div>
        <div class="cta-path-step">
          <div class="cta-path-num">2</div>
          <div class="cta-path-body">
            <strong>在具体岗位试行</strong>
            <p>准备业务资料，使用HR工具整理方案，经审核后小范围试行并记录反馈。</p>
          </div>
        </div>
        <div class="cta-path-step">
          <div class="cta-path-num">3</div>
          <div class="cta-path-body">
            <strong>用记录复盘效果</strong>
            <p>比较相同口径的数据，决定继续、调整或停止，维护制度和任务版本。</p>
          </div>
        </div>
      </div>
      <div class="cta-combo">
        <span class="cta-combo-badge">使用方法</span>
        <p>问卷反映填答者的自评。分数和根因提示用于讨论，不代表已经查明原因；重要判断请结合业务记录和相关人员意见核实。</p>
      </div>
    </div>
  </div>`;

  // 六、下一步建议
  html += `<div class="report-section">
    <div class="report-section-title">六、下一步建议</div>
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">基于诊断结果，可优先使用以下HR工具整理资料与方案，输出内容由相关负责人核实：</p>
    ${r.agents.map(a => `
      <div class="agent-rec">
        <div class="agent-num">${a.priority}</div>
        <div class="agent-info">
          <strong>${a.name}</strong>
          <p>${a.reason}</p>
        </div>
      </div>
    `).join('')}
    <div class="agent-fulllist">
      <strong>相关HR工具：</strong>
      <span>战略解码助手</span> · <span>岗位设计助手</span> · <span>人才甄选助手</span> · <span>薪酬方案助手</span> · <span>绩效管理助手</span> · <span>用工合规助手</span>
    </div>
    <div class="report-cta">
      <h3>把结论转成具体任务</h3>
      <p>与业务负责人选定优先处理的问题，补齐证据、责任人、检查时间和验收标准。</p>
    </div>
  </div>`;

  // Footer
  html += `<div class="report-footer">
    <p>本报告由"组织健康度快速诊断"智能体生成</p>
    <p>HR自动化工作台 | 基于"事-岗-人-钱-险"五维模型</p>
    <p style="margin-top:8px;">${new Date().toLocaleDateString('zh-CN')}</p>
  </div>`;

  html += `<div id="report-actions" style="padding:20px 16px 32px;text-align:center;">
    <button id="btn-save-report" onclick="triggerReportDownload()" style="width:100%;max-width:320px;padding:14px 24px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(135deg,#1a56db,#0891b2);border:none;border-radius:12px;cursor:pointer;box-shadow:0 4px 12px rgba(26,86,219,0.3);">
      下载诊断报告
    </button>
    <p id="save-hint" style="margin-top:10px;font-size:13px;color:#94a3b8;line-height:1.6;">
      报告正在自动下载，如未下载请点击上方按钮
    </p>
    <div id="upload-prompt" style="display:none;margin-top:20px;padding:16px 20px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;text-align:left;">
      <p style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:6px;">下一步：核实问题并分配任务</p>
      <p style="font-size:13px;color:#78350f;line-height:1.6;">
        将报告用于企业内部讨论。先补充<strong>事实依据</strong>，再明确<strong>责任人、检查时间和验收标准</strong>。
      </p>
    </div>
  </div>`;

  container.innerHTML = html;

  // 绘制雷达图
  drawRadarChart(r.dimScores);

  // 自动下载报告（延迟1.5秒等待图表渲染完成）
  setTimeout(() => {
    if (isWeChatBrowser()) {
      // 微信环境：自动弹出引导浮层
      showWeChatGuide();
    } else {
      // 非微信：自动触发下载
      triggerReportDownload();
    }
  }, 1500);
}

// ===== 雷达图 =====
function drawRadarChart(dimScores) {
  var el = document.getElementById('radar-chart');
  if (!el) return;
  var dims = [
    {k:'shi',  n:'事·战略流程', c:'#1a56db'},
    {k:'gang', n:'岗·架构岗位', c:'#0891b2'},
    {k:'ren',  n:'人·人才团队', c:'#7c3aed'},
    {k:'qian', n:'钱·薪酬成本', c:'#ea580c'},
    {k:'xian', n:'险·用工风险', c:'#dc2626'}
  ];
  var vals = dims.map(function(d){ return Number(dimScores[d.k]) || 0; });
  var cx = 170, cy = 168, R = 112;
  var pt = function(i, v) {
    var ang = -Math.PI/2 + i * 2 * Math.PI / 5;
    var r = R * (v / 100);
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  var g = '';
  [20,40,60,80,100].forEach(function(lv) {
    var pts = dims.map(function(d,i){ return pt(i,lv).join(','); }).join(' ');
    g += '<polygon points="' + pts + '" fill="' + (lv===100?'#FCFCFB':'none') + '" stroke="#ECEAE6" stroke-width="1"/>';
  });
  dims.forEach(function(d,i) {
    var q = pt(i,100);
    g += '<line x1="'+cx+'" y1="'+cy+'" x2="'+q[0]+'" y2="'+q[1]+'" stroke="#ECEAE6" stroke-width="1"/>';
  });
  var dp = vals.map(function(v,i){ return pt(i,v).join(','); }).join(' ');
  g += '<polygon points="'+dp+'" fill="rgba(26,86,219,0.15)" stroke="#1a56db" stroke-width="2"/>';
  vals.forEach(function(v,i) {
    var q = pt(i,v);
    g += '<circle cx="'+q[0]+'" cy="'+q[1]+'" r="4" fill="'+dims[i].c+'" stroke="#fff" stroke-width="2"/>';
  });
  dims.forEach(function(d,i) {
    var q = pt(i, 132);
    var anc = Math.abs(q[0]-cx) < 22 ? 'middle' : (q[0] > cx ? 'start' : 'end');
    g += '<text x="'+q[0]+'" y="'+(q[1]-3)+'" text-anchor="'+anc+'" font-size="12" fill="#3D4450" font-family="Microsoft YaHei,sans-serif">'+d.n+'</text>';
    g += '<text x="'+q[0]+'" y="'+(q[1]+13)+'" text-anchor="'+anc+'" font-size="13" font-weight="700" fill="'+d.c+'" font-family="Microsoft YaHei,sans-serif">'+vals[i]+'</text>';
  });
  var svg = '<svg id="radar-chart" viewBox="0 0 340 336" width="100%" style="max-width:340px;display:block;margin:0 auto">'+g+'</svg>';
  el.outerHTML = svg;
}
// ===== 报告下载 =====
function triggerReportDownload() {
  const r = appState.diagnosisResult;
  const info = appState.companyInfo;
  if (!r || !info) return;

  // 微信环境下弹出引导
  if (isWeChatBrowser()) {
    showWeChatGuide();
    return;
  }

  const standaloneHTML = generateStandaloneReportHTML(r, info);
  const fileName = (info.name || '企业').replace(/[<>:"/\\|?*]/g, '_');
  const fullFileName = `诊断报告_${fileName}_${new Date().toISOString().slice(0,10)}.html`;
  const blob = new Blob([standaloneHTML], { type: 'text/html;charset=utf-8' });

  // 直接下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  updateSaveButtonState();
}

function updateSaveButtonState() {
  const saveBtn = document.getElementById('btn-save-report');
  const saveHint = document.getElementById('save-hint');
  const uploadPrompt = document.getElementById('upload-prompt');
  if (saveBtn) {
    saveBtn.textContent = '再次下载报告';
    saveBtn.style.background = 'linear-gradient(135deg,#16a34a,#0891b2)';
    saveBtn.disabled = false;
  }
  if (saveHint) {
    saveHint.textContent = '已发起下载，请在浏览器下载记录中查看；如被拦截，可再次点击下载';
  }
  if (uploadPrompt) {
    uploadPrompt.style.display = 'block';
  }
}

function generateStandaloneReportHTML(r, info) {
  const reportEl = document.getElementById('report-content');
  const reportClone = reportEl.cloneNode(true);
  reportClone.querySelector('#report-actions')?.remove();
  const reportBody = reportClone.innerHTML;

  // 构建独立HTML文件
  const standaloneHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>组织健康度诊断报告 - ${escapeReportText(info.name || '企业')} | HR自动化工作台</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "PingFang SC", sans-serif; background:#f8fafc; color:#1e293b; line-height:1.6; padding:20px; }
    .report-wrap { max-width:800px; margin:0 auto; background:#fff; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden; }
    .report-header { background:linear-gradient(135deg, #1a56db, #0891b2); color:#fff; padding:32px 28px; text-align:center; }
    .report-header h1 { font-size:24px; font-weight:700; margin-bottom:6px; }
    .report-header p { font-size:13px; opacity:0.85; }
    .report-section { padding:24px 28px; border-bottom:1px solid #e2e8f0; }
    .report-section:last-child { border-bottom:none; }
    .report-section-title { font-size:17px; font-weight:700; color:#1a56db; margin-bottom:16px; padding-bottom:8px; border-bottom:2px solid #e2e8f0; }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    table th { text-align:left; padding:8px 12px; color:#64748b; background:#f8fafc; width:40%; border:1px solid #e2e8f0; }
    table td { padding:8px 12px; border:1px solid #e2e8f0; }
    .composite-score { font-size:56px; font-weight:800; text-align:center; }
    .composite-label { text-align:center; font-size:14px; color:#64748b; }
    .composite-grade { text-align:center; font-size:14px; font-weight:700; margin-top:4px; }
    .grade-healthy { color:#16a34a; }
    .grade-subhealthy { color:#f59e0b; }
    .grade-critical { color:#dc2626; }
    .dim-score-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; }
    .dim-score-card { border-radius:10px; padding:14px; text-align:center; }
    .dim-score-card.shi { border:1px solid rgba(26,86,219,0.2); background:rgba(26,86,219,0.03); }
    .dim-score-card.gang { border:1px solid rgba(8,145,178,0.2); background:rgba(8,145,178,0.03); }
    .dim-score-card.ren { border:1px solid rgba(124,58,237,0.2); background:rgba(124,58,237,0.03); }
    .dim-score-card.qian { border:1px solid rgba(234,88,12,0.2); background:rgba(234,88,12,0.03); }
    .dim-score-card.xian { border:1px solid rgba(220,38,38,0.2); background:rgba(220,38,38,0.03); grid-column:1/-1; max-width:50%; margin:0 auto; }
    .dim-name { font-size:12px; color:#64748b; margin-bottom:4px; }
    .dim-value { font-size:28px; font-weight:700; }
    .dim-score-card.shi .dim-value { color:#1a56db; }
    .dim-score-card.gang .dim-value { color:#0891b2; }
    .dim-score-card.ren .dim-value { color:#7c3aed; }
    .dim-score-card.qian .dim-value { color:#ea580c; }
    .dim-score-card.xian .dim-value { color:#dc2626; }
    .dim-grade { font-size:13px; font-weight:600; margin-top:2px; }
    .weakness-list { display:flex; flex-direction:column; gap:10px; }
    .weakness-item { display:flex; gap:10px; align-items:flex-start; background:#fefce8; border-radius:10px; padding:12px; border:1px solid #fef08a; }
    .weakness-rank { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; margin-top:2px; }
    .r1 { background:#dc2626; }
    .r2 { background:#ea580c; }
    .r3 { background:#f59e0b; }
    .r4 { background:#0891b2; }
    .r5 { background:#7c3aed; }
    .weakness-body { flex:1; }
    .weakness-title { font-size:14px; font-weight:600; color:#1e293b; margin-bottom:4px; }
    .weakness-meta { font-size:12px; color:#64748b; display:flex; gap:10px; flex-wrap:wrap; margin-bottom:4px; }
    .weakness-priority { color:#dc2626; font-weight:600; }
    .weakness-cause { font-size:12px; color:#92400e; background:rgba(245,158,11,0.08); padding:6px 8px; border-radius:6px; margin-top:4px; }
    .causal-chain { background:#f0f9ff; border-radius:10px; padding:16px; }
    .chain-flow { display:flex; flex-direction:column; gap:0; }
    .chain-node { display:flex; gap:10px; align-items:flex-start; }
    .chain-dim { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
    .chain-text { font-size:14px; color:#1e293b; line-height:1.5; padding:4px 0; }
    .chain-arrow { text-align:center; color:#94a3b8; font-size:16px; line-height:1; padding:2px 0 2px 36px; }
    .chain-insight { background:#f0fdf4; border-radius:10px; padding:14px; margin-top:14px; border:1px solid #bbf7d0; }
    .chain-insight-label { font-size:12px; font-weight:700; color:#16a34a; margin-bottom:6px; }
    .chain-insight p { font-size:13px; color:#166534; line-height:1.6; }
    .roadmap-timeline { display:flex; flex-direction:column; gap:16px; }
    .roadmap-phase { background:#f8fafc; border-radius:10px; padding:16px; border-left:4px solid #1a56db; }
    .phase-label { display:inline-block; padding:2px 10px; border-radius:6px; font-size:12px; font-weight:700; color:#fff; background:#1a56db; margin-bottom:8px; }
    .phase-time { font-size:12px; color:#64748b; margin-bottom:8px; }
    .phase-tasks { margin:0; padding-left:18px; font-size:13px; color:#1e293b; }
    .phase-tasks li { margin-bottom:4px; }
    .phase-milestone { font-size:12px; color:#64748b; margin-top:8px; padding:8px; background:#fff; border-radius:6px; }
    .goal-card { background:linear-gradient(135deg, #eff6ff, #e0e7ff); border-radius:10px; padding:14px; margin-top:12px; }
    .goal-card strong { font-size:13px; color:#1a56db; }
    .goal-card p { font-size:13px; color:#1e293b; margin-top:4px; line-height:1.5; }
    .agent-rec { display:flex; gap:10px; align-items:flex-start; background:#f8fafc; border-radius:10px; padding:12px; margin-bottom:10px; }
    .agent-num { width:24px; height:24px; border-radius:50%; background:#1a56db; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .agent-info { flex:1; }
    .agent-info strong { font-size:14px; color:#1a56db; }
    .agent-info p { font-size:12px; color:#64748b; margin-top:2px; }
    .agent-fullist { font-size:12px; color:#64748b; margin-top:10px; padding:8px; background:#f8fafc; border-radius:6px; }
    .agent-fullist span { color:#1a56db; font-weight:600; }
    .report-cta { background:linear-gradient(135deg, #1a56db, #0891b2); color:#fff; border-radius:10px; padding:20px; text-align:center; margin-top:16px; }
    .report-cta h3 { font-size:16px; font-weight:700; margin-bottom:6px; }
    .report-cta p { font-size:13px; opacity:0.9; }
    .report-footer { text-align:center; padding:20px; font-size:12px; color:#94a3b8; }
    @media print { body { background:#fff; padding:0; } .report-wrap { box-shadow:none; } }
  </style>
</head>
<body>
  <div class="report-wrap">
    <div class="report-header">
      <h1>组织健康度诊断报告</h1>
      <p>基于"事-岗-人-钱-险"五维组织人力体系模型</p>
    </div>
    ${reportBody}
  </div>
  <script type="application/json" id="diagnosis-data">
  ${JSON.stringify({ companyInfo: info, diagnosisResult: { dimScores: r.dimScores, composite: r.composite, weaknesses: r.weaknesses, roadmap: r.roadmap, agents: r.agents } }).replace(/</g, '\\u003c')}
  </script>
</body>
</html>`;

  return standaloneHTML;
}

// ===== 微信环境检测 =====
function isWeChatBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

function showWeChatGuide() {
  if (!isWeChatBrowser()) return;
  const overlay = document.getElementById('wechat-guide-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideWeChatGuide() {
  const overlay = document.getElementById('wechat-guide-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
  // 默认显示欢迎页
  // 微信环境下，页面加载时立即弹出引导，避免填完后才发现无法下载
  if (isWeChatBrowser()) {
    showWeChatGuide();
  }
});


// ===== 工具箱接入：表格导出 =====
function wbExport() {
  var rows = [];
  var co = {};
  var info = document.getElementById('report-company-name');
  rows.push(['组织人效诊断报告']);
  rows.push(['导出时间', new Date().toLocaleString('zh-CN')]);
  rows.push([]);
  var tables = document.querySelectorAll('table');
  if (!tables.length) { alert('先完成诊断测评，才能导出结果。'); return; }
  for (var i = 0; i < tables.length; i++) {
    var trs = tables[i].querySelectorAll('tr');
    for (var j = 0; j < trs.length; j++) {
      var cs = trs[j].querySelectorAll('th,td');
      var r = [];
      for (var k = 0; k < cs.length; k++) r.push((cs[k].innerText || '').trim().replace(/\s+/g,' '));
      if (r.length) rows.push(r);
    }
    rows.push([]);
  }
  wbCSV(rows, '组织人效诊断_' + wbDate() + '.csv');
}
