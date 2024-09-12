import { Label } from 'cc';
import { Button } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
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
    @property(Node) 
    unempty_panel : Node = null!;   

    @property(Label)
    label_num: Label = null!;
    @property(Label)
    label_emptyNum: Label = null!;

    private _index: number = 0;

    OnClickCallback: (index: number) => void = null!;

    start(): void {
        this.btn_item?.node.on(Button.EventType.CLICK, this.onItemClick, this);
    }

    set SetSpriteFrame(value : SpriteFrame) {
        this.icon.spriteFrame = value;
    }

    Init(index: number, num: number, spriteFrame: SpriteFrame) {
        this._index = index;;

        this.label_num.string = num.toString();
        this.label_emptyNum.string = num.toString();
        this.icon.spriteFrame = spriteFrame;

        this.empty_panel.active = num > 0 ? true: false;
        this.unempty_panel.active = num == 0 ? true: false;
        this.icon_mask.active = num > 0 ? false: true;
    }

    onItemClick() {
        this.OnClickCallback?.(this._index);
    }

}


