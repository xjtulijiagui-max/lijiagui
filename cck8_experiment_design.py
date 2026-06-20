# -*- coding: utf-8 -*-
"""
CCK8细胞增殖实验设计专家系统
针对细胞增殖检测的完整实验设计方案
"""
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def design_cck8_experiment():
    """设计CCK8细胞增殖实验"""

    print("🧫 CCK8细胞增殖实验设计专家系统")
    print("=" * 70)

    # 实验设计框架
    experiment_design = {
        "实验目的": "评估不同处理条件下细胞的增殖活性",
        "检测原理": "CCK8试剂中的WST-8被细胞脱氢酶还原产生橙黄色甲臜，颜色深浅与细胞数成正比",
        "检测仪器": "酶标仪 (450nm波长)",
        "实验周期": "通常24-96小时"
    }

    print("\n📋 实验基本信息")
    print("-" * 70)
    for key, value in experiment_design.items():
        print(f"{key}: {value}")

    # 分组设计
    print("\n" + "=" * 70)
    print("🎯 实验分组设计")
    print("-" * 70)

    grouping_design = {
        "对照组": {
            "空白对照": {
                "描述": "不含细胞，只含培养基",
                "目的": "扣除背景吸收值",
                "组成": "培养基 + CCK8试剂"
            },
            "阴性对照": {
                "描述": "含正常细胞，无药物处理",
                "目的": "确定100%细胞活性",
                "组成": "细胞 + 培养基 + CCK8试剂"
            },
            "溶剂对照": {
                "描述": "含细胞和药物溶剂（如DMSO）",
                "目的": "排除溶剂对细胞的影响",
                "组成": "细胞 + 培养基 + 溶剂 + CCK8试剂"
            }
        },
        "实验组": {
            "单剂量组": {
                "描述": "单一浓度药物处理",
                "目的": "初步评估药物活性",
                "设置": "根据文献或预实验确定浓度"
            },
            "剂量梯度组": {
                "描述": "多个浓度药物处理",
                "目的": "确定IC50和剂量-效应关系",
                "设置": "至少5个浓度点"
            },
            "阳性对照组": {
                "描述": "已知活性药物处理",
                "目的": "验证实验系统敏感性",
                "设置": "标准药物如顺铂"
            }
        }
    }

    for group_type, groups in grouping_design.items():
        print(f"\n📍 {group_type}:")
        for group_name, details in groups.items():
            print(f"   {group_name}:")
            print(f"     • 描述: {details['描述']}")
            print(f"     • 目的: {details['目的']}")
            if '组成' in details:
                print(f"     • 组成: {details['组成']}")
            if '设置' in details:
                print(f"     • 设置: {details['设置']}")

    # 浓度梯度设计
    print("\n" + "=" * 70)
    print("📊 浓度梯度设计")
    print("-" * 70)

    concentration_design = {
        "预实验浓度筛选": {
            "目的": "确定有效浓度范围",
            "建议范围": "0.1μM - 100μM",
            "稀释倍数": "10倍梯度",
            "测试浓度": "0.1, 1, 10, 100 μM"
        },
        "正式实验梯度": {
            "目的": "精确测定IC50",
            "建议范围": "基于预实验结果",
            "稀释倍数": "2倍或3倍梯度",
            "浓度点数": "至少6个点",
            "示例设置": "0.5, 1, 2, 4, 8, 16 μM"
        },
        "高浓度注意事项": {
            "DMSO浓度": "≤0.1% (v/v)",
            "溶解性问题": "高浓度可能析出",
            "细胞毒性": "避免非特异性毒性"
        }
    }

    for design_type, details in concentration_design.items():
        print(f"\n🔬 {design_type}:")
        for key, value in details.items():
            print(f"   • {key}: {value}")

    # 时间点选择
    print("\n" + "=" * 70)
    print("⏰ 孵育时间设计")
    print("-" * 70)

    time_design = {
        "时间点选择原则": {
            "对数生长期": "细胞数量对数增长的时期",
            "检测窗口": "足够信号但未达到平台期",
            "标准时间点": "24h, 48h, 72h"
        },
        "推荐时间点": {
            "快速增殖细胞": "24h, 48h, 72h",
            "一般增殖细胞": "48h, 72h, 96h",
            "慢速增殖细胞": "72h, 96h, 120h"
        },
        "时间优化": {
            "预实验": "测试24h, 48h, 72h, 96h",
            "选择标准": "信号/背景比值最大"
        }
    }

    for design_type, details in time_design.items():
        print(f"\n⏱️ {design_type}:")
        for key, value in details.items():
            if isinstance(value, list):
                print(f"   • {key}: {', '.join(value)}")
            else:
                print(f"   • {key}: {value}")

    # 96孔板布局
    print("\n" + "=" * 70)
    print("🎲 96孔板布局设计")
    print("-" * 70)

    plate_layout = {
        "边缘效应控制": {
            "方法": "避免使用外周孔或用PBS填充",
            "原因": "边缘孔蒸发效应",
            "建议": "使用中间60个孔"
        },
        "孔布局示例": {
            "第1行": "空白对照 (3个复孔)",
            "第2行": "阴性对照 (3个复孔)",
            "第3行": "溶剂对照 (3个复孔)",
            "第4-8行": "药物处理组 (不同浓度，各3个复孔)",
            "第12行": "阳性对照 (3个复孔)"
        },
        "复孔设置": {
            "生物学复孔": "不同孔的独立细胞处理",
            "技术复孔": "同一孔的重复检测",
            "建议": "至少3个生物学复孔"
        }
    }

    for layout_type, details in plate_layout.items():
        print(f"\n🎯 {layout_type}:")
        for key, value in details.items():
            print(f"   • {key}: {value}")

    # 操作流程
    print("\n" + "=" * 70)
    print("🔬 标准操作流程")
    print("-" * 70)

    protocol = {
        "Day 0 - 细胞铺板": {
            "步骤1": "胰酶消化细胞",
            "步骤2": "计数并调整细胞密度",
            "步骤3": "每孔接种100μL细胞悬液 (5000-10000细胞)",
            "步骤4": "37°C, 5% CO₂培养过夜"
        },
        "Day 1 - 药物处理": {
            "步骤1": "准备药物稀释系列",
            "步骤2": "更换培养基或直接加药",
            "步骤3": "设置不同浓度和时间点",
            "步骤4": "继续培养24-96小时"
        },
        "检测日": {
            "步骤1": "提前准备CCK8试剂 (室温平衡)",
            "步骤2": "每孔加入10μL CCK8试剂",
            "步骤3": "37°C孵育1-4小时",
            "步骤4": "酶标仪检测 (450nm)"
        }
    }

    for day, steps in protocol.items():
        print(f"\n📅 {day}:")
        for step_num, step_desc in steps.items():
            print(f"   {step_num}: {step_desc}")

    # CCK8试剂使用
    print("\n" + "=" * 70)
    print("💊 CCK8试剂使用指南")
    print("-" * 70)

    cck8_guide = {
        "试剂特点": {
            "优点": ["检测灵敏度高", "对细胞毒性低", "稳定性好"],
            "反应时间": "1-4小时 (根据细胞类型调整)",
            "检测范围": "通常检测500-50000个细胞"
        },
        "使用注意事项": {
            "避光": "CCK8试剂对光敏感",
            "温度": "使用前恢复至室温",
            "混合": "轻轻混匀，避免气泡",
            "添加量": "通常为培养体积的10%"
        },
        "优化建议": {
            "预实验": "确定最佳检测时间点",
            "细胞密度": "优化细胞接种密度",
            "线性范围": "确保在标准曲线线性范围内"
        }
    }

    for guide_type, details in cck8_guide.items():
        print(f"\n📝 {guide_type}:")
        for key, value in details.items():
            if isinstance(value, list):
                print(f"   • {key}: {', '.join(value)}")
            else:
                print(f"   • {key}: {value}")

    # 统计分析方法
    print("\n" + "=" * 70)
    print("📈 统计分析方法")
    print("-" * 70)

    statistical_methods = {
        "数据处理": {
            "空白扣除": "扣除空白对照的平均吸收值",
            "归一化": "以阴性对照为100%细胞活性",
            "计算公式": "细胞活性(%) = (处理组OD - 空白)/(阴性对照 - 空白) × 100%"
        },
        "统计检验": {
            "复孔平均值": "计算各组的平均值和标准差",
            "组间比较": "使用t检验或单因素方差分析",
            "显著性水平": "通常p<0.05认为有显著差异"
        },
        "剂量效应分析": {
            "IC50计算": "使用GraphPad Prism等软件拟合剂量效应曲线",
            "拟合模型": "log(抑制剂) vs 响应 (四参数logistic模型)",
            "置信区间": "计算95%置信区间"
        },
        "图表制作": {
            "柱状图": "展示各组的细胞活性比较",
            "剂量效应曲线": "展示浓度-效应关系",
            "误差线": "显示标准差或标准误"
        }
    }

    for stat_type, methods in statistical_methods.items():
        print(f"\n📊 {stat_type}:")
        for method_name, description in methods.items():
            print(f"   • {method_name}: {description}")

    # 质量控制
    print("\n" + "=" * 70)
    print("✅ 质量控制标准")
    print("-" * 70)

    quality_control = {
        "实验内对照": {
            "阴性对照": "CV值应<15%",
            "阳性对照": "应显示预期的抑制效果",
            "溶剂对照": "与阴性对照差异<10%"
        },
        "复孔一致性": {
            "标准": "CV值<20%为可接受",
            "异常值": "超过平均值±2SD的可考虑剔除"
        },
        "信号质量": {
            "信噪比": "信号/空白比值应>10",
            "Z因子": "Z因子>0.5为高质量实验",
            "Z因子计算": "1 - (3σ阳性 + 3σ阴性)/|均值阳性 - 均值阴性|"
        },
        "可重复性": {
            "实验间": "不同日实验结果变异<25%",
            "操作间": "不同操作者结果变异<20%"
        }
    }

    for qc_type, standards in quality_control.items():
        print(f"\n🎖️ {qc_type}:")
        for standard, criteria in standards.items():
            print(f"   • {standard}: {criteria}")

    # 常见问题及解决
    print("\n" + "=" * 70)
    print("⚠️ 常见问题及解决方案")
    print("-" * 70)

    troubleshooting = {
        "信号过低": {
            "可能原因": ["细胞密度过低", "孵育时间不足", "CCK8试剂失效"],
            "解决方法": ["增加细胞接种密度", "延长孵育时间至4小时", "更换新鲜CCK8试剂"]
        },
        "信号过高": {
            "可能原因": ["细胞密度过高", "过度生长", "背景吸收过高"],
            "解决方法": ["减少细胞接种密度", "缩短孵育时间", "确保正确扣除空白"]
        },
        "孔间变异大": {
            "可能原因": ["加样不均匀", "细胞接种不均", "边缘效应"],
            "解决方法": ["使用多通道移液器", "充分混匀细胞悬液", "避免使用边缘孔"]
        },
        "线性范围超出": {
            "可能原因": ["细胞浓度过高或过低", "检测时间不当"],
            "解决方法": ["优化细胞密度范围", "选择合适检测时间", "确保在标准曲线线性范围"]
        }
    }

    for problem, solutions in troubleshooting.items():
        print(f"\n❓ {problem}:")
        for category, items in solutions.items():
            if isinstance(items, list):
                print(f"   • {category}: {', '.join(items)}")
            else:
                print(f"   • {category}: {items}")

    # 实验示例
    print("\n" + "=" * 70)
    print("🧪 完整实验示例")
    print("-" * 70)

    example_experiment = {
        "研究目标": "测试化合物X对肺癌细胞A549的增殖抑制",
        "细胞系": "A549 (非小细胞肺癌)",
        "接种密度": "5000 cells/孔",
        "培养时间": "72小时",
        "药物处理": {
            "测试化合物": {
                "溶剂": "DMSO",
                "储备浓度": "10mM",
                "工作浓度": "0.1, 0.5, 1, 5, 10, 50 μM"
            },
            "阳性对照": {
                "药物": "顺铂",
                "浓度": "10 μM"
            }
        },
        "分组设置": {
            "第1行": "空白对照 (培养基+10μL CCK8, 3复孔)",
            "第2行": "阴性对照 (细胞+溶剂, 3复孔)",
            "第3-8行": "测试化合物 (6个浓度, 各3复孔)",
            "第9行": "阳性对照 (顺铂10μM, 3复孔)",
            "其余孔": "PBS填充 (减少边缘效应)"
        },
        "时间点": "0h, 24h, 48h, 72h, 96h"
    }

    print("\n📋 实验设置:")
    for key, value in example_experiment.items():
        if key == "药物处理":
            for drug_type, details in value.items():
                print(f"   {drug_type}:")
                for param, setting in details.items():
                    print(f"     • {param}: {setting}")
        elif key == "分组设置":
            print(f"   {key}:")
            for row, description in value.items():
                print(f"     • {row}: {description}")
        else:
            print(f"   • {key}: {value}")

    # 结果解读
    print("\n" + "=" * 70)
    print("📊 结果解读和报告")
    print("-" * 70)

    result_interpretation = {
        "IC50解读": {
            "定义": "抑制50%细胞生长的药物浓度",
            "意义": "IC50越低，药物活性越强",
            "比较": "与标准药物比较IC50值"
        },
        "细胞毒性分级": {
            "高毒性": "IC50 < 1 μM",
            "中等毒性": "IC50 1-10 μM",
            "低毒性": "IC50 > 10 μM"
        },
        "选择性指数": {
            "定义": "正常细胞IC50 / 肿瘤细胞IC50",
            "意义": "指数越高，选择性越好",
            "理想值": ">10倍为良好的选择性"
        }
    }

    for interpretation_type, criteria in result_interpretation.items():
        print(f"\n📈 {interpret_type}:")
        for criterion, meaning in criteria.items():
            print(f"   • {criterion}: {meaning}")

    print("\n" + "=" * 70)
    print("🎉 CCK8实验设计完成！")
    print("=" * 70)

    print("\n💡 后续建议:")
    print("1. 根据具体实验条件调整设计")
    print("2. 进行预实验优化参数")
    print("3. 建立标准操作流程")
    print("4. 培训操作人员")
    print("5. 建立数据记录模板")

def main():
    """主函数"""
    design_cck8_experiment()

if __name__ == "__main__":
    main()