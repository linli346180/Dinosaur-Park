
import { _decorator, Component, Node, Prefab, instantiate, SpriteFrame } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { DragComponent } from './dragComponent';
import { KnapsackSlot } from './KnapsackSlot';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { IStartBeastData } from '../account/model/AccountModelComp';
const { ccclass, property } = _decorator;

@ccclass('SlotData')
export class SlotData {
    @property
    level = 1;
    @property(SpriteFrame)
    icon: SpriteFrame = null!;
}

@ccclass('KnapsackControlle')
export class KnapsackControlle extends Component {

    public static instance: KnapsackControlle | null = null;

    @property([SlotData])
    items: SlotData[] = [];
    @property
    slotPrefab: Prefab = null!;
    @property
    dragNode: Node = null!;
    @property
    slotContainer: Node = null!;

    private stpId: number = 100;

    // @property({
    //     type: Number,
    //     displayName: "最大背包槽数量",
    //     readonly: true
    // })
    maxslotNum: number = 12;

    public SlotNodes: Node[] = [];

    protected onLoad(): void {
        KnapsackControlle.instance = this;
    }

    start() {
        oops.message.on(AccountEvent.LoginSuccess, this.onHandler, this);
        oops.message.on(AccountEvent.AddUserNinSTB, this.onHandler, this);
        oops.message.on(AccountEvent.DelUserNinSTB, this.onHandler, this);
        this.InitUI()
    }

    InitUI() {
        this.clearSlotNodes();
        for (let i = 1; i <= this.maxslotNum; i++) {
            this.addSlotNode(i);
        }
        this.addAllUserNinstb();
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.LoginSuccess:
                this.addAllUserNinstb();
                break;
            case AccountEvent.AddUserNinSTB:
                // console.log("添加星兽", args);
                this.addUserNinstbItem(smc.account.getUserNinstbData(args));
                break;
            case AccountEvent.DelUserNinSTB:
                // console.log("移除星兽", args);
                this.delUserNinstbItem(args);
                break;
        }
    }

    clearSlotNodes() {
        this.slotContainer.removeAllChildren();
        this.SlotNodes.forEach(node => {
            node.removeFromParent();
            node.destroy();
        });
        this.SlotNodes = [];
    }

    /**
     * 创建一个背包槽
     * @param index 从1开始的背包槽索引
     */
    addSlotNode(index: number) {
        if (index < 1) {
            console.error("背包槽索引不能小于1");
            return;
        }
        if (index > this.maxslotNum) {
            console.error("背包槽数量超过最大值");
            return;
        }
        let node = instantiate(this.slotPrefab);
        this.slotContainer.addChild(node);
        node.name = "slot_" + index;
        node.setPosition(0, 0, 0);
        this.SlotNodes.push(node);
        const slotComp = node.getComponent<KnapsackSlot>(KnapsackSlot);
        if (slotComp)
            slotComp.slotId = index;
        const dragComponent = node.getComponentInChildren(DragComponent);
        if (dragComponent) {
            dragComponent.dragNode = this.dragNode;
            dragComponent.slotId = index;
        }
    }

    addAllUserNinstb() {
        smc.account.AccountModel.userInstbData.UserNinstb.forEach(element => {
            this.addUserNinstbItem(element);
        });
    }

    addUserNinstbItem(element: IStartBeastData | null) {
        if (!element) {
            console.error("添加星兽数据为空");
            return
        }
        this.SlotNodes.find((slotNode) => {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.slotId == element.stbPosition) {
                slotComp.InitSlot(element, this.getSlotSpriteFrame(element.stbConfigID));
            }
        })
    }

    delUserNinstbItem(stbId: number) {
        this.SlotNodes.find((slotNode) => {
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if(slotComp && slotComp.STDID == stbId)
            { 
                slotComp.InitSlot(null, null);
            }
        })
    }

    /** 领养1-9级星兽 */
    AdopStartBeast(adopStbID : number) {
        let slotId = this.getEmptySlot();
        if (slotId == -1) {
            console.error("背包已满，无法添加新物品");
            oops.gui.toast("背包已满，无法添加新物品", false);
            return;
        }
        console.error("领养星兽:", adopStbID, slotId);
        smc.account.adopStartBeastNet(adopStbID);
    }

    /** 获取第一个空闲的背包槽 */
    getEmptySlot(): number {
        let index = -1;
        for (let i = 0; i < this.SlotNodes.length; i++) {
            const slotNode = this.SlotNodes[i];
            const slotComp = slotNode.getComponent<KnapsackSlot>(KnapsackSlot);
            if (slotComp && slotComp.IsEmpty()) {
                index = slotComp.slotId;
                break;
            }
        }
        return index;
    }

    /**交换星兽规则:  1.两个星兽等级相同，合成后星兽等级+1 2.两个星兽等级不同，交互位置  */
    swapSlot(from: number, to: number) {
        let fromSlot = this.getKnapsackSlot(from);
        let toSlot = this.getKnapsackSlot(to);
        if (!fromSlot || !toSlot) {
            console.error("未找到对应的背包槽");
            return;
        }

    
        // 移动到空的槽位
        if (toSlot.STDID == -1) {
            if (smc.account.setStrartBeatSlot(fromSlot.STDID, to)) {
                let stbData = smc.account.getUserNinstbData(fromSlot.STDID);
                if (stbData) {
                    toSlot.InitSlot(stbData, this.getSlotSpriteFrame(stbData?.stbConfigID));
                    fromSlot.InitSlot(null, null);
                    return;
                }
            }
            console.error("移动槽位失败");
            return;
        }

        // 合成
        if (fromSlot.STDLevel == toSlot.STDLevel) {
            smc.account.mergeStartBeatNet(toSlot.STDID, fromSlot.STDID);
            toSlot.InitSlot(null, null);
            fromSlot.InitSlot(null, null);
        }
        else {
            if (smc.account.setStrartBeatSlot(fromSlot.STDID, to) &&
                smc.account.setStrartBeatSlot(toSlot.STDID, from)) {
                let stbData = toSlot.stbData;
                let stbIcon = toSlot.stbIcon;
                toSlot.InitSlot(fromSlot.stbData, fromSlot.stbIcon);
                fromSlot.InitSlot(stbData, stbIcon);;
                return;
            }
            console.error("交换失败");
        }
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

    getSlotSpriteFrame(level: number): SpriteFrame | null {
        const itemConfig = this.items.find((item) => item.level == level);
        if (itemConfig) {
            return itemConfig.icon;
        }
        return null;
    }
}