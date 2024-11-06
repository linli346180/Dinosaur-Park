import { _decorator, Component, Node, Label, Button, SpriteFrame, Sprite } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { TablePrimaryDebrisConfig } from '../common/table/TablePrimaryDebrisConfig';
import { TableMiddleDebrisConfig } from '../common/table/TableMiddleDebrisConfig';
const { ccclass, property } = _decorator;

@ccclass('PzzleItem')
export class PzzleItem extends Component {
    @property(Button)
    btn_item: Button = null!;
    @property(Node)
    icon_mask: Node = null!;
    @property(Sprite)
    icon: Sprite = null!;
    @property(Node)
    empty_panel: Node = null!;
    @property(Label)
    label_num: Label = null!;
    @property(Label)
    label_emptyNum: Label = null!;

    debrisID: number = 0;   //主拼图ID
    debrisDetailsID: number = 0; //子拼图ID
    position: number = 0;   //拼图位置
    count: number = 0;  // 拼图数量

    set Count(value: number) {
        this.count = value;
        this.label_num.string = value.toString();
        this.label_emptyNum.string = value.toString();
        this.btn_item.interactable = value > 0 ? true : false;
        this.empty_panel.active = value == 0 ? true : false;
        this.icon_mask.active = value > 0 ? false : true;
    }

    OnClick: (index: number) => void = null!;

    start(): void {
        this.btn_item?.node.on(Button.EventType.CLICK, this.onItemClick, this);
    }

    set SetSpriteFrame(value: SpriteFrame) {
        this.icon.spriteFrame = value;
    }

    initItem(debrisType: number, debrisID: number, debrisDetailsID: number, position: number, count: number) {
        this.debrisID = debrisID;
        this.debrisDetailsID = debrisDetailsID;
        this.position = position;
        this.count = count;

        this.label_num.string = count.toString();
        this.label_emptyNum.string = count.toString();
        this.btn_item.interactable = count > 0 ? true : false;
        this.empty_panel.active = count == 0 ? true : false;
        this.icon_mask.active = count > 0 ? false : true;

        let itemConfig : any;
        if (debrisType == 301)
            itemConfig = new TablePrimaryDebrisConfig();
        else
            itemConfig = new TableMiddleDebrisConfig();
        this.setIcon(itemConfig);
    }

    onItemClick() {
        if (this.count > 0) {
            this.OnClick?.(this.position);
        }
    }

    setIcon(itemConfig: any) {
        itemConfig.init(this.position);
        oops.res.loadAsync(itemConfig.icon + '/spriteFrame', SpriteFrame).then((spriteFrame) => {
            this.icon.spriteFrame = spriteFrame;
        });
    }
}