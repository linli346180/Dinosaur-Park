import { Button, _decorator, Component, Node, Label, Prefab, instantiate, SpriteFrame, math } from 'cc';
import { UIID } from '../common/config/GameUIConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { PuzzleID, PuzzlePieceData } from '../puzzlePiece/PzzleConfig';
import { resLoader } from '../../../../extensions/oops-plugin-framework/assets/core/common/loader/ResLoader';
import { PzzleItem } from './PzzleItem';

const { ccclass, property } = _decorator;

/** 碎片拼图功能 */
@ccclass('Revive')
export class Revive extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null!;

    @property(Node)
    level_1: Node = null!;
    @property(Node)
    level_2: Node = null!;

    @property(Button)
    btn_close: Button = null!;
    @property(Button)
    btn_left: Button = null!;
    @property(Button)
    btn_right: Button = null!;
    @property(Button)
    btn_onekey: Button = null!;

    @property(Node)
    pieces_panel: Node = null!;

    @property(Label)
    label_level: Label = null!;
    @property(Label)
    label_name: Label = null!;

    private _index: PuzzleID = PuzzleID.Primary;
    private _spriteFrames: SpriteFrame[] = [];

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_left?.node.on(Button.EventType.CLICK, this.onLeft, this);
        this.btn_right?.node.on(Button.EventType.CLICK, this.onRight, this);
        this.btn_onekey?.node.on(Button.EventType.CLICK, this.onOneKey, this);
        this.updateUI();
    }

    closeUI() {
        oops.gui.remove(UIID.Revive);
    }

    onLeft() {
        this._index = math.clamp(this._index - 1, PuzzleID.Primary, PuzzleID.Intermediate);
        this.updateUI();
    }

    onRight() {
        this._index = math.clamp(this._index + 1, PuzzleID.Primary, PuzzleID.Intermediate);
        this.updateUI();
    }

    updateUI() {
        this.btn_left.node.active = this._index > PuzzleID.Primary;
        this.btn_right.node.active = this._index < PuzzleID.Intermediate;

        this.level_1.active = this._index == PuzzleID.Primary;
        this.level_2.active = this._index == PuzzleID.Intermediate;

        const puzzleData = PuzzlePieceData[this._index];
        this.label_level.string = puzzleData.level;
        this.label_name.string = puzzleData.name;

        resLoader.loadDir("bundle", puzzleData.imagePath, SpriteFrame, (err: any, assets: any) => {
            if (err) {
                console.error(err);
                return;
            }
            this._spriteFrames = assets.sort((a: any, b: any) => a.name.localeCompare(b.name));
            this.populatePieces(puzzleData.quantity);
        });
    }

    populatePieces(quantity: number) {
        if (this.itemPrefab != null) {
            this.pieces_panel.removeAllChildren();
            for (let i = 0; i < quantity; i++) {
                const item = instantiate(this.itemPrefab);
                this.pieces_panel.addChild(item);
                const pzzleItem = item.getComponent<PzzleItem>(PzzleItem);
                if (pzzleItem) {
                    pzzleItem.Init(i, 10, this._spriteFrames[i]);
                    pzzleItem.OnClickCallback = this.onItemClicked.bind(this);
                }
            }
        }
    }

    onItemClicked(index: number) {
        console.log("onItemClicked", index);
        if (this._index == PuzzleID.Primary) {
            this.level_1.children[index].active = !this.level_1.children[index].active;
        } else {
            this.level_2.children[index].active = !this.level_2.children[index].active;
        }
    }

    onOneKey() {
        if (this._index == PuzzleID.Primary) {
            this.level_1.children.forEach((child) => {
                child.active = false;
            });
        } else {
            this.level_2.children.forEach((child) => {
                child.active = false;
            });
        }
    }
}