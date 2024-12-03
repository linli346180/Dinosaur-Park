import { _decorator, Component, Node, Label, Sprite, Button, math, SpriteFrame } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { IsPur, PurConCoin, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { resLoader } from '../../../../extensions/oops-plugin-framework/assets/core/common/loader/ResLoader';
import { KnapsackControlle } from './KnapsackControlle';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('AdoptionView')
export class AdoptionView extends Component {
    @property(Button)
    private btn_adopt_one: Button = null!;
    @property(Button)
    private btn_left: Button = null!;
    @property(Button)
    private btn_right: Button = null!;
    @property(Label)
    private price: Label = null!;
    @property(Sprite)
    private beast: Sprite = null!;
    @property(Label)
    private level: Label = null!;

    private _index: number = 0;
    private _configDataList: UserInstbConfigData[] = [];
    private _spriteFrames: SpriteFrame[] = [];

    start() {
        this.setupButtonHandlers();
        this.loadConfigData();
        this.loadSpriteFrames();
    }

    private setupButtonHandlers() {
        this.btn_adopt_one.node.on(Button.EventType.CLICK, this.adoptStartBeast, this);
        this.btn_left.node.on(Button.EventType.CLICK, this.onLeft, this);
        this.btn_right.node.on(Button.EventType.CLICK, this.onRight, this);
    }

    private loadConfigData() {
        this.getSTBConfig_PurGold();
        this._index = oops.storage.getNumber("STBConfigIndex", 0);
    }

    private loadSpriteFrames() {
        resLoader.loadDir("bundle", "gui/game/texture/adoption/", SpriteFrame, (err: any, assets: any) => {
            if (err) {
                console.error("Failed to load sprite frames:", err);
                return;
            }
            this._spriteFrames = assets.sort((a: any, b: any) => a.name.localeCompare(b.name));
            this.beast.spriteFrame = this._spriteFrames[this._index];
            this.initUI();
        });
    }

    private initUI() {
        this.changeSTBConfig();
    }

    private adoptStartBeast() {
        const config = this._configDataList[this._index];
        if (config) {
            console.log(`领养${config.stbName}`);
            smc.account.adopStartBeastNet(config.id, false, (success: boolean, msg: string) => {
                // if (!success) {
                //     oops.gui.toast(msg);
                // }
            });
        }
    }

    private onLeft() {
        this._index--;
        this.changeSTBConfig();
    }

    private onRight() {
        this._index++;
        this.changeSTBConfig();
    }

    private changeSTBConfig() {
        this._index = math.clamp(this._index, 0, this._configDataList.length - 1);
        const config = this._configDataList[this._index];
        this.level.string = config.stbGrade.toString();
        this.price.string = config.purConCoinNum.toString();
        if (this._spriteFrames.length > this._index) {
            this.beast.spriteFrame = this._spriteFrames[this._index];
        }
        oops.storage.set("STBConfigIndex", this._index);
    }

    /** 获取使用金币购买的黄金星兽配置 */
    private getSTBConfig_PurGold() {
        this._configDataList = smc.account.STBConfigMode.instbConfigData.filter(element =>
            element.isPur === IsPur.Yes && element.purConCoin === PurConCoin.gold
        ).sort((a, b) => a.stbGrade - b.stbGrade);
    }
}