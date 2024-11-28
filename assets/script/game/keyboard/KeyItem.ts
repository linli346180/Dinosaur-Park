import { Button, UITransform, SpriteFrame, Label, _decorator, Component, Node } from 'cc';
import { KeyBoardCode, KeyItemConfig, KeyItemStyle } from './KeyboardDefine';
const { ccclass, property } = _decorator;


/**
 * Represents a KeyItem component.
 * 
 * @remarks
 * This component is used to display and handle keyboard key items in a game.
 */
@ccclass('KeyItem')
export class KeyItem extends Component {
    @property(Label)
    private label: Label = null!;
    @property(Button)
    private btnCom: Button = null!;
    @property(Node)
    private icon_del: Node = null!;
    @property(Node)
    private icon_shift: Node = null!;

    private _clickHandler: Function = null;
    private _config: KeyItemConfig = null;
    private _keyCode: KeyBoardCode = KeyBoardCode.NONE;

    onLoad() {
        this.btnCom.node.on(Button.EventType.CLICK, this.onClick, this);
    }

    InitItem(keyCode: KeyBoardCode, config: KeyItemConfig) {
        this._keyCode = keyCode;
        this._config = config;
        this.label.string = config.normalLabel;
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.width = this._config.style === KeyItemStyle.normal ? 80 : 170;
        }

        if (keyCode === KeyBoardCode.DELETE) {
            this.icon_del.active = true;
            this.label.node.active = false;
        }
        if (keyCode === KeyBoardCode.Caps) {
            this.icon_shift.active = true;
            this.label.node.active = false;
        }
    }

    updateLabel(isCasp: boolean) { 
        this.label.string = isCasp ? this._config.caspLabel : this._config.normalLabel;
    }

    set clickHandler(value: Function) {
        this._clickHandler = value;
    }

    private onClick = () => {
        if (this._clickHandler) {
            this._clickHandler(this._keyCode);
        }
    }
}