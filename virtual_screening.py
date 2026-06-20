# -*- coding: utf-8 -*-
"""
基于本地工具的肺癌药物靶点虚拟筛选
针对已验证的靶点进行候选化合物筛选和ADMET预测
"""
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, QED, Crippen
from rdkit.Chem.FilterCatalog import FilterCatalog, FilterCatalogParams
import pandas as pd
from typing import Dict, List, Tuple
import json

class LungCancerVirtualScreening:
    """肺癌药物虚拟筛选系统"""

    def __init__(self):
        """初始化筛选系统"""
        self.target_info = self._load_target_info()
        self.reference_drugs = self._load_reference_drugs()
        self.admet_thresholds = self._get_admet_thresholds()

    def _load_target_info(self) -> Dict:
        """加载靶点信息"""
        return {
            "EGFR": {
                "type": "酪氨酸激酶受体",
                "mutation_focus": "T790M, L858R, exon19del",
                "binding_site_features": "ATP结合口袋，疏水性较强",
                "key_interactions": "铰链区氢键，疏水口袋相互作用",
                "ideal_properties": {
                    "MW": "400-500",
                    "LogP": "2-4",
                    "HBD": "1-3",
                    "HBA": "3-6"
                }
            },
            "ALK": {
                "type": "酪氨酸激酶",
                "mutation_focus": "EML4-ALK融合",
                "binding_site_features": "ATP结合位点，相对保守",
                "key_interactions": "铰链区相互作用，溶剂暴露区域",
                "ideal_properties": {
                    "MW": "350-450",
                    "LogP": "1-3",
                    "HBD": "1-2",
                    "HBA": "4-5"
                }
            },
            "KRAS_G12C": {
                "type": "小GTP酶",
                "mutation_focus": "G12C突变，半胱氨酸共价结合",
                "binding_site_features": "Switch II口袋，需要共价结合",
                "key_interactions": "与Cys12形成共价键，疏水相互作用",
                "ideal_properties": {
                    "MW": "400-550",
                    "LogP": "2-4",
                    "HBD": "1-2",
                    "HBA": "4-7"
                }
            },
            "PD-1/PD-L1": {
                "type": "免疫检查点",
                "mutation_focus": "蛋白-蛋白相互作用界面",
                "binding_site_features": "大分子蛋白表面，传统小分子难度大",
                "key_interactions": "阻断PD-1与PD-L1结合",
                "ideal_properties": {
                    "MW": "500-700",
                    "LogP": "1-3",
                    "HBD": "2-4",
                    "HBA": "6-10"
                }
            }
        }

    def _load_reference_drugs(self) -> Dict:
        """加载参考药物数据"""
        return {
            "EGFR": {
                "吉非替尼": {"SMILES": "COC1=C(C=CNC(=O)C2=CC=CC=C2)NC(=O)C3=CC=C(C=C3)F", "MW": 446.9, "LogP": 3.8},
                "奥希替尼": {"SMILES": "CC1=C(C=C(C=C1)NC(=O)C2=CN3C(=C2)C=C(C(=C3)N)NC4=C(C=CC(=C4)Cl)Cl)NC(=O)C5=CC=CC=C5N", "MW": 499.6, "LogP": 3.5}
            },
            "ALK": {
                "克唑替尼": {"SMILES": "ClC1=CC=C(C=C1)NC2=NC=C(C=N2)C3=CC=CC(=C3)S(=O)(=O)N", "MW": 450.3, "LogP": 3.1},
                "阿来替尼": {"SMILES": "CC(C)C1=CC=C(C=C1)C2=NC(=NC2)C3=CN(C4=CC=CC(=C34)Cl)Cl", "MW": 383.7, "LogP": 2.8}
            },
            "KRAS_G12C": {
                "索托拉西布": {"SMILES": "CC1=C(C=C(C=C1)N)C2=NC(=NC2)C3=CN(C4=CC=CC(=C34)Cl)Cl", "MW": 560.6, "LogP": 4.1},
                "阿达格拉西布": {"SMILES": "C1CCN(C1)C2=NC=C(C=N2)C3=CN(C4=CC=CC(=C34)Cl)Cl", "MW": 521.1, "LogP": 3.9}
            }
        }

    def _get_admet_thresholds(self) -> Dict:
        """获取ADMET阈值标准"""
        return {
            "Lipinski": {
                "MW_max": 500,
                "LogP_max": 5,
                "HBD_max": 5,
                "HBA_max": 10
            },
            "Veber": {
                "RotBonds_max": 10,
                "TPSA_max": 140
            },
            "drug_likeness": {
                "QED_min": 0.5,
                "logS_min": -5
            },
            "toxicity": {
                "hERG_inhibition_risk": "需要关注",
                "CYP_inhibition_risk": "需要评估"
            }
        }

    def calculate_molecular_properties(self, smiles: str) -> Dict:
        """计算分子性质"""
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return {"error": "无效的SMILES"}

            properties = {
                # 基本物理化学性质
                "MW": Descriptors.MolWt(mol),
                "LogP": Crippen.MolLogP(mol),
                "LogS": -Descriptors.MolLogS(mol),  # 溶解度近似值
                "TPSA": Descriptors.TPSA(mol),
                "RotBonds": Descriptors.NumRotatableBonds(mol),
                "HBD": Descriptors.NumHDonors(mol),
                "HBA": Descriptors.NumHAcceptors(mol),
                "Rings": Descriptors.RingCount(mol),
                "AromaticRings": Descriptors.NumAromaticRings(mol),

                # 药物相似性
                "QED": QED.qed(mol),
                "FormalCharge": Chem.rdmolops.GetFormalCharge(mol),

                # 药丸规则检验
                "Lipinski_violations": 0,
                "Veber_violations": 0
            }

            # Lipinski规则检验
            if properties["MW"] > 500:
                properties["Lipinski_violations"] += 1
            if properties["LogP"] > 5:
                properties["Lipinski_violations"] += 1
            if properties["HBD"] > 5:
                properties["Lipinski_violations"] += 1
            if properties["HBA"] > 10:
                properties["Lipinski_violations"] += 1

            # Veber规则检验
            if properties["RotBonds"] > 10:
                properties["Veber_violations"] += 1
            if properties["TPSA"] > 140:
                properties["Veber_violations"] += 1

            return properties

        except Exception as e:
            return {"error": str(e)}

    def predict_admet(self, smiles: str) -> Dict:
        """预测ADMET性质"""
        properties = self.calculate_molecular_properties(smiles)

        if "error" in properties:
            return properties

        admet_prediction = {
            "吸收": self._predict_absorption(properties),
            "分布": self._predict_distribution(properties),
            "代谢": self._predict_metabolism(smiles, properties),
            "排泄": self._predict_excretion(properties),
            "毒性": self._predict_toxicity(smiles, properties)
        }

        return admet_prediction

    def _predict_absorption(self, props: Dict) -> Dict:
        """预测吸收性质"""
        absorption = {}

        # 口服生物利用度预测
        bioavailability = "高"
        if props["LogP"] > 5:
            bioavailability = "中等（疏水性过高）"
        elif props["LogP"] < 0:
            bioavailability = "低（亲水性过强）"
        elif props["TPSA"] > 140:
            bioavailability = "低（TPSA过高）"
        elif props["MW"] > 500:
            bioavailability = "中等（分子量较大）"

        absorption["口服生物利用度"] = bioavailability
        absorption["Caco-2渗透性"] = "良好" if props["LogP"] > 0 and props["TPSA"] < 140 else "可能较差"

        return absorption

    def _predict_distribution(self, props: Dict) -> Dict:
        """预测分布性质"""
        distribution = {}

        # 蛋白结合率预测
        if props["LogP"] > 4:
            distribution["蛋白结合率"] = "高（>95%）"
        elif props["LogP"] > 2:
            distribution["蛋白结合率"] = "中等（80-95%）"
        else:
            distribution["蛋白结合率"] = "低（<80%）"

        # 组织分布
        if props["LogP"] > 3 and props["TPSA"] < 90:
            distribution["组织分布"] = "良好（包括肺部）"
        else:
            distribution["组织分布"] = "一般"

        # 血脑屏障
        if props["LogP"] > 2 and props["TPSA"] < 90:
            distribution["血脑屏障"] = "可通过"
        else:
            distribution["血脑屏障"] = "难以通过"

        return distribution

    def _predict_metabolism(self, smiles: str, props: Dict) -> Dict:
        """预测代谢性质"""
        metabolism = {}

        mol = Chem.MolFromSmiles(smiles)

        # 代谢稳定性预测
        stability_score = 0
        if props["LogP"] < 5:  # 合理的疏水性
            stability_score += 1
        if props["AromaticRings"] <= 3:  # 芳环数量适中
            stability_score += 1
        if props["RotBonds"] <= 10:  # 旋转键数量适中
            stability_score += 1

        if stability_score >= 3:
            metabolism["代谢稳定性"] = "良好（t1/2 > 6小时）"
        elif stability_score >= 2:
            metabolism["代谢稳定性"] = "中等（t1/2 3-6小时）"
        else:
            metabolism["代谢稳定性"] = "较差（t1/2 < 3小时）"

        # CYP450相互作用预测
        metabolism["CYP3A4底物可能性"] = "中等" if props["MW"] > 400 else "低"
        metabolism["CYP2D6底物可能性"] = "中等" if props["HBD"] > 0 else "低"

        return metabolism

    def _predict_excretion(self, props: Dict) -> Dict:
        """预测排泄性质"""
        excretion = {}

        # 主要排泄途径
        if props["LogP"] > 3:
            excretion["主要排泄途径"] = "胆汁排泄（代谢物）"
        else:
            excretion["主要排泄途径"] = "肾脏排泄（原药+代谢物）"

        # 清除率
        if props["MW"] < 400 and props["LogP"] < 3:
            excretion["清除率"] = "高"
        elif props["MW"] > 500 or props["LogP"] > 4:
            excretion["清除率"] = "低"
        else:
            excretion["清除率"] = "中等"

        return excretion

    def _predict_toxicity(self, smiles: str, props: Dict) -> Dict:
        """预测毒性"""
        toxicity = {}

        mol = Chem.MolFromSmiles(smiles)

        # hERG抑制风险
        herg_risk = 0
        if props["LogP"] > 4:  # 疏水性过高
            herg_risk += 1
        if props["TPSA"] < 75:  # TPSA过低
            herg_risk += 1
        if props["MW"] > 450:  # 分子量过大
            herg_risk += 1

        if herg_risk >= 2:
            toxicity["hERG抑制风险"] = "高（需要优化）"
        elif herg_risk == 1:
            toxicity["hERG抑制风险"] = "中等（需要关注）"
        else:
            toxicity["hERG抑制风险"] = "低"

        # 肝毒性风险
        toxicity["肝毒性风险"] = "需要实验验证"

        # 骨髓抑制
        toxicity["骨髓抑制风险"] = "需要实验验证"

        # 反应性基团检测
        try:
            # 创建PAINS过滤器
            filter_params = FilterCatalogParams()
            filter_params.AddCatalog(FilterCatalogParams.FilterCatalogs.PAINS_A)
            filter_catalog = FilterCatalog(filter_params)

            mol = Chem.MolFromSmiles(smiles)
            entry = filter_catalog.GetFirstMatch(mol)

            if entry:
                toxicity["PAINS警示"] = "检测到潜在问题基团"
            else:
                toxicity["PAINS警示"] = "无问题基团"

        except:
            toxicity["PAINS警示"] = "无法评估"

        return toxicity

    def evaluate_off_target_risk(self, smiles: str) -> Dict:
        """评估脱靶风险"""
        mol = Chem.MolFromSmiles(smiles)
        props = self.calculate_molecular_properties(smiles)

        if "error" in props:
            return {"error": "无法计算分子性质"}

        off_target_risks = {}

        # 激酶交叉反应风险
        kinase_risk = 0
        if props["LogP"] > 3:  # 激酶抑制剂通常疏水性较高
            kinase_risk += 1
        if props["HBD"] >= 1 and props["HBA"] >= 3:  # 氢键供受体适中
            kinase_risk += 1
        if 400 <= props["MW"] <= 550:  # 分子量范围合理
            kinase_risk += 1

        if kinase_risk >= 2:
            off_target_risks["激酶交叉反应"] = "高风险（符合激酶抑制剂特征）"
        else:
            off_target_risks["激酶交叉反应"] = "低风险"

        # CYP抑制风险
        off_target_risks["CYP抑制风险"] = "需要实验验证"

        # 核受体相互作用
        off_target_risks["核受体相互作用"] = "需要实验验证"

        return off_target_risks

    def rank_candidates(self, candidates: List[Dict], target: str) -> List[Dict]:
        """对候选化合物进行排序"""
        ranked_candidates = []

        for candidate in candidates:
            score = 0
            smiles = candidate.get("SMILES", "")

            # 计算分子性质
            props = self.calculate_molecular_properties(smiles)
            if "error" in props:
                continue

            # 药物相似性评分（40%）
            if props["QED"] > 0.7:
                score += 40
            elif props["QED"] > 0.5:
                score += 30
            else:
                score += 10

            # Lipinski规则符合性（20%）
            if props["Lipinski_violations"] == 0:
                score += 20
            elif props["Lipinski_violations"] == 1:
                score += 10

            # Veber规则符合性（10%）
            if props["Veber_violations"] == 0:
                score += 10
            elif props["Veber_violations"] == 1:
                score += 5

            # 靶点特异性（30%）
            target_props = self.target_info.get(target, {}).get("ideal_properties", {})
            if target_props:
                try:
                    mw_range = target_props.get("MW", "0-1000").split("-")
                    if float(mw_range[0]) <= props["MW"] <= float(mw_range[1]):
                        score += 10

                    logp_range = target_props.get("LogP", "0-10").split("-")
                    if float(logp_range[0]) <= props["LogP"] <= float(logp_range[1]):
                        score += 10

                    hbd_range = target_props.get("HBD", "0-10").split("-")
                    if float(hbd_range[0]) <= props["HBD"] <= float(hbd_range[1]):
                        score += 5

                    hba_range = target_props.get("HBA", "0-20").split("-")
                    if float(hba_range[0]) <= props["HBA"] <= float(hba_range[1]):
                        score += 5
                except:
                    pass

            # 添加评分
            candidate["综合评分"] = score
            ranked_candidates.append(candidate)

        # 按评分排序
        ranked_candidates.sort(key=lambda x: x["综合评分"], reverse=True)
        return ranked_candidates

