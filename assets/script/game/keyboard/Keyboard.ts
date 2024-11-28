import { instantiate } from 'cc';
import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { InputItem } from './InputItem';
import { CursorBlink } from './CursorBlink';
import { EventType, KeyBoardCode, KeyBoardConfigs } from './KeyboardDefine';
import { KeyItem } from './KeyItem';
import { EditBox } from 'cc';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Keyboard')
export default class Keyboard extends Component {
    @property(Prefab)
    private itemPrefab: Prefab = null;
    @property(Prefab)
    private itemSendPrefab: Prefab = null;

    @property(Prefab)
    private inputItemPrefab: Prefab = null;
    @property(Button)
    private btn_clear: Button = null!;

    @property({ readonly: true })
    private vertical: boolean = true;    // 是否垂直排列
    @property(Node)
    private inputNode: Node = null!;      // 输入框节点
    @property(Node)
    private row_1: Node = null!;
    @property(Node)
    private row_2: Node = null!;
    @property(Node)
    private row_3: Node = null!;
    @property(Node)
    private row_4: Node = null!;

    @property(Node)
    private cursorNode: Node = null!;
    @property(Node)
    private inputContainer: Node = null!;
    private cursorBlink: CursorBlink | null = null;
    private isCaps: boolean = false;

    a: EditBox = null!;

    /** 输入框的初始输入内容，如果为空则会显示占位符的文本。*/
    get string(): string {
        return this.getFinalString();
    }
    set string(value: string) {
        this.inputContainer.removeAllChildren();
        for (let i = 0; i < value.length; i++) {
            const itemNode = instantiate(this.inputItemPrefab);
            const keyItem = itemNode.getComponent(InputItem);
            this.inputContainer.addChild(itemNode);
            keyItem.InputText = value[i];
        }
    }

    /** 输入框最大允许输入的字符个数。 */
    private _maxLength: number = 0;
    get maxLength(): number {
        return this._maxLength;
    }
    set maxLength(value: number) {
        this._maxLength = value;
    }

    // TODO 文本改变事件  文本完成事件 
    // TODO 输入类型输入数字

    onLoad() {
        this.initLayout()
        this.vertical ? this.initKeyMapV() : this.initKeyMapH()
        this.cursorBlink = this.cursorNode.getComponent(CursorBlink);
        this.btn_clear.node.on(Button.EventType.CLICK, this.onClear, this);
        // 监听文本改变事件
        // this.node.on(EventType.TEXT_CHANGED, this.onTextChanged, this);
        // this.node.on(EventType.EDITING_RETURN, this.onEditReturn, this);
    }

    private onClear() {
        this.inputContainer.removeAllChildren();
        this.node.emit(EventType.TEXT_CHANGED, this.getFinalString());
    }

    private initLayout() {
        const visibleHeight = screen.availHeight;
    }

    private initKeyMapV() {
        const keyArr1 = [
            KeyBoardCode.NUM_1,
            KeyBoardCode.NUM_2,
            KeyBoardCode.NUM_3,
            KeyBoardCode.NUM_4,
            KeyBoardCode.NUM_5,
            KeyBoardCode.NUM_6,
            KeyBoardCode.NUM_7,
            KeyBoardCode.NUM_8,
            KeyBoardCode.NUM_9,
            KeyBoardCode.NUM_0,
            KeyBoardCode.NUM_DECIMAL
        ];

        const keyArr2 = [
            KeyBoardCode.KEY_Q,
            KeyBoardCode.KEY_W,
            KeyBoardCode.KEY_E,
            KeyBoardCode.KEY_R,
            KeyBoardCode.KEY_T,
            KeyBoardCode.KEY_Y,
            KeyBoardCode.KEY_U,
            KeyBoardCode.KEY_I,
            KeyBoardCode.KEY_O,
            KeyBoardCode.KEY_P
        ];

        const keyArr3 = [
            KeyBoardCode.Caps,
            KeyBoardCode.KEY_A,
            KeyBoardCode.KEY_S,
            KeyBoardCode.KEY_D,
            KeyBoardCode.KEY_F,
            KeyBoardCode.KEY_G,
            KeyBoardCode.KEY_H,
            KeyBoardCode.KEY_J,
            KeyBoardCode.KEY_K,
            KeyBoardCode.KEY_L,
            KeyBoardCode.DELETE
        ];

        const keyArr4 = [
            KeyBoardCode.Shift,
            KeyBoardCode.KEY_Z,
            KeyBoardCode.KEY_X,
            KeyBoardCode.KEY_C,
            KeyBoardCode.KEY_V,
            KeyBoardCode.KEY_B,
            KeyBoardCode.KEY_N,
            KeyBoardCode.KEY_M,
            KeyBoardCode.Enter
        ];

        this.initRow(this.row_1, keyArr1);
        this.initRow(this.row_2, keyArr2);
        this.initRow(this.row_3, keyArr3);
        this.initRow(this.row_4, keyArr4);
    }

