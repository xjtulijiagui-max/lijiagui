# -*- coding: utf-8 -*-
"""
简化版肺癌药物虚拟筛选系统
不依赖RDKit，使用基本化学计算
"""
import sys
import io
import re

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class SimpleVirtualScreening:
    """简化版虚拟筛选系统"""

    def __init__(self):
        """初始化筛选系统"""
        self.target_info = self._load_target_info()
        self.admet_rules = self._load_admet_rules()

    def _load_target_info(self) -> dict:
        """加载靶点信息"""
        return {
            "EGFR": {
                "description": "表皮生长因子受体 - 酪氨酸激酶抑制剂",
                "key_features": [
                    "喹唑啉或类似杂环骨架",
                    "4-苯胺基取代基",
                    "疏水尾巴结构",
                    "铰链区氢键供体/受体"
                ],
                "ideal_smiles_patterns": [
                    "c1ccc2ncnc(Nc3ccc(cc3)F)nc2c1",  # 喹唑啉骨架
                    "C1=CC=C(C=C1)NC2=NC=CC(=N2)C"    # 苯胺基结构
                ],
                "reference_drugs": {
                    "吉非替尼": {"MW": 446.9, "LogP": 3.8, "HBD": 1, "HBA": 6, "RotBonds": 8},
                    "奥希替尼": {"MW": 499.6, "LogP": 3.5, "HBD": 2, "HBA": 8, "RotBonds": 10}
                },
                "screening_criteria": {
                    "MW_range": (400, 500),
                    "LogP_range": (2, 5),
                    "HBD_max": 3,
                    "HBA_max": 10,
                    "RotBonds_max": 12,
                    "aromatic_rings": 2,
                    "key_features": ["喹唑啉", "嘧啶", "苯胺", "氟取代"]
                }
            },
            "ALK": {
                "description": "间变性淋巴瘤激酶抑制剂",
                "key_features": [
                    "二氨基嘧啶核心",
                    "卤素取代",
                    "疏水取代基",
                    "柔性连接子"
                ],
                "ideal_smiles_patterns": [
                    "c1ccc(cc1)NC2=NC=CC(=N2)C",  # 苯胺基嘧啶
                    "Clc1ccc(cc1)N"               # 氯苯基结构
                ],
                "reference_drugs": {
                    "克唑替尼": {"MW": 450.3, "LogP": 3.1, "HBD": 1, "HBA": 5, "RotBonds": 9},
                    "阿来替尼": {"MW": 383.7, "LogP": 2.8, "HBD": 1, "HBA": 4, "RotBonds": 6}
                },
                "screening_criteria": {
                    "MW_range": (350, 500),
                    "LogP_range": (2, 4),
                    "HBD_max": 2,
                    "HBA_max": 6,
                    "RotBonds_max": 10,
                    "aromatic_rings": 2,
                    "key_features": ["嘧啶", "氯", "氟", "苯基"]
                }
            },
            "KRAS_G12C": {
                "description": "KRAS G12C共价抑制剂",
                "key_features": [
                    "丙烯酰胺弹头（共价结合）",
                    "大环或双环结构",
                    "疏水口袋结合基团",
                    "开关II区域相互作用"
                ],
                "ideal_smiles_patterns": [
                    "C=CC(=O)N",                    # 丙烯酰胺
                    "C1CCN(CC1)C2=NC=CC(=N2)C"    # 哌啶-嘧啶
                ],
                "reference_drugs": {
                    "索托拉西布": {"MW": 560.6, "LogP": 4.1, "HBD": 2, "HBA": 5, "RotBonds": 11},
                    "阿达格拉西布": {"MW": 521.1, "LogP": 3.9, "HBD": 2, "HBA": 6, "RotBonds": 10}
                },
                "screening_criteria": {
                    "MW_range": (450, 600),
                    "LogP_range": (3, 5),
                    "HBD_max": 3,
                    "HBA_max": 8,
                    "RotBonds_max": 15,
                    "aromatic_rings": 2,
                    "key_features": ["丙烯酰胺", "嘧啶", "大环", "卤素"]
                }
            },
            "PD-1/PD-L1": {
                "description": "免疫检查点抑制剂",
                "key_features": [
                    "大分子量（小分子难度高）",
                    "多环芳香系统",
                    "极性基团",
                    "柔性连接子"
                ],
                "ideal_smiles_patterns": [
                    # 小分子PD-1/PD-L1抑制剂相对较少
                    "c1ccc(cc1)"  # 基础芳香环
                ],
                "reference_drugs": {
                    "CA-170（实验性）": {"MW": 450.0, "LogP": 3.0, "HBD": 2, "HBA": 6, "RotBonds": 10}
                },
                "screening_criteria": {
                    "MW_range": (400, 600),
                    "LogP_range": (2, 4),
                    "HBD_max": 3,
                    "HBA_max": 10,
                    "RotBonds_max": 15,
                    "aromatic_rings": 3,
                    "key_features": ["多环", "酰胺", "胺基", "羟基"]
                }
            }
        }

    def _load_admet_rules(self) -> dict:
        """加载ADMET评估规则"""
        return {
            "Lipinski_violations": {
                "MW_max": 500,
                "LogP_max": 5,
                "HBD_max": 5,
                "HBA_max": 10,
                "max_violations": 1
            },
            "Veber_rules": {
                "RotBonds_max": 10,
                "TPSA_max": 140,
                "max_violations": 1
            },
            "drug_likeness": {
                "QED_min": 0.5,
                "logS_min": -5
            },
            "toxicity_alerts": {
                "reactive_groups": [
                    "丙烯醛", "环氧化物", "醌", "重氮"
                ],
                "structural_alerts": [
                    "多卤代芳烃", "硝基芳烃", "芳胺"
                ]
            }
        }

    def simple_smiles_analysis(self, smiles: str) -> dict:
        """简单的SMILES分析"""
        analysis = {
            "atom_count": 0,
            "aromatic_atoms": 0,
            "heteroatoms": 0,
            "rings": 0,
            "functional_groups": [],
            "reactive_groups": []
        }

        try:
            # 原子计数
            atom_pattern = r'[A-Z][a-z]?\d*'
            atoms = re.findall(atom_pattern, smiles)
            analysis["atom_count"] = len(atoms)

            # 芳香原子
            aromatic_pattern = r'[cnops]\d*'
            aromatic = re.findall(aromatic_pattern, smiles)
            analysis["aromatic_atoms"] = len(aromatic)

            # 杂原子
            heteroatom_pattern = r'[NOSFBrCl][a-z]?\d*'
            heteroatoms = re.findall(heteroatom_pattern, smiles)
            analysis["heteroatoms"] = len(heteroatoms)

            # 环结构检测
            ring_pattern = r'[a-z]\d'
            rings = re.findall(ring_pattern, smiles.lower())
            analysis["rings"] = max([int(r[1:]) for r in rings]) if rings else 0

            # 功能基团检测
            if "C(=O)N" in smiles:
                analysis["functional_groups"].append("酰胺")
            if "C(=O)O" in smiles:
                analysis["functional_groups"].append("羧酸")
            if "N" in smiles:
                analysis["functional_groups"].append("胺/含氮杂环")
            if "Cl" in smiles or "Br" in smiles:
                analysis["functional_groups"].append("卤素")

            # 反应性基团检测
            reactive_patterns = ["C=CC=O", "epoxide", "quinone"]
            for pattern in reactive_patterns:
                if pattern in smiles:
                    analysis["reactive_groups"].append(pattern)

        except Exception as e:
            analysis["error"] = str(e)

        return analysis

    def calculate_simple_properties(self, smiles: str) -> dict:
        """计算简单的分子性质"""
        props = {
            "MW": 0,
            "LogP_estimate": 0,
            "HBD": 0,
            "HBA": 0,
            "RotBonds_estimate": 0,
            "rings": 0
        }

        try:
            # 基于SMILES的简单估算
            analysis = self.simple_smiles_analysis(smiles)

            # 分子量估算（基于原子数和类型）
            atom_weights = {"C": 12, "N": 14, "O": 16, "S": 32, "F": 19, "Cl": 35.5, "Br": 80, "I": 127}
            total_weight = 0

            atom_pattern = r'[A-Z][a-z]?\d*'
            atoms = re.findall(atom_pattern, smiles)

            for atom in atoms:
                element = atom[0]
                if element in atom_weights:
                    total_weight += atom_weights[element]

            props["MW"] = total_weight

            # LogP估算（基于疏水性）
            carbons = len([a for a in atoms if a.startswith("C")])
            heteroatoms = analysis["heteroatoms"]
            props["LogP_estimate"] = round((carbons - heteroatoms * 1.5) / 10, 2)
            props["LogP_estimate"] = max(0, min(props["LogP_estimate"], 10))  # 限制在0-10范围

            # 氢键供受体
            props["HBD"] = smiles.count("N") + smiles.count("O")  # 简化估算
            props["HBA"] = props["HBD"] + smiles.count("S")  # 加上硫原子

            # 旋转键估算
            single_bonds = smiles.count("-") + smiles.count(")") + smiles.count("(")
            props["RotBonds_estimate"] = max(0, single_bonds - 2)

            # 环数量
            props["rings"] = analysis["rings"]

        except Exception as e:
            props["error"] = str(e)

        return props

    def evaluate_drug_likeness(self, smiles: str) -> dict:
        """评估药物相似性"""
        props = self.calculate_simple_properties(smiles)
        evaluation = {}

        if "error" in props:
            return {"error": props["error"]}

        # Lipinski规则检验
        lipinski_violations = 0

        if props["MW"] > 500:
            lipinski_violations += 1

        if props["LogP_estimate"] > 5:
            lipinski_violations += 1

        if props["HBD"] > 5:
            lipinski_violations += 1

        if props["HBA"] > 10:
            lipinski_violations += 1

        evaluation["Lipinski_violations"] = lipinski_violations
        evaluation["Lipinski_compliant"] = lipinski_violations <= 1

        # Veber规则检验
        veber_violations = 0

        if props["RotBonds_estimate"] > 10:
            veber_violations += 1

        # TPSA无法准确计算，假设基于杂原子数量
        estimated_tpsa = props["HBA"] * 12 + props["HBD"] * 8
        if estimated_tpsa > 140:
            veber_violations += 1

        evaluation["Veber_violations"] = veber_violations
        evaluation["Veber_compliant"] = veber_violations <= 1

        # 综合评分
        score = 100
        score -= lipinski_violations * 20
        score -= veber_violations * 10

        evaluation["drug_likeness_score"] = max(0, score)

        return evaluation

    def predict_simple_admet(self, smiles: str) -> dict:
        """简单的ADMET预测"""
        props = self.calculate_simple_properties(smiles)
        admet = {}

        if "error" in props:
            return {"error": props["error"]}

        # 吸收预测
        if props["LogP_estimate"] > 5:
            admet["吸收"] = "可能较差（LogP过高）"
        elif props["LogP_estimate"] < 0:
            admet["吸收"] = "可能较差（LogP过低）"
        else:
            admet["吸收"] = "可能良好"

        # 代谢稳定性
        if props["rings"] > 3:
            admet["代谢稳定性"] = "可能较好（多环结构）"
        else:
            admet["代谢稳定性"] = "需要验证"

        # 毒性风险
        admet["毒性风险"] = "需要实验验证"

        # 脱靶风险
        if props["LogP_estimate"] > 4:
            admet["脱靶风险"] = "可能较高（高疏水性）"
        else:
            admet["脱靶风险"] = "可能较低"

        return admet

    def screen_compound(self, smiles: str, target: str) -> dict:
        """筛选化合物"""
        result = {
            "smiles": smiles,
            "target": target,
            "analysis": {},
            "admet_prediction": {},
            "screening_result": {}
        }

        if target not in self.target_info:
            result["error"] = f"未知靶点: {target}"
            return result

        target_info = self.target_info[target]

        # 基本分析
        result["analysis"] = self.simple_smiles_analysis(smiles)
        props = self.calculate_simple_properties(smiles)
        result["properties"] = props

        # ADMET预测
        result["admet_prediction"] = self.predict_simple_admet(smiles)

        # 药物相似性
        result["drug_likeness"] = self.evaluate_drug_likeness(smiles)

        # 靶点特异性筛选
        criteria = target_info["screening_criteria"]
        screening_score = 0
        screening_reasons = []

        # 分子量检查
        mw_min, mw_max = criteria["MW_range"]
        if mw_min <= props["MW"] <= mw_max:
            screening_score += 25
            screening_reasons.append("✅ 分子量符合范围")
        else:
            screening_reasons.append(f"❌ 分子量不在范围（{mw_min}-{mw_max}）")

        # LogP检查
        logp_min, logp_max = criteria["LogP_range"]
        if logp_min <= props["LogP_estimate"] <= logp_max:
            screening_score += 25
            screening_reasons.append("✅ LogP符合范围")
        else:
            screening_reasons.append(f"❌ LogP不在范围（{logp_min}-{logp_max}）")

        # 氢键检查
        if props["HBD"] <= criteria["HBD_max"]:
            screening_score += 15
            screening_reasons.append("✅ 氢键供体符合要求")
        else:
            screening_reasons.append(f"❌ 氢键供体过多（>{criteria['HBD_max']}）")

        if props["HBA"] <= criteria["HBA_max"]:
            screening_score += 15
            screening_reasons.append("✅ 氢键受体符合要求")
        else:
            screening_reasons.append(f"❌ 氢键受体过多（>{criteria['HBA_max']}）")

        # 旋转键检查
        if props["RotBonds_estimate"] <= criteria["RotBonds_max"]:
            screening_score += 10
            screening_reasons.append("✅ 旋转键数量符合要求")
        else:
            screening_reasons.append(f"❌ 旋转键过多（>{criteria['RotBonds_max']}）")

        # 药物相似性
        drug_likeness = self.evaluate_drug_likeness(smiles)
        if drug_likeness.get("Lipinski_compliant", False):
            screening_score += 10
            screening_reasons.append("✅ 符合Lipinski规则")

        result["screening_result"] = {
            "score": screening_score,
            "max_score": 100,
            "reasons": screening_reasons,
            "passed": screening_score >= 60
        }

        return result