def demo_screening():
    """演示虚拟筛选流程"""
    print("🧬 肺癌药物虚拟筛选演示")
    print("=" * 70)

    # 创建筛选系统
    screener = LungCancerVirtualScreening()

    # 演示候选化合物
    demo_candidates = [
        {
            "名称": "候选化合物A",
            "SMILES": "COc1ccc2nc(sc2c1)NC(=O)c3ccc(cc3)N",  # 类似EGFR抑制剂骨架
            "靶点": "EGFR"
        },
        {
            "名称": "候选化合物B",
            "SMILES": "CC1CCN(CC1)C2=NC=CC(=N2)C3=CN(C4=CC=CC=C34)Cl",  # 类似ALK抑制剂骨架
            "靶点": "ALK"
        },
        {
            "名称": "候选化合物C",
            "SMILES": "C1=CC=C(C=C1)C2=NC(=NC2)C3=CN(C4=CC=CC=C34)Cl",  # 类似KRAS G12C抑制剂骨架
            "靶点": "KRAS_G12C"
        }
    ]

    print("\n📊 靶点信息概览")
    print("-" * 70)

    for target, info in screener.target_info.items():
        print(f"\n🎯 {target}:")
        print(f"   类型: {info['type']}")
        print(f"   突变焦点: {info['mutation_focus']}")
        print(f"   理想分子量: {info['ideal_properties']['MW']}")
        print(f"   理想LogP: {info['ideal_properties']['LogP']}")

    print("\n" + "=" * 70)
    print("🔬 开始候选化合物筛选和ADMET预测")
    print("=" * 70)

    for candidate in demo_candidates:
        print(f"\n🧪 分析 {candidate['名称']} (靶点: {candidate['靶点']})")
        print("-" * 70)

        smiles = candidate["SMILES"]

        # 计算分子性质
        print("📊 分子性质:")
        props = screener.calculate_molecular_properties(smiles)
        if "error" in props:
            print(f"   ❌ 错误: {props['error']}")
            continue

        for key, value in props.items():
            if key not in ["Lipinski_violations", "Veber_violations"]:
                print(f"   {key}: {value:.2f}" if isinstance(value, float) else f"   {key}: {value}")

        # ADMET预测
        print("\n🔬 ADMET预测:")
        admet_result = screener.predict_admet(smiles)

        for category, predictions in admet_result.items():
            print(f"   {category}:")
            for test, result in predictions.items():
                print(f"     • {test}: {result}")

        # 脱靶风险评估
        print("\n⚠️  脱靶风险评估:")
        off_target = screener.evaluate_off_target_risk(smiles)
        for risk, assessment in off_target.items():
            print(f"   {risk}: {assessment}")

        # 参考药物比较
        print("\n💊 与参考药物比较:")
        target = candidate["靶点"]
        if target in screener.reference_drugs:
            for drug_name, drug_data in screener.reference_drugs[target].items():
                print(f"   {drug_name}:")
                print(f"     MW: {drug_data['MW']:.1f} (候选: {props['MW']:.1f})")
                print(f"     LogP: {drug_data['LogP']:.1f} (候选: {props['LogP']:.1f})")

        print("-" * 70)

    # 排序候选化合物
    print("\n📊 候选化合物排序")
    print("-" * 70)

    ranked = screener.rank_candidates(demo_candidates, "EGFR")
    for i, candidate in enumerate(ranked, 1):
        print(f"{i}. {candidate['名称']} - 综合评分: {candidate['综合评分']}/100")

    print("\n" + "=" * 70)
    print("🎉 筛选演示完成")
    print("=" * 70)

def main():
    """主函数"""
    try:
        # 检查依赖
        import rdkit
        print("✅ RDKit已安装")

        demo_screening()

    except ImportError:
        print("❌ 缺少RDKit依赖")
        print("📦 请安装: pip install rdkit")
        print("💡 或者使用以下命令:")
        print("   conda install -c conda-forge rdkit")

if __name__ == "__main__":
    main()