    private initRow(row: Node, keyArr: KeyBoardCode[]) {
        row.removeAllChildren();
        for (const keyCode of keyArr) {
            let itemNode: Node = null;
            if (keyCode === KeyBoardCode.Enter) {
                itemNode = instantiate(this.itemSendPrefab);
            } else {
                itemNode = instantiate(this.itemPrefab);
            }
            row.addChild(itemNode);
            itemNode.name = "btn_" + keyCode;
            const keyItem = itemNode.getComponent(KeyItem);
            if (keyItem) {
                keyItem.InitItem(keyCode, KeyBoardConfigs[keyCode]);
                keyItem.clickHandler = this.onKeyPress.bind(this);
            }
        }
    }

    private initKeyMapH() {

    }

    private onKeyPress(key: KeyBoardCode) {
        this.checkText();
        switch (key) {
            case KeyBoardCode.Caps:
                this.isCaps = !this.isCaps;
                this.updateKeyLabels();
                return;

            case KeyBoardCode.DELETE:
                const lastChild = this.inputContainer.children[this.inputContainer.children.length - 1];
                if (lastChild) {
                    this.inputContainer.removeChild(lastChild);
                }
                this.node.emit('text-changed', this.string); // 触发文本改变事件
                return;

            case KeyBoardCode.Enter:
                console.log("enter pressed");
                this.getFinalString();
                return;

            case KeyBoardCode.Shift:
                console.log("enter pressed");
                this.getFinalString();
                return;

            default:
                this.cursorBlink?.delayBlinking();
                const itemNode = instantiate(this.inputItemPrefab);
                const keyItem = itemNode.getComponent(InputItem);
                this.inputContainer.addChild(itemNode);
                keyItem.InputText = this.isCaps ? KeyBoardConfigs[key].caspLabel : KeyBoardConfigs[key].normalLabel;
                this.onTextChanged();
                break;
        }
    }

    private updateKeyLabels() {
        this.updateRowLabels(this.row_1);
        this.updateRowLabels(this.row_2);
        this.updateRowLabels(this.row_3);
        this.updateRowLabels(this.row_4);
    }

    private updateRowLabels(row: Node) {
        row.children.forEach(child => {
            const keyItem = child.getComponent(KeyItem);
            if (keyItem) {
                keyItem.updateLabel(this.isCaps);
            }
        });
    }

    private getFinalString(): string {
        let finalOutput = '';
        this.inputContainer.children.forEach(child => {
            const keyItem = child.getComponent(InputItem);
            if (keyItem) {
                finalOutput += keyItem.InputText;
            }
        });
        return finalOutput;
    }

    private checkText() {
        // 长度检测

        // 类型检测
    }

    private onTextChanged() {
        // 在这里处理文本改变的逻辑

        this.node.emit(EventType.TEXT_CHANGED, this.getFinalString()); // 触发文本改变事件
    }

    private onEditReturn(newText: string) {
        console.log("Edit return");
        // 在这里处理文本输入完成的逻辑
    }
}


