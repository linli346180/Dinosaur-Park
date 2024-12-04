import { _decorator, Component, Node } from 'cc';
import { EvolueNetService } from './EvolveNet';
import { toggleComp } from '../common/toggleComp';
import { smc } from '../common/SingletonModuleComp';
import { EvolutionData, EvolutionExtent, EvolutionResource, EvolutionResponse, ResourceData } from './EvolveDefine';
import { Label, Button, ProgressBar, Slider } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { StringUtil } from '../common/utils/StringUtil';
import { AwardType } from '../account/AccountDefine';
import { Decimal } from 'decimal.js';
import { ReddotComp } from '../reddot/ReddotComp';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { EvolveResult } from './EvolveResult';

const { ccclass, property } = _decorator;

@ccclass('EvolveView')
export class EvolveView extends Component {
    @property(Button) btn_close: Button = null!;
    @property(Node) toggleGroup: Node = null!;
    @property(Label) progressLabel: Label = null!;
    @property(Button) btn_evolve: Button = null!;
    @property(Button) btn_reduceonce: Button = null!;
    @property(Button) btn_addonce: Button = null!;
    @property(ProgressBar) progressBar: ProgressBar = null!;
    @property(Slider) slider: Slider = null!;
    @property(Label) evoNumLabel: Label = null!;
    @property(Label) stbRemain: Label = null!;     // 剩余星兽数量
    @property(Label) coinRemain: Label = null!;    // 剩余金币数量
    @property(Label) stbResourceNum: Label = null!;
    @property(Label) coinResourceNum: Label = null!;
    @property(Button) btn_tips: Button = null!;
    @property(Node) maskNode: Node = null!;

    @property(Node) icon_110: Node = null!;
    @property(Node) icon_301: Node = null!;
    @property(Node) icon_302: Node = null!;
    @property(Node) boxIcon_301: Node = null!;
    @property(Node) boxIcon_302: Node = null!;
    @property(Node) boxIcon_303: Node = null!;
    @property(Node) biaoIcon_301: Node = null!;
    @property(Node) biaoIcon_302: Node = null!;
    @property(Node) biaoIcon_303: Node = null!;

    private evolutionDataMap: Map<number, EvolutionData> = new Map();
    private selectIndex = 301;        // 选择的星兽类型
    private evolutionNumber = 0;      // 进化次数
    private stbResource: EvolutionResource;     // 当前区间星兽资源消耗配置
    private coinResource: EvolutionResource;    // 当前区间金币资源消耗配置

    onLoad() {
        this.toggleGroup.children.forEach((child, index) => {
            const comp = child.getComponent(toggleComp);
            if (comp) {
                comp.setChecked(comp.index === this.selectIndex);
                comp.onToggleSelcted = this.onToggleSelcted.bind(this);
            }
        });
        this.btn_close.node.on(Button.EventType.CLICK, this.onClose, this);
        this.btn_evolve.node.on(Button.EventType.CLICK, this.onEvolveClick, this);
        this.btn_reduceonce.node.on(Button.EventType.CLICK, this.onReduceOnceClick, this);
        this.btn_addonce.node.on(Button.EventType.CLICK, this.onAddOnceClick, this);
        this.btn_tips.node.on(Button.EventType.CLICK, this.showTips, this);
    }

    onEnable() {
        this.onToggleSelcted(this.selectIndex);
    }

    private onClose() {
        oops.gui.remove(UIID.Evolve);
    }

    private showTips() {
        oops.gui.open(UIID.EvolveTips);
        this.btn_tips.getComponentInChildren(ReddotComp)?.setRead();
    }

    private initUI() {
        this.boxIcon_301.active = this.selectIndex === 301;
        this.boxIcon_302.active = this.selectIndex === 302;
        this.boxIcon_303.active = this.selectIndex === 303;
        this.biaoIcon_301.active = this.selectIndex === 301;
        this.biaoIcon_302.active = this.selectIndex === 302;
        this.biaoIcon_303.active = this.selectIndex === 303;
        this.stbRemain.string = '0';
        this.coinRemain.string = '0';
        this.stbResourceNum.string = '0';
        this.coinResourceNum.string = '0';
        this.progressLabel.string = '(0/0)';
        this.progressBar.progress = 0;
        this.slider.progress = 0;
        this.evolutionNumber = 0;
        this.evoNumLabel.string = this.evolutionNumber.toString();
    }

