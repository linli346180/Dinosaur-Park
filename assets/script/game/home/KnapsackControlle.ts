
import { _decorator, Component, Node, Prefab, instantiate, macro } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { ActorDragComponent } from './dragComponent';
import { KnapsackSlot } from './KnapsackSlot';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { IStartBeastData } from '../account/model/AccountModelComp';
import { STBID } from '../character/STBDefine';
import { tween } from 'cc';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('KnapsackControlle')
export class KnapsackControlle extends Component {
    public static instance: KnapsackControlle | null = null;
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
    private fromSlot: KnapsackSlot | null = null;
    private toSlot: KnapsackSlot | null = null;
    private interval = 60;  // 自动领养星兽时间间隔

    protected onLoad(): void {
        KnapsackControlle.instance = this;
        this.idleTips.active = false;
    }

    start() {
        oops.message.on(AccountEvent.AddUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DelUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.UpdateUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.AutoAddUnIncomeSTB, this.onHandler, this);
        oops.message.on(AccountEvent.UserNoOperation, this.onHandler, this);
        oops.message.on(AccountEvent.UserOperation, this.onHandler, this);
        this.InitUI()
    }

    onDestroy() {
        oops.message.off(AccountEvent.AddUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.DelUnIncomeSTB, this.onHandler, this);
        oops.message.off(AccountEvent.UpdateUnIncomeSTB, this.onHandler, this);
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
        smc.account.AccountModel.userInstbData.UserNinstb.forEach(element => {
            this.CreateSTBItem(element);
        });
        this.autoAdoptBeast();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddUnIncomeSTB:
                this.CreateSTBItem(smc.account.getUserSTBData(args));
                break;
            case AccountEvent.DelUnIncomeSTB:
                this.RemoveSTBItem(args);
                break;
            case AccountEvent.UpdateUnIncomeSTB:
                this.UpdateSTBItem(smc.account.getUserSTBData(args));
                break;
            case AccountEvent.AutoAddUnIncomeSTB:
                this.CreateSTBItem(smc.account.getUserSTBData(args), true);
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

    CreateSTBItem(stbData: IStartBeastData | null, autoAdop: boolean = false) {
        if (!stbData) {
            console.error("添加星兽数据为空");
            return
        }
        console.log("添加无收益星兽数据:" + stbData.id + " 槽位:" + stbData.stbPosition);
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.slotId == stbData.stbPosition) {
                slotComp.InitUI(stbData, autoAdop);
                return;
            }
        }
    }

    RemoveSTBItem(stbId: number) {
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.STBId == stbId) {
                slotComp.InitUI(null);
                return;
            }
        }
    }

    UpdateSTBItem(stbData: IStartBeastData | null) {
        if (!stbData) {
            console.error("更新星兽数据为空");
            return
        }
        for (const slotNode of this.SlotNodes) {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.STBId == stbData?.id) {
                slotComp.InitUI(stbData, false, true);
            }
        }
    }

    private showIdleTipAnim(show: boolean = true) {
        if (!show) {
            Tween.stopAllByTarget(this.idleTips);
            this.idleTips.active = false;
            return;
        }

        let startNode: Node | null = null;
        let endNode: Node | null = null;
        let stbConfigId = -1;
        let curSTBId = -1;

        for (let i = 0; i < this.slotContainer.children.length; i++) {
            const slotNode = this.slotContainer.children[i];
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && !slotComp.IsSlotEmpty()) {
                startNode = slotNode;
                stbConfigId = slotComp.STBConfigId;
                curSTBId = slotComp.STBId;

                for (const item of this.SlotNodes) {
                    const itemComp = item.getComponent<KnapsackSlot>(KnapsackSlot);
                    if (itemComp && !itemComp.IsSlotEmpty()
                        && itemComp.STBId != curSTBId
                        && itemComp.STBConfigId == stbConfigId) {
                        endNode = item;
                        break;
                    }
                }
                if (endNode != null)
                    break;
            }
        }
        if (startNode == null || endNode == null) {
            console.error("未找到匹配的星兽");
            return;
        }
        console.log("开始节点:" + startNode.name + " 结束节点:" + endNode.name);
        this.moveToDest(this.idleTips, startNode, endNode);
    }

    private moveToDest(tipsNode: Node, startNode: Node, endNode: Node) {
        tipsNode.active = true;
        const startWorldPos = startNode.getWorldPosition();
        const endWorldPos = endNode.getWorldPosition();
        tipsNode.setWorldPosition(startWorldPos);
        const moveAction = tween(tipsNode)
            .to(1.5, { worldPosition: endWorldPos })
            .delay(1)
            .call(() => {
                tipsNode.setWorldPosition(startWorldPos);
            });
        const repeatAction = tween(tipsNode)
            .repeatForever(moveAction);
        repeatAction.start();
    }

    /**
     * 系统自动领养星兽
     */
    private autoAdoptBeast() {
        this.schedule(() => {
            console.log("触发自动领养星兽");
            // TODO: 接口不正确
            this.AdopStartBeast(STBID.STB_Gold_Level1, true)
        }, this.interval, macro.REPEAT_FOREVER, this.interval);
    };


    /**
     * 领养星兽
     * @param stbConfigId - 星兽配置ID 1-10
     * @param autoAdop - 是否系统自动领养
     */
    AdopStartBeast(stbConfigId: number, autoAdop: boolean = false) {
        if (this.getEmptySlot() == -1) {
            if (!autoAdop)
                oops.gui.toast("背包已满，无法添加新物品", false);
            return;
        }
        smc.account.adopStartBeastNet(stbConfigId, autoAdop, (success: boolean, msg: string) => {
            if (!success) 
                oops.gui.toast(msg);
        });
    }

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
     * @param fromslotId - 移动前的槽位ID
     * @param toslotId - 移动后的槽位ID
     */
    swapSlot(fromslotId: number, toslotId: number) {
        this.fromSlot = this.getKnapsackSlot(fromslotId);
        this.toSlot = this.getKnapsackSlot(toslotId);
        if (!this.fromSlot || !this.toSlot) {
            console.error("未找到对应的背包槽");
            return;
        }

        this.fromSTBID = this.fromSlot.STBId;
        this.toSTBID = this.toSlot.STBId;
        console.log("移动前 星兽ID:" + this.fromSTBID + " 槽位:" + fromslotId);
        console.log("移动后 星兽ID:" + this.toSTBID + " 槽位:" + toslotId);

        // 移动到空槽位
        if (this.toSTBID == -1) {
            console.log("移动到空槽位");
            smc.account.changeSTBSlotIdNet(this.fromSTBID, toslotId, (success) => {
                if (!success) this.recoverSlot();
            });

            let stbData = smc.account.getUserSTBData(this.fromSTBID);
            if (stbData) {
                this.toSlot.InitUI(stbData);
                this.fromSlot.InitUI(null);
            }
            return;
        }

        // 合成星兽
        if (this.fromSlot.STBConfigId == this.toSlot.STBConfigId) {
            console.log("合成星兽A:" + this.fromSTBID + " B:" + this.toSTBID);
            smc.account.mergeUnIncomeSTBNet(this.toSTBID, this.fromSTBID, (success) => {
                if (!success) this.recoverSlot();
            });
            this.fromSlot.InitUI(null);
            return;
        }

        // 交换位置
        if (this.fromSlot.STBConfigId != this.toSlot.STBConfigId) {
            console.log("交换位置A:" + this.fromSTBID + " B:" + this.toSTBID);
            smc.account.changeSTBSlotIdNet(this.toSTBID, fromslotId, (success) => {
                if (!success) this.recoverSlot();
            });
            smc.account.changeSTBSlotIdNet(this.fromSTBID, toslotId, (success) => {
                if (!success) this.recoverSlot();
            })
            let stbData = this.toSlot.stbData;
            this.toSlot.InitUI(this.fromSlot.stbData);
            this.fromSlot.InitUI(stbData);
            return;
        }
    }

    recoverSlot() {
        this.fromSlot?.InitUI(smc.account.getUserSTBData(this.fromSTBID));
        this.toSlot?.InitUI(smc.account.getUserSTBData(this.toSTBID));
    }


    getKnapsackSlot(slotId: number): KnapsackSlot | null {
        for (let i = 0; i < this.SlotNodes.length; i++) {
            const slotNode = this.SlotNodes[i];
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.slotId == slotId) {
                return slotComp;
            }
        }
        console.error("getKnapsackSlot is null");
        return null;
    }

    showDragTipAnim(slotId: number, isShow: boolean) {
        if (isShow) {
            let stbConfigId = -1;
            for (const slotNode of this.SlotNodes) {
                const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
                if (slotComp && slotComp.slotId == slotId) {
                    stbConfigId = slotComp.STBConfigId;
                }
            }
            if (stbConfigId == -1) return;
            for (const slotNode of this.SlotNodes) {
                const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
                if (slotComp && slotComp.STBConfigId == stbConfigId) {
                    slotComp.showDragTip(isShow);
                }
            }
        } else {
            for (const slotNode of this.SlotNodes) {
                const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
                if (slotComp) {
                    slotComp.showDragTip(isShow);
                }
            }
        }
    }
}