
import { _decorator, Component, Node, Prefab, instantiate, macro } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { ActorDragComponent } from './dragComponent';
import { KnapsackSlot } from './KnapsackSlot';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { StartBeastData } from '../account/model/AccountModelComp';
import { STBTypeID } from '../character/STBDefine';
import { tween } from 'cc';
import { Tween } from 'cc';
import { EDITOR } from 'cc/env';
import { UIOpacity } from 'cc';
import { Vec3 } from 'cc';
import { easing } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('KnapsackControlle')
export class KnapsackControlle extends Component {
    public static instance: KnapsackControlle = null!;
    @property(Prefab)
    slotPrefab: Prefab = null!;
    @property(Node)
    dragNode: Node = null!;
    @property(Node)
    slotContainer: Node = null!;
    @property(Node)
    idleTips: Node = null!;
    public SlotNodes: Node[] = [];

    private maxslotNum: number = 12;
    private fromSTBID: number = -1;
    private toSTBID: number = -1;
    private fronSTBConfigId = -1;
    private toSTBConfigId = -1;
    private fromSlot: KnapsackSlot | null = null;
    private toSlot: KnapsackSlot | null = null;
    private interval = 30;  // 自动领养星兽时间间隔

    private canChangeSlot: boolean = true;  // 是否可以交换星

    protected onLoad(): void {
        KnapsackControlle.instance = this;
        this.idleTips.active = false;
    }

    start() {
        oops.message.on(AccountEvent.AddUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DelUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.LevelUpUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.AutoAddUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.UserNoOperation, this.onHandler, this);
        oops.message.on(AccountEvent.UserOperation, this.onHandler, this);
        this.InitUI()
    }

    onDestroy() {
        oops.message.off(AccountEvent.AddUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.DelUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.LevelUpUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.AutoAddUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.UserNoOperation, this.onHandler, this);
        oops.message.off(AccountEvent.UserOperation, this.onHandler, this);
    }