    private async onToggleSelcted(index: number) {
        this.selectIndex = index;
        this.initUI();

        // 防止重复从服务端获取配置
        const stbConfig = smc.account.getSTBConfigByType(this.selectIndex);
        if (!this.evolutionDataMap.has(stbConfig.id)) {
            const res = await EvolueNetService.getEvolveConfig(stbConfig.id);
            if (res && res.userStbEvolution) {
                this.evolutionDataMap.set(stbConfig.id, res.userStbEvolution);
            }
        }

        // 防止分母为0导致崩溃
        const evoData: EvolutionData = this.evolutionDataMap.get(stbConfig.id)!;
        if (evoData && evoData.evolutionTotal > 0) {
            this.updateProgress(evoData);
        } else {
            console.error(`进化基础信息配置异常`);
        }

        // 计算素材消耗
        this.evoNumLabel.string = this.evolutionNumber.toString();
        this.calculateResources();

        // 计算剩余素材
        if (evoData.evolutionExtents && evoData.evolutionExtents.length > 0) {
            evoData.evolutionExtents.sort((a, b) => a.minNumber - b.minNumber);
            let focusExtent = evoData.evolutionExtents[0];
            for (const item of evoData.evolutionExtents) {
                if (evoData.userTotal >= item.minNumber && evoData.userTotal <= item.maxNumber) {
                    console.warn(`命中区间`, item);
                    focusExtent = item;
                }
            }
            this.calculateRemainResource(focusExtent);
        } else {
            console.error(`未命中区间`);
        }
    }

    private updateProgress(evoData: EvolutionData) {
        const progress = evoData.currentProgress / evoData.evolutionTotal;
        this.progressBar.progress = progress;
        this.slider.progress = progress;
        this.progressLabel.string = `(${evoData.currentProgress}/${evoData.evolutionTotal})`;
    }

    private async onEvolveClick() {
        if (this.evolutionNumber <= 0) {
            console.error(`未添加进化次数`, this.evolutionNumber);
            return;
        }

        const stbConfig = smc.account.getSTBConfigByType(this.selectIndex);
        if (!stbConfig) {
            console.error(`未找到星兽配置`, this.selectIndex);
            return;
        }

        this.maskNode.active = true;
        const res = await EvolueNetService.evolveRequest(stbConfig.id, this.evolutionNumber);
        if (res && res.evolution) {
            const evoResponse: EvolutionResponse = res.evolution;
            if (evoResponse.isCreate) {
                var uic: UICallbacks = {
                    onAdded: (node: Node, params: any) => {
                        node.getComponent(EvolveResult)?.InitUI(this.selectIndex);
                    }
                };
                let uiArgs: any;
                oops.gui.open(UIID.EvolveResult, uiArgs, uic);
            }
            this.updateEvolutionData(stbConfig.id, evoResponse);

            await smc.account.updateCoinData();
            await smc.account.updateInstbData();
            this.onToggleSelcted(this.selectIndex);
        }

        this.maskNode.active = false;
    }

    private updateEvolutionData(stbConfigId: number, evoResponse: EvolutionResponse) {
        const evoData = this.evolutionDataMap.get(stbConfigId);
        if (evoData) {
            evoData.currentProgress = evoResponse.currentProgress;
            evoData.userTotal = evoResponse.userTotal;
        }
    }

    private onReduceOnceClick() {
        this.evolutionNumber = Math.max(0, this.evolutionNumber - 1);
        this.evoNumLabel.string = this.evolutionNumber.toString();
        this.calculateResources();
    }

    private onAddOnceClick() {
        const stbConfig = smc.account.getSTBConfigByType(this.selectIndex);
        const data = this.evolutionDataMap.get(stbConfig.id)!;
        let max = data.evolutionTotal - data.currentProgress;
        this.evolutionNumber = Math.min(max, this.evolutionNumber + 1);
        this.evoNumLabel.string = this.evolutionNumber.toString();
        this.calculateResources();
    }

