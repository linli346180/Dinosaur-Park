import { Button, _decorator, Component, Node, Label, Prefab, instantiate, SpriteFrame, math } from 'cc';
import { UIID } from '../common/config/GameUIConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { PzzleItem } from './PzzleItem';
import { ReviveNetService } from './ReviveNet';
import { DebrisConfig, DebrisDetail, PuzzleID, UserDebris } from './DebrisData';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { DebrisResult } from './DebrisResult';

import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { StringUtil } from '../common/utils/StringUtil';
import { tween } from 'cc';
import { Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/** 碎片拼图功能 */
@ccclass('DebrisView')
export class DebrisView extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;
    @property(Button)
    btn_close: Button = null!;

    @property(Node)
    debrisViewPanel: Node = null!;   // 碎片预览界面
    @property(Button)
    btn_left: Button = null!;
    @property(Button)
    btn_right: Button = null!;
    @property(Label)
    debrisName: Label = null!;

    @property(Button)
    btn_onekey: Button = null!;
    @property(Node)
    debrisPiecesPanel: Node = null!;

    private isInit = false;

    // 碎片配置数据
    private curDebris: number = 301;
    private DebrisType: { [key: number]: { debrisNode: Node | null, config: DebrisConfig | null } } = {
        301: { debrisNode: null, config: null },
        302: { debrisNode: null, config: null },
    }

    // 用户碎片数据
    private userDebrisData: UserDebris[] = [];

    async onEnable(): Promise<void> {
        await this.initDebrisView(!this.isInit);
        this.initUserDebrisData(true);
    }

    start() {
        this.isInit = true;
        this.btn_close?.node.on(Button.EventType.CLICK, () => oops.gui.remove(UIID.Revive, false), this);
        this.btn_left?.node.on(Button.EventType.CLICK, () => this.changeDebris(-1), this);
        this.btn_right?.node.on(Button.EventType.CLICK, () => this.changeDebris(1), this);
        this.btn_onekey?.node.on(Button.EventType.CLICK, this.onOneKey, this);
        this.breathingTween(this.btn_right.node);
        this.breathingTween(this.btn_left.node);
    }

    /** 初始化拼图面板 */
    private async initDebrisView(foceUpdate: boolean = false): Promise<void> {
        Object.entries(this.DebrisType).forEach(([key, item]) => {
            const chileNode = this.debrisViewPanel.getChildByName(key);
            if (chileNode) {
                item.debrisNode = chileNode;
                item.debrisNode.active = chileNode.name == this.curDebris.toString();
                item.debrisNode.children.forEach((child) => { child.active = true; });
            }
        });

        // 获取拼图配置
        if (foceUpdate) {
            const res = await ReviveNetService.getDebrisConfig();
            if (res && res.debrisArr != null) {
                if (res.debrisArr.length == 0) return;
                for (let i = 0; i < res.debrisArr.length; i++) {
                    const debrisConfig = res.debrisArr[i];
                    const stbConfigID = debrisConfig.stbConfigID;
                    const stbConfig = smc.account.getSTBConfigById(stbConfigID);
                    if (stbConfig == null) {
                        console.error("stbConfig is null", stbConfigID);
                        return;
                    }
                    const stbConfigType = StringUtil.combineNumbers(stbConfig.stbKinds, stbConfig.stbGrade, 2);
                    this.DebrisType[stbConfigType].config = debrisConfig;
                }
                return this.updateDebrisView(this.curDebris);
            }
        } else {
            return this.updateDebrisView(this.curDebris);
        }
    }

    private updateDebrisView(index: number): void {
        const debrisType = this.DebrisType[index];
        this.debrisPiecesPanel.removeAllChildren();
        if (debrisType && debrisType.debrisNode && debrisType.config) {
            this.curDebris = index;
            this.debrisName.string = debrisType.config.name;
            debrisType.config.debrisDetailsArr.forEach((debrisDetail) => { this.createDebrisItem(debrisDetail); });
        } else {
            console.error("debrisType is null", index);
        }
    }

    private createDebrisItem(debrisDetail: DebrisDetail) {
        const item = instantiate(this.itemPrefab);
        this.debrisPiecesPanel.addChild(item);
        const pzzleItem = item.getComponent<PzzleItem>(PzzleItem);
        if (pzzleItem) {
            pzzleItem.initItem(this.curDebris, debrisDetail.debrisID, debrisDetail.id, debrisDetail.position, 0);
            pzzleItem.OnClick = this.onItemClicked.bind(this);
        }
    }

    /** 获取用户拼图碎片数据 */
    private async initUserDebrisData(foceUpdate: boolean = false) {
        if (foceUpdate) {
            const res = await ReviveNetService.getUserDebrisData();
            if (res && res.userDebrisArr != null) {
                this.userDebrisData = res.userDebrisArr;
                this.setUserDebrisNum();
            }
        } else {
            this.setUserDebrisNum();
        }
    }

    private setUserDebrisNum() {
        this.debrisPiecesPanel.children.forEach((child) => {
            let comp = child.getComponent(PzzleItem);
            if (comp) {
                let debrisNum = this.getUserDebrisNum(comp.debrisID, comp.debrisDetailsID);
                comp.Count = debrisNum;
            }
        });
    }

    getUserDebrisNum(debrisID: number, debrisDetailsID: number): number {
        let num = 0;
        for (const debris of this.userDebrisData) {
            if (debris.debrisID == debrisID && debris.debrisDetailsID == debrisDetailsID) {
                return debris.debrisNum;
            }
        }
        return num;
    }

    /** 切换拼图 */
    private changeDebris(direction: number) {
        const keys = Object.keys(this.DebrisType).map(Number);
        const currentIndex = keys.indexOf(this.curDebris);
        let newIndex = currentIndex + direction;
        if (newIndex >= keys.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = keys.length - 1;
        }

        this.curDebris = keys[newIndex];
        this.initDebrisView(!this.isInit).then(() => {
            this.initUserDebrisData(true);
        });
    }

    private breathingTween(targetNode: Node) {
        if (targetNode) {
            const originalPosition = targetNode.position.clone();
            let breathingTween = tween(targetNode)
                .to(1, { position: new Vec3(originalPosition.x, originalPosition.y + 15, originalPosition.z) }, { easing: 'sineInOut' })
                .to(1, { position: originalPosition }, { easing: 'sineInOut' })
                .delay(1)
                .union()
                .repeatForever()
                .start();
        }
    }

    onItemClicked(index: number) {
        console.log("激活碎片拼图", index);
        this.DebrisType[this.curDebris].debrisNode?.children.forEach((child) => {
            if (child.name == index.toString())
                child.active = false;
        });
        this.checkAddDebris(this.DebrisType[this.curDebris].debrisNode!);
    }

    /** 检测拼图是否完整 */
    checkAddDebris(root: Node) {
        let isComplete = true;
        root.children.forEach((child) => {
            if (child.active) {
                isComplete = false;
                return;
            }
        });

        if (isComplete) {
            console.log("碎片拼图完成");
            this.requestDebrisData();
        }
    }

    private onOneKey() {
        console.log("一键拼图");
        const debrisConfig = this.DebrisType[this.curDebris].config;
        const debrisNode = this.DebrisType[this.curDebris].debrisNode;
        if (debrisNode && debrisConfig) {
            debrisConfig.debrisDetailsArr.forEach((detail) => {
                let count = this.getUserDebrisNum(detail.debrisID, detail.id);
                if (count > 0) {
                    const chileNode = debrisNode.getChildByName(detail.position.toString());
                    if (chileNode) chileNode.active = false;
                }
            })
            this.checkAddDebris(debrisNode!);
        }
    }

    /** 合成碎片 */
    private async requestDebrisData() {
        const debrisConfig = this.DebrisType[this.curDebris].config;
        if (debrisConfig == null) {
            console.error("debrisConfig is null");
            return;
        }

        setTimeout(() => {
            this.initDebrisView(false);
            this.initUserDebrisData(true);
        }, 1000);

        let debrisIndex = this.curDebris;
        let res = await ReviveNetService.clampDebris(debrisConfig.id);
        if (res && res.userInstb != null) {
            smc.account.AccountModel.addInComeSTBData(res.userInstb);
            oops.message.dispatchEvent(AccountEvent.AddInComeSTB, res.userInstb.id);

            var uic: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    const widget = node.getComponent(DebrisResult);
                    widget?.initUI(debrisIndex);
                }
            };
            let uiArgs: any;
            oops.gui.open(UIID.DebrisResult, uiArgs, uic);
        }
    }
}