def demo_screening():
    """演示虚拟筛选"""
    print("🧬 肺癌药物虚拟筛选演示（简化版）")
    print("=" * 70)

    screener = SimpleVirtualScreening()

    # 演示化合物
    demo_compounds = [
        {
            "name": "候选化合物A（EGFR抑制剂样）",
            "smiles": "COc1ccc2nc(sc2c1)NC(=O)c3ccc(cc3)N",
            "target": "EGFR"
        },
        {
            "name": "候选化合物B（ALK抑制剂样）",
            "smiles": "Clc1ccc(cc1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)Cl",
            "target": "ALK"
        },
        {
            "name": "候选化合物C（KRAS G12C抑制剂样）",
            "smiles": "C=CC(=O)NC1CCN(CC1)C2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)Cl",
            "target": "KRAS_G12C"
        }
    ]

    print("\n📊 可用靶点信息")
    print("-" * 70)

    for target, info in screener.target_info.items():
        print(f"\n🎯 {target}: {info['description']}")
        print(f"   关键特征: {', '.join(info['key_features'][:2])}")

    print("\n" + "=" * 70)
    print("🔬 开始虚拟筛选")
    print("=" * 70)

    for compound in demo_compounds:
        print(f"\n🧪 {compound['name']}")
        print("-" * 70)

        result = screener.screen_compound(compound["smiles"], compound["target"])

        if "error" in result:
            print(f"❌ 错误: {result['error']}")
            continue

        # 显示筛选结果
        print(f"📊 筛选评分: {result['screening_result']['score']}/{result['screening_result']['max_score']}")

        print("\n📋 筛选详情:")
        for reason in result["screening_result"]["reasons"]:
            print(f"   {reason}")

        # 显示基本性质
        print(f"\n📏 分子性质:")
        props = result["properties"]
        print(f"   分子量: {props['MW']:.1f}")
        print(f"   LogP估算: {props['LogP_estimate']:.2f}")
        print(f"   氢键供体: {props['HBD']}")
        print(f"   氢键受体: {props['HBA']}")
        print(f"   旋转键: {props['RotBonds_estimate']}")

        # ADMET预测
        print(f"\n🔬 ADMET预测:")
        for category, prediction in result["admet_prediction"].items():
            print(f"   {category}: {prediction}")

        # 药物相似性
        drug_likeness = result["drug_likeness"]
        print(f"\n💊 药物相似性:")
        print(f"   Lipinski符合: {'✅' if drug_likeness.get('Lipinski_compliant', False) else '❌'}")
        print(f"   Veber符合: {'✅' if drug_likeness.get('Veber_compliant', False) else '❌'}")
        print(f"   综合评分: {drug_likeness.get('drug_likeness_score', 0)}/100")

        # 参考药物比较
        print(f"\n💡 与参考药物比较:")
        target = compound["target"]
        if target in screener.target_info:
            ref_drugs = screener.target_info[target]["reference_drugs"]
            for drug_name, drug_data in ref_drugs.items():
                print(f"   {drug_name}: MW={drug_data['MW']}, LogP={drug_data['LogP']}")

        print(f"\n🎯 筛选结果: {'✅ 通过' if result['screening_result']['passed'] else '❌ 未通过'}")

        print("-" * 70)

    print("\n" + "=" * 70)
    print("🎉 虚拟筛选演示完成")
    print("=" * 70)

    print("\n📝 使用说明:")
    print("1. 这是简化版虚拟筛选，用于快速评估")
    print("2. 对于更精确的分析，建议安装RDKit:")
    print("   pip install rdkit")
    print("   或: conda install -c conda-forge rdkit")
    print("3. 本版本提供初步筛选和ADMET预测")
    print("4. 实际药物开发需要实验验证")

def main():
    """主函数"""
    demo_screening()

if __name__ == "__main__":
    main()
