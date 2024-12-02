import { _decorator, Component, Node, Prefab, Button, EditBox, TextAsset, Label, instantiate, Vec3, tween } from 'cc';
import { InputItem } from './InputItem';
import { CursorBlink } from './CursorBlink';
import { EventType, InputMode, KeyBoardCode, KeyBoardConfigs } from './KeyboardDefine';
import { KeyItem } from './KeyItem';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';

const { ccclass, property } = _decorator;

const KEY_ARR_V = [
    [KeyBoardCode.NUM_1, KeyBoardCode.NUM_2, KeyBoardCode.NUM_3, KeyBoardCode.NUM_4, KeyBoardCode.NUM_5, KeyBoardCode.NUM_6, KeyBoardCode.NUM_7, KeyBoardCode.NUM_8, KeyBoardCode.NUM_9, KeyBoardCode.NUM_0, KeyBoardCode.NUM_DECIMAL],
    [KeyBoardCode.KEY_Q, KeyBoardCode.KEY_W, KeyBoardCode.KEY_E, KeyBoardCode.KEY_R, KeyBoardCode.KEY_T, KeyBoardCode.KEY_Y, KeyBoardCode.KEY_U, KeyBoardCode.KEY_I, KeyBoardCode.KEY_O, KeyBoardCode.KEY_P],
    [KeyBoardCode.Caps, KeyBoardCode.KEY_A, KeyBoardCode.KEY_S, KeyBoardCode.KEY_D, KeyBoardCode.KEY_F, KeyBoardCode.KEY_G, KeyBoardCode.KEY_H, KeyBoardCode.KEY_J, KeyBoardCode.KEY_K, KeyBoardCode.KEY_L, KeyBoardCode.DELETE],
    [KeyBoardCode.Shift, KeyBoardCode.KEY_Z, KeyBoardCode.KEY_X, KeyBoardCode.KEY_C, KeyBoardCode.KEY_V, KeyBoardCode.KEY_B, KeyBoardCode.KEY_N, KeyBoardCode.KEY_M, KeyBoardCode.Enter]
];

const KEY_ARR_SHIFT = [
    [KeyBoardCode.NUM_1, KeyBoardCode.NUM_2, KeyBoardCode.NUM_3, KeyBoardCode.NUM_4, KeyBoardCode.NUM_5, KeyBoardCode.NUM_6, KeyBoardCode.NUM_7, KeyBoardCode.NUM_8, KeyBoardCode.NUM_9, KeyBoardCode.NUM_0, KeyBoardCode.NUM_DECIMAL],
    [KeyBoardCode.KEY_GRAVE, KeyBoardCode.KEY_TILDE, KeyBoardCode.KEY_EXCLAMATION, KeyBoardCode.KEY_AT, KeyBoardCode.KEY_HASH, KeyBoardCode.KEY_DOLLAR, KeyBoardCode.KEY_PERCENT, KeyBoardCode.KEY_CARET, KeyBoardCode.KEY_AMPERSAND, KeyBoardCode.KEY_ASTERISK],
    [KeyBoardCode.Caps, KeyBoardCode.KEY_LEFT_PARENTHESIS, KeyBoardCode.KEY_RIGHT_PARENTHESIS, KeyBoardCode.KEY_MINUS, KeyBoardCode.KEY_PLUS, KeyBoardCode.KEY_LEFT_BRACE, KeyBoardCode.KEY_RIGHT_BRACE, KeyBoardCode.KEY_LEFT_BRACKET, KeyBoardCode.KEY_RIGHT_BRACKET, KeyBoardCode.KEY_PIPE, KeyBoardCode.DELETE],
    [KeyBoardCode.Shift, KeyBoardCode.KEY_COLON, KeyBoardCode.KEY_SEMICOLON, KeyBoardCode.KEY_QUOTE, KeyBoardCode.KEY_LESS, KeyBoardCode.KEY_GREATER, KeyBoardCode.KEY_SLASH, KeyBoardCode.KEY_QUESTION, KeyBoardCode.Enter]
];


@ccclass('Keyboard')
export default class Keyboard extends Component {
    @property(Prefab) private itemPrefab: Prefab = null;
    @property(Prefab) private itemSendPrefab: Prefab = null;
    @property(Prefab) private inputItemPrefab: Prefab = null;
    @property(Button) private btn_clear: Button = null!;
    @property({ readonly: true }) private vertical: boolean = true;
    @property(Node) private inputNode: Node = null!;
    @property(Node) private row_1: Node = null!;
    @property(Node) private row_2: Node = null!;
    @property(Node) private row_3: Node = null!;
    @property(Node) private row_4: Node = null!;
    @property(Node) private cursorNode: Node = null!;
    @property(Node) private inputContainer: Node = null!;
    @property(Node) private bgBoxContainer: Node = null!;
    @property(Node) private boardContainer: Node = null!;

    private cursorBlink: CursorBlink | null = null;
    private isCaps: boolean = false;    // 大小写
    private isShift: boolean = false;   // 切换键盘

