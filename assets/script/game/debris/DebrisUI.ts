import { Button, _decorator, Component, Node, Label, Prefab, instantiate, SpriteFrame, math } from 'cc';
import { UIID } from '../common/config/GameUIConfig';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { PzzleItem } from './PzzleItem';
import { ReviveNetService } from './ReviveNet';
import { DebrisConfigData, DebrisDetail, PuzzleID, UserDebrisData } from './DebrisData';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { DebrisResult } from './DebrisResult';

const { ccclass, property } = _decorator;

/** 碎片拼图功能 */
@ccclass('Debris')
export class Debris extends Component {
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
    private debrisData: UserDebrisData = new UserDebrisData();
    private configData: DebrisConfigData = new DebrisConfigData();

    protected onLoad(): void {
        this.pieces_panel.removeAllChildren();
    }

    start() {
        this.btn_close?.node.on(Button.EventType.CLICK, this.closeUI, this);
        this.btn_left?.node.on(Button.EventType.CLICK, this.onLeft, this);
        this.btn_right?.node.on(Button.EventType.CLICK, this.onRight, this);
        this.btn_onekey?.node.on(Button.EventType.CLICK, this.onOneKey, this);
        this.initUI();
    }

    closeUI() {
        oops.gui.remove(UIID.Revive);
    }

    onLeft() {
        const index = math.clamp(this._index - 1, PuzzleID.Primary, PuzzleID.Intermediate);
        this.updateUI(index);
    }

    onRight() {
        const index = math.clamp(this._index + 1, PuzzleID.Primary, PuzzleID.Intermediate);
        this.updateUI(index);
    }

    async initUI() {
        // 获取碎片配置
        this.configData.debrisConfigList = await ReviveNetService.getDebrisConfig();
        this.pieces_panel.removeAllChildren();
        this.configData.debrisConfigList.forEach((config) => {
            if (config.id == this._index) {
                config.debrisDetailsArr.forEach((detail) => {
                    this.createItem(detail);
                });
            }
        });

        this.updateUI(this._index);
    }

    createItem(config: DebrisDetail) {
        const item = instantiate(this.itemPrefab);
        this.pieces_panel.addChild(item);
        const pzzleItem = item.getComponent<PzzleItem>(PzzleItem);
        if (pzzleItem) {
            pzzleItem.initItem(config.debrisID, config.id, config.position, 0);
            pzzleItem.OnClick = this.onItemClicked.bind(this);
        }
    }

    async updateUI(index: number) {
        if (this._index != index) {
            this.pieces_panel.removeAllChildren();
            this.configData.debrisConfigList.forEach((config) => {
                if (config.id == index) {
                    config.debrisDetailsArr.forEach((detail) => {
                        this.createItem(detail);
                    });
                }
            });
        }

        this._index = index;
        this.btn_left.node.active = this._index > PuzzleID.Primary;
        this.btn_right.node.active = this._index < PuzzleID.Intermediate;
        this.level_1.active = this._index == PuzzleID.Primary;
        this.level_2.active = this._index == PuzzleID.Intermediate;
        this.level_1.children.forEach((child) => { child.active = true; });
        this.level_2.children.forEach((child) => { child.active = true; });

        // 获取用户碎片数据
        this.debrisData.userDebrisList = await ReviveNetService.getUserDebrisData();
        this.pieces_panel.children.forEach((child) => {
            let pzzleItem = child.getComponent<PzzleItem>(PzzleItem);
            if (pzzleItem) {
                let debrisNum = this.getUserDebrisData(pzzleItem.debrisID, pzzleItem.debrisDetailsID);
                pzzleItem.Count = debrisNum;
            }
        });
    }

    /** 获取用户碎片数量 */
    getUserDebrisData(debrisID: number, debrisDetailsID: number): number {
        let num = 0;
        this.debrisData.userDebrisList.forEach((userDebris) => {
            if (userDebris.debrisID == debrisID && userDebris.debrisDetailsID == debrisDetailsID) {
                num = userDebris.debrisNum;
            }
        });
        return num;
    }

    onItemClicked(index: number) {
        if (this._index == PuzzleID.Primary) {
            let childNode = this.level_1.getChildByName(index.toString());
            if (childNode)
                childNode.active = false;
            this.checkAddDebris(this.level_1);
        } else {
            let childNode = this.level_2.getChildByName(index.toString());
            if (childNode)
                childNode.active = false;
            this.checkAddDebris(this.level_2);
        }
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

    onOneKey() {
        console.log("一键拼图");
        let debrisConfig = this.configData.debrisConfigList.find((config) => {
            return config.id == this._index;
        });

        if (debrisConfig) {
            let rootNode = this._index == PuzzleID.Primary ? this.level_1 : this.level_2;
            debrisConfig.debrisDetailsArr.forEach((detail) => {
                let count = this.getUserDebrisData(detail.debrisID, detail.id);
                if (count > 0) {
                    let childNode = rootNode.getChildByName(detail.position.toString());
                    if (childNode)
                        childNode.active = false;
                }
            });
            this.checkAddDebris(rootNode);
        }
    }

    async requestDebrisData() {
        let respose = await ReviveNetService.clampDebris(this._index);
        if (respose) {
            if (respose.resultCode == "OK") {
                var uic: UICallbacks = {
                    onAdded: (node: Node, params: any) => {
                        const widget = node.getComponent(DebrisResult);
                        widget?.initUI(respose.userInstb.stbConfigID, 1);
                    }
                };
                let uiArgs: any;
                this.scheduleOnce(() => {
                    oops.gui.open(UIID.DebrisResult, uiArgs, uic);
                    this.updateUI(this._index)
                }, 1);
            } else {
                oops.gui.toast(respose.resultMsg, false);
            }
        }
    }
}