    /** 计算剩余耗材 */
    private calculateRemainResource(evolutionExtent: EvolutionExtent) {
        this.coinResource = null;
        this.stbResource = null;
        for (const item of evolutionExtent.evolutionResources) {
            console.log(`进化资源区间:`, item);
            if (item.resourceType === AwardType.Coin) {
                this.coinResource = item;
            }
            if (item.resourceType === AwardType.StarBeast) {
                this.stbResource = item;
            }
        }

        if (this.stbResource) {
            this.updateResourceIcon(this.stbResource.resourceId);
            this.stbRemain.string = StringUtil.formatMoney(smc.account.getUserInstbCount(this.stbResource.resourceId));
        } else {
            console.error(`未找到星兽资源`);
        }

        if (this.coinResource) {
            this.coinRemain.string = StringUtil.formatMoney(smc.account.AccountModel.CoinData.gemsCoin);
        } else {
            console.error(`未找到货币资源`);
        }
    }

    private updateResourceIcon(stbConfigId: number) {
        const stbConfig = smc.account.getSTBConfigById(stbConfigId);
        this.icon_110.active = StringUtil.combineNumbers(stbConfig.stbKinds, stbConfig.stbGrade, 2) === 110;
        this.icon_301.active = StringUtil.combineNumbers(stbConfig.stbKinds, stbConfig.stbGrade, 2) === 301;
        this.icon_302.active = StringUtil.combineNumbers(stbConfig.stbKinds, stbConfig.stbGrade, 2) === 302;
    }

    private calculateResources() {
        const stbConfig = smc.account.getSTBConfigByType(this.selectIndex);
        const data: EvolutionData = this.evolutionDataMap.get(stbConfig.id)!;

        const nextTotal = data.userTotal + this.evolutionNumber;
        let resourceInterval = new ResourceData();
        for (const extent of data.evolutionExtents) {
            if (nextTotal >= extent.minNumber && nextTotal <= extent.maxNumber) {
                console.warn('耗材计算,区间命中:', extent);
                this.calculateResourceForExtent(extent, data.userTotal, nextTotal, resourceInterval);
            }
        }
        this.stbResourceNum.string = resourceInterval.stbResource.toString();
        this.coinResourceNum.string = resourceInterval.coinResource.toString();
    }

    /** 
     * 获取区间内耗材累计数量
     * 计算规则 累计值= 所有区间的累加
     */
    private calculateResourceForExtent(extent: EvolutionExtent, userTotal: number, nextTotal: number, resourceInterval: ResourceData) {
        let stbResource: EvolutionResource = null;
        let coinResource: EvolutionResource = null;

        if (!extent.evolutionResources) {
            console.error(`进化资源区间异常`);
            return;
        }

        extent.evolutionResources.forEach((res) => {
            if (res.resourceType === AwardType.Coin) {
                coinResource = res;
            }
            if (res.resourceType === AwardType.StarBeast) {
                stbResource = res;
            }
        });

        const minNumber: number = extent.minNumber as number;
        if (stbResource) {
            this.calculateResource(stbResource, userTotal, nextTotal, minNumber, resourceInterval, 'stbResource');
        } else {
            console.error(`未找到星兽资源`);
        }

        if (coinResource) {
            this.calculateResource(coinResource, userTotal, nextTotal, minNumber, resourceInterval, 'coinResource');
        } else {
            console.error(`未找到货币资源`);
        }
    }

    private calculateResource(resource: EvolutionResource, userTotal: number, nextTotal: number, minNumber: number, resourceInterval: ResourceData, resourceType: 'stbResource' | 'coinResource') {
        const basicQuantity = Number(resource.basicQuantity);
        const proportion = new Decimal(Number(resource.proportion) + 1);
        for (let i = userTotal + 1; i <= nextTotal; i++) {
            resourceInterval[resourceType] += this.calculateResourceNum(i, minNumber, basicQuantity, proportion);
        }
        console.log(`${resourceType === 'stbResource' ? '星兽' : '宝石'}进化区间${nextTotal},最小区间${minNumber},进化基数${basicQuantity},比例${proportion},进化消耗${resourceInterval[resourceType]}`);
    }

    /** 计算规则: */
    private calculateResourceNum(current: number, min: number, basicQuantity: number, proportion: Decimal): number {
        if (current === min) {
            return basicQuantity;
        } else {
            const powerResult = proportion.pow(new Decimal(current - min));
            const resultNum = new Decimal(basicQuantity).mul(powerResult);
            return Math.floor(resultNum.toNumber());
        }
    }
}