import { _decorator, Component, Node, Label, Sprite, Button, math, SpriteFrame } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { IsPur, PurConCoin, UserInstbConfigData } from '../account/model/STBConfigModeComp';
import { resLoader } from '../../../../extensions/oops-plugin-framework/assets/core/common/loader/ResLoader';
import { KnapsackControlle } from './KnapsackControlle';
import { AccountNetService } from '../account/AccountNet';
import { smc } from '../common/SingletonModuleComp';
const { ccclass, property } = _decorator;

@ccclass('AdoptionView')
export class AdoptionView extends Component {
    @property(Button)
    btn_adopt_one: Button = null!;
    @property(Button)
    btn_left: Button = null!;
    @property(Button)
    btn_right: Button = null!;
    @property(Label)
    price: Label = null!;
    @property(Sprite)
    beast: Sprite = null!;

    private _index: number = 0;
    private _configDataList: UserInstbConfigData[] = [];
    private _spriteFrames: SpriteFrame[] = [];

    start() {
        this.btn_adopt_one.node.on(Button.EventType.CLICK, this.onAdoptOne, this);
        this.btn_left.node.on(Button.EventType.CLICK, this.onLeft, this);
        this.btn_right.node.on(Button.EventType.CLICK, this.onRight, this);
        this.getSTBConfig_PurGold();
        this._index = oops.storage.getNumber("STBConfigIndex", 0);
        const path = "gui/game/texture/adoption/";
        resLoader.loadDir("bundle", path, SpriteFrame, (err: any, assets: any) => {
            this._spriteFrames = assets.sort((a: any, b: any) => a.name.localeCompare(b.name));
            this.beast.spriteFrame = this._spriteFrames[this._index];
            this.InitUI();
        });
    }

    InitUI() {
        this.changeSTBConfig();
    }

    onAdoptOne() {
        // console.log("领养星兽:" + this._index + "  id:" + this._configDataList[this._index].id);
        KnapsackControlle.instance?.AdopStartBeast(this._configDataList[this._index].id);
    }

    onLeft() {
        this._index--;
        this.changeSTBConfig();
    }
    onRight() {
        this._index++;
        this.changeSTBConfig();
    }

    changeSTBConfig() {
        this._index = math.clamp(this._index, 0, this._configDataList.length - 1);
        oops.storage.set("STBConfigIndex", this._index);
        this.price.string = this._configDataList[this._index].purConCoinNum.toString();
        if (this._spriteFrames.length > this._index) {
            this.beast.spriteFrame = this._spriteFrames[this._index];
        }
    }

    getSTBConfig_PurGold() {
        this._configDataList = [];
        smc.account.STBConfigMode.instbConfigData.forEach(element => {
            if (element.isPur === IsPur.Yes && element.purConCoin === PurConCoin.gold) {
                this._configDataList.push(element);
            }
        });
        this._configDataList.sort((a, b) => a.id - b.id);
    }
}