    public onEditEnd: Function;
    public onEditChanged: Function;

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
    private _maxLength: number = 20;
    get maxLength(): number {
        return this._maxLength;
    }
    set maxLength(value: number) {
        this._maxLength = value;
    }

    /**
    * @zh
    * 指定输入模式: ANY表示多行输入，其它都是单行输入，移动平台上还可以指定键盘样式。
    */
    private _inputMode: InputMode = InputMode.ANY;
    get inputMode() {
        return this._inputMode;
    }
    set inputMode(oldValue: InputMode) {
        this._inputMode = oldValue;
    }

    onLoad() {
        this.vertical ? this.initKeyMap(KEY_ARR_V) : this.initKeyMapH()
        this.cursorBlink = this.cursorNode.getComponent(CursorBlink);
        this.btn_clear.node.on(Button.EventType.CLICK, this.onClear, this);
    }

    // openMoveContainer() {
    //     this.bgBoxContainer.setPosition(0, -160, 0);
    //     this.boardContainer.setPosition(0, -1500, 0);
    //     tween(this.boardContainer)
    //         .to(0.5, { position: new Vec3(0, -570, 0) }) // 0.5秒内移动到目标位置
    //         .start();
    // }

    // closeMoveContainer() {
    //     tween(this.bgBoxContainer)
    //         .by(0.3, { position: new Vec3(0, -1000, 0) }) // 0.5秒内移动到目标位置
    //         .start();
    //     tween(this.boardContainer)
    //         .by(0.3, { position: new Vec3(0, -1000, 0) }) // 0.5秒内移动到目标位置
    //         .start();
    // }

    // delayCloseMoveContainer(): Promise<void> {
    //     return new Promise((resolve) => {
    //         this.closeMoveContainer(); // 关闭的移动方法
    //         setTimeout(() => {
    //             // 动画或操作完成后
    //             resolve(); // 结束Promise
    //         }, 300); // 根据实际情况修改时间
    //     });
    // }

    private onClear() {
        this.inputContainer.removeAllChildren();
    }

    private initKeyMap(keyArr: KeyBoardCode[][]) {
        this.initRow(this.row_1, keyArr[0]);
        this.initRow(this.row_2, keyArr[1]);
        this.initRow(this.row_3, keyArr[2]);
        this.initRow(this.row_4, keyArr[3]);
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
                this.onTextChanged();
                return;

            case KeyBoardCode.Enter:
                this.onEditReturn(this.string);
                return;

            case KeyBoardCode.Shift:
                this.isShift = !this.isShift;
                this.isShift ? this.initKeyMap(KEY_ARR_SHIFT) : this.initKeyMap(KEY_ARR_V);
                return;

            default:
                this.handleDefaultKeyPress(key);
                break;
        }
    }

    private handleDefaultKeyPress(key: KeyBoardCode) {
        if (this.inputContainer.children.length > this.maxLength) return;

        // 限制输入整数
        if (this.inputMode === InputMode.NUMERIC) {
            if (key < KeyBoardCode.NUM_0 || key > KeyBoardCode.NUM_9) {
                console.error("key: ", key);
                return;
            }
        }
        // 限制输入小数
        if (this.inputMode === InputMode.DECIMAL) {
            if (key < KeyBoardCode.NUM_0 || key > KeyBoardCode.NUM_DECIMAL)
                return;

            // 只能输入一个小数点
            if (key === KeyBoardCode.NUM_DECIMAL) {
                let hasDecimal = false;
                this.inputContainer.children.forEach(child => {
                    const keyItem = child.getComponent(InputItem);
                    if (keyItem && keyItem.InputText === KeyBoardConfigs[KeyBoardCode.NUM_DECIMAL].normalLabel) {
                        hasDecimal = true;
                    }
                });
                if (hasDecimal) return;
            }
        }

        this.cursorBlink?.delayBlinking();
        const itemNode = instantiate(this.inputItemPrefab);
        const keyItem = itemNode.getComponent(InputItem);
        this.inputContainer.addChild(itemNode);
        keyItem.InputText = this.isCaps ? KeyBoardConfigs[key].caspLabel : KeyBoardConfigs[key].normalLabel;
        this.onTextChanged();
    }

    private updateKeyLabels() {
        [this.row_1, this.row_2, this.row_3, this.row_4].forEach(row => this.updateRowLabels(row));
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

    private onTextChanged() {
        this.node.emit(EventType.TEXT_CHANGED, this.getFinalString()); // 触发文本改变事件
        if (this.onEditChanged) {
            this.onEditChanged();
        }
    }

    private onEditReturn(newText: string) {
        console.log("Edit return");
        if (this.onEditEnd) {
            this.onEditEnd(this.getFinalString());
        }
        oops.gui.remove(UIID.Keyboard, true);
        // this.onClear();
        // this.delayCloseMoveContainer().then(() => {
        //     oops.gui.remove(UIID.Keyboard, true);
        // });
    }
}