    InitUI() {
        this.SlotNodes = [];
        this.slotContainer.removeAllChildren();
        for (let i = 1; i <= this.maxslotNum; i++) {
            this.CreateSlotItem(i);
        }
        smc.account.AccountModel.getUserNinstb().forEach(element => {
            this.updateSTBItem(element);
        });

        // if (EDITOR) {
        //     this.autoAdoptBeast();
        // }
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddUnIncomeSTB:
                this.updateSTBItem(smc.account.getUserSTBData(args));
                break;
            case AccountEvent.DelUnIncomeSTB:
                this.RemoveSTBItem(args);
                break;
            case AccountEvent.LevelUpUnIncomeSTB:
                this.initSTBItem(smc.account.getUserSTBData(args));
                break;
            case AccountEvent.AutoAddUnIncomeSTB:
                this.updateSTBItem(smc.account.getUserSTBData(args), true);
                break;
            case AccountEvent.UserNoOperation:
                this.showIdleTipAnim(true);
                break;
            case AccountEvent.UserOperation:
                this.showIdleTipAnim(false);
                break;
        }
    }

    /**
     * 创建一个背包槽
     * @param slotId 从1开始的背包槽索引
     */
    CreateSlotItem(slotId: number) {
        if (slotId < 1 || slotId > this.maxslotNum) {
            console.error("背包槽索引不正确");
            return;
        }

        let node = instantiate(this.slotPrefab);
        this.slotContainer.addChild(node);
        node.name = "slot_" + slotId;
        node.setPosition(0, 0, 0);
        this.SlotNodes.push(node);

        const slotComp = node.getComponent<KnapsackSlot>(KnapsackSlot);
        if (slotComp)
            slotComp.slotId = slotId;
        const dragComponent = node.getComponentInChildren(ActorDragComponent);
        if (dragComponent) {
            dragComponent.dragNode = this.dragNode;
            dragComponent.slotId = slotId;

            dragComponent.beginDragCallBack = (slotId: number) => {
                this.showDragTipAnim(slotId, true);
            }
            dragComponent.endDragCallBack = (slotId: number) => {
                this.showDragTipAnim(slotId, false);
            }
        }
    }

    updateSTBItem(stbData: StartBeastData | null, autoAdop: boolean = false) {
        if (!stbData) {
            console.error("添加星兽数据为空");
            return
        }
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.slotId == stbData.stbPosition) {
                slotComp.InitUI(stbData, autoAdop);
                return;
            }
        }
        console.error("添加 未找到对应的背包槽");
    }

    RemoveSTBItem(stbId: number) {
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.STBId == stbId) {
                slotComp.STBConfigID = 0;
                return;
            }
        }
        console.error("移除 未找到对应的背包槽");
    }

    initSTBItem(stbData: StartBeastData | null) {
        if (!stbData) {
            console.error("更新星兽数据为空");
            return
        }
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.STBId == stbData?.id) {
                slotComp.InitUI(stbData, false, true);
                return;
            }
        }
        console.error("升级 未找到对应的背包槽");
    }

    private showIdleTipAnim(show: boolean = true) {
        if (!show) {
            // console.log("隐藏空闲引导");
            Tween.stopAllByTarget(this.idleTips);
            this.idleTips.active = false;
            return;
        }

        if (show && this.idleTips.active) {
            // console.error("已经显示空闲引导");
            return;
        }

        let startNode: Node | null = null;
        let endNode: Node | null = null;
        for (let i = 0; i < this.slotContainer.children.length; i++) {
            const slotNode = this.slotContainer.children[i];
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && !slotComp.IsSlotEmpty()) {
                startNode = slotNode;
                for (const item of this.SlotNodes) {
                    const itemComp = item.getComponent<KnapsackSlot>(KnapsackSlot);
                    if (itemComp && !itemComp.IsSlotEmpty()
                        && itemComp.STBId != slotComp.STBId
                        && itemComp.STBConfigId == slotComp.STBConfigId) {
                        endNode = item;
                        break;
                    }
                }
                if (endNode != null)
                    break;
            }
        }
        if (startNode == null || endNode == null) {
            // console.error("无相同等级星兽");
            return;
        }
        // console.log("显示空闲引导 起点:" + startNode.name + " 终点:" + endNode.name);
        this.idleTips.active = true;
        this.moveToDest(this.idleTips, startNode, endNode);
    }

    private moveToDest(tipsNode: Node, startNode: Node, endNode: Node) {
        let uiOpacity = tipsNode.getComponent(UIOpacity);
        if (!uiOpacity) return;
        const moveAction = tween(tipsNode)
            .call(() => {
                uiOpacity.opacity = 0; // 初始透明度为 0
                tipsNode.setWorldPosition(startNode.getWorldPosition());
            })
            .to(0.5, {}, { onUpdate: (target, ratio) => { if (ratio != undefined) uiOpacity.opacity = 255 * ratio; } }) // 透明度增加到 255
            .delay(1)
            .to(1.5, { worldPosition: endNode.getWorldPosition() })
            .to(0.5, {}, { onUpdate: (target, ratio) => { if (ratio != undefined) uiOpacity.opacity = 255 * (1 - ratio); } }) // 透明度减少到 0
            .delay(1);

        const repeatAction = tween(tipsNode)
            .repeatForever(moveAction)
            .start();
    }

    /**
     * 系统自动领养星兽
     */
    // private autoAdoptBeast() {
    //     this.schedule(() => {
    //         console.log("触发自动领养星兽");
    //         this.AdopStartBeast(STBTypeID.STB_Gold_Level1, true)
    //     }, this.interval, macro.REPEAT_FOREVER, this.interval);
    // };

    /** 获取第一个空闲的背包槽 */
    getEmptySlot(): number {
        let slotId = -1;
        for (let i = 0; i < this.SlotNodes.length; i++) {
            const slotNode = this.SlotNodes[i];
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.IsSlotEmpty()) {
                slotId = slotComp.slotId;
                break;
            }
        }
        return slotId;
    }

    /**
     * 交换星兽规则:  1.两个星兽等级相同，合成后星兽等级+1 2.两个星兽等级不同，交互位置
     * @param fromslotId - 原槽位ID
     * @param toslotId - 目标槽位ID
     */
    swapSlot(fromslotId: number, toslotId: number) {
        this.fromSlot = this.getKnapsackSlot(fromslotId);
        this.toSlot = this.getKnapsackSlot(toslotId);
        if (!this.fromSlot || !this.toSlot) {
            console.error("槽位为空");
            return;
        }

        if (!this.canChangeSlot) {
            console.error("当前不能交换星兽");
            return;
        }

        this.fromSTBID = this.fromSlot.STBId;
        this.fronSTBConfigId = this.fromSlot.STBConfigID;
        this.toSTBID = this.toSlot.STBId;
        this.toSTBConfigId = this.toSlot.STBConfigID;

        console.log(`开始槽位:${this.fromSlot.slotId} 星兽ID: ${this.fromSTBID} 星兽配置: ${this.fronSTBConfigId} `);
        console.log(`结束槽位:${this.toSlot.slotId} 星兽ID: ${this.toSTBID} 星兽配置: ${this.toSTBConfigId}`);

        if(this.toSlot.STBConfigId == -1) {
            // 交换ConfigID
            this.fromSlot.STBConfigID = this.toSTBConfigId;
            this.toSlot.STBConfigID= this.fronSTBConfigId;

            this.canChangeSlot = false;
            console.log(`目标槽位为空，直接交换 ${this.fromSTBID} ${toslotId}`);
            smc.account.changeSTBSlotIdNet(this.fromSTBID, toslotId, (success) => {
                this.canChangeSlot = true;
                if (!success) {
                    console.error("交换位置失败");
                    this.recoverSlot();
                }
                else {
                    smc.account.setUserNinstbConfig(this.fromSTBID, this.toSTBConfigId);
                    // smc.account.setUserNinstbConfig(this.toSTBID, this.fronSTBConfigId);
                }
            })
            return;
        }

        // 两个星兽等级不同，交互位置
        if (this.fromSlot.STBConfigId != this.toSlot.STBConfigId) {
            this.fromSlot.STBConfigID = this.toSTBConfigId;
            this.toSlot.STBConfigID= this.fronSTBConfigId;
            this.canChangeSlot = false;
            smc.account.changeSTBSlotIdNet(this.fromSTBID, toslotId, (success) => {
                this.canChangeSlot = true;
                if (!success) {
                    console.error("交换位置失败");
                    this.recoverSlot();
                }
                else {
                    smc.account.setUserNinstbConfig(this.fromSTBID, this.toSTBConfigId);
                    // smc.account.setUserNinstbConfig(this.toSTBID, this.fronSTBConfigId);
                }
            })
        } else {
            // 两个星兽等级相同，合成后星兽等级+1 
            if (this.fromSlot.STBConfigId == this.toSlot.STBConfigId) {
                // 获取下一级星兽配置
                const config = smc.account.STBConfigMode.getNextSTBConfigData(this.toSTBConfigId);
                if (config) {
                    this.toSlot.stbData.stbConfigID = config.id;
                } 
                this.toSlot.InitUI(this.toSlot.stbData, false, true);
                this.fromSlot.STBConfigID = 0;
                this.canChangeSlot = false;
                smc.account.mergeUnIncomeSTBNet(this.toSTBID, this.fromSTBID, (success, levelUp) => {
                    this.canChangeSlot = true;
                    if (!success) {
                        console.error("合成星兽失败");
                        this.recoverSlot();
                    } else {
                        if(levelUp) {
                            smc.account.AccountModel.delUserUnIncomeSTB(this.fromSTBID);
                            smc.account.AccountModel.delUserUnIncomeSTB(this.toSTBID);
                        }
                        else {
                            // A数据删除 B数据更新
                            smc.account.AccountModel.delUserUnIncomeSTB(this.fromSTBID);
                            smc.account.setUserNinstbConfig(this.toSTBID, this.toSlot.stbData.stbConfigID);
                        } 
                    }
                });
            }
        }
    }

    recoverSlot() {
        console.log("恢复槽位");
        this.fromSlot.STBConfigID = this.fronSTBConfigId;
        this.toSlot.STBConfigID = this.toSTBConfigId;
    }

    /** 获取槽位信息 */
    getKnapsackSlot(slotId: number): KnapsackSlot | null {
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.slotId == slotId) {
                return slotComp;
            }
        }
        console.error("getKnapsackSlot is null");
        return null;
    }

    /** 显示相同等级的合并提示 */
    showDragTipAnim(slotId: number, isShow: boolean) {
        if (isShow) {
            let stbConfigId = -1;
            for (const slotNode of this.SlotNodes) {
                const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
                if (slotComp && slotComp.slotId == slotId) {
                    stbConfigId = slotComp.STBConfigId;
                    break;
                }
            }

            if (stbConfigId == -1) return;
            for (const slotNode of this.SlotNodes) {
                const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
                if (slotComp && slotId != slotComp.slotId && slotComp.STBConfigId == stbConfigId) {
                    slotComp.showDragTip(isShow);
                }
            }
        } else {
            for (const slotNode of this.SlotNodes) {
                slotNode.getComponent<KnapsackSlot>(KnapsackSlot)?.showDragTip(isShow);
            }
        }
    }
}