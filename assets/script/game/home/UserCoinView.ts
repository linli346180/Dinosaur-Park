import { _decorator, Component, Button, Label } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { Node } from 'cc';
import { math } from 'cc';
import { CoinType } from '../hatch/HatchDefine';
import { AccountCoinType, UserCoinData } from '../account/AccountDefine';
import { v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UserCoinView')
export class UserCoinView extends Component {
    @property(Node)
    status_gold: Node = null!;
    @property(Node)
    status_gem: Node = null!;
    @property(Node)
    status_dinosaur: Node = null!;
    @property(Node)
    status_usdt: Node = null!;

    private goldCoin: Label = null!;
    private gemsCoin: Label = null!;
    private starBeastCoin: Label = null!;
    private usdtCoin: Label = null!;
    private btn_buygem: Button = null!;
    private btn_buyusdt: Button = null!;
    private coinData: UserCoinData = new UserCoinData();

    start() {
        this.status_gold.getChildByName("btn_show")?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            this.playCoinAnim(AccountCoinType.Gold, 0, 1.5);
        });
        this.status_gem.getChildByName("btn_show")?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            this.playCoinAnim(AccountCoinType.Gems, 0, 0.5);
        });
        this.status_dinosaur.getChildByName("btn_show")?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            this.playCoinAnim(AccountCoinType.StarBeast, 0, 1.5);
        });
        this.status_usdt.getChildByName("btn_show")?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            this.playCoinAnim(AccountCoinType.USDT, 0, 1.5);
        });

        this.goldCoin = this.status_gold.getChildByName("num")?.getComponent(Label)!;
        this.gemsCoin = this.status_gem.getChildByName("num")?.getComponent(Label)!;
        this.starBeastCoin = this.status_dinosaur.getChildByName("num")?.getComponent(Label)!;
        this.usdtCoin = this.status_usdt.getChildByName("num")?.getComponent(Label)!;

        this.btn_buygem = this.status_gem.getChildByName("btn_buy")?.getComponent(Button)!;
        this.btn_buyusdt = this.status_usdt.getChildByName("btn_buy")?.getComponent(Button)!;
        this.btn_buygem?.node.on(Button.EventType.CLICK, this.buyGem, this);
        this.btn_buyusdt?.node.on(Button.EventType.CLICK, this.buyUsdt, this);

        oops.message.on(AccountEvent.CoinDataChange, this.onHandler, this);
        this.initUI();
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.CoinDataChange:
                this.initUI(true);
                break
        }
    }

    private initUI(showAnim: boolean = false) {
        if (showAnim) {
            if (this.coinData.goldCoin != smc.account.AccountModel.CoinData.goldCoin)
                this.playCoinAnim(AccountCoinType.Gold, 1);
            if (this.coinData.gemsCoin != smc.account.AccountModel.CoinData.gemsCoin)
                this.playCoinAnim(AccountCoinType.Gems, 0);
            if (this.coinData.starBeastCoin != smc.account.AccountModel.CoinData.starBeastCoin)
                this.playCoinAnim(AccountCoinType.StarBeast, 0);
            if (this.coinData.usdt != smc.account.AccountModel.CoinData.usdt)
                this.playCoinAnim(AccountCoinType.USDT, 0);

            Object.assign(this.coinData, smc.account.AccountModel.CoinData);
        } else {
            Object.assign(this.coinData, smc.account.AccountModel.CoinData);
            this.goldCoin.string = StringUtil.formatMoney(this.coinData.goldCoin);
            this.gemsCoin.string = StringUtil.formatMoney(this.coinData.gemsCoin);
            this.starBeastCoin.string = StringUtil.formatMoney(this.coinData.starBeastCoin);
            this.usdtCoin.string = StringUtil.formatMoney(this.coinData.usdt);
        }
    }

    private buyGem() {
        oops.gui.open(UIID.GemShop)
    }

    private buyUsdt() {
        console.log("buyusdt");
    }

    // 播放金币增加动画
    playCoinAnim(coinType: AccountCoinType, delaySec: number = 0, holdSec: number = 1) {
        let label: Label = null!;
        let startNum: number = 0;
        let endNum: number = 0;
        switch (coinType) {
            case AccountCoinType.Gold:
                label = this.goldCoin;
                startNum = Math.floor(this.coinData.goldCoin);
                endNum = Math.floor(smc.account.AccountModel.CoinData.goldCoin);
                break;
            case AccountCoinType.Gems:
                label = this.gemsCoin;
                startNum = Math.floor(this.coinData.gemsCoin);
                endNum = Math.floor(smc.account.AccountModel.CoinData.gemsCoin);
                break;
            case AccountCoinType.StarBeast:
                label = this.starBeastCoin;
                startNum = Math.floor(this.coinData.starBeastCoin);
                endNum = Math.floor(smc.account.AccountModel.CoinData.starBeastCoin);
                break;
            case AccountCoinType.USDT:
                label = this.usdtCoin;
                startNum = Math.floor(this.coinData.usdt);
                endNum = Math.floor(smc.account.AccountModel.CoinData.usdt);
                break;
        }
        if (label == null) return;

        const targetScale = new Vec3(1.2, 1.2, 1.2);
        if (!label.node.scale.equals(Vec3.ONE)) {
            console.log("playCoinAnim: label.node.scale != Vec3.ONE", label.node.scale);
            return;
        }

        tween(label.node)
            .delay(delaySec)
            .to(0.1, { scale: Vec3.ZERO })
            .call(() => { label.string = startNum.toString(); })
            .to(0.1, { scale: targetScale })
            .to(holdSec, {}, {
                onUpdate: (target, ratio) => {
                    if(ratio == undefined) return;
                    const currentNum =  Math.floor(startNum + (endNum - startNum) * ratio);
                    label.string = currentNum.toString();
                }
            })
            .to(0.1, { scale: Vec3.ZERO })
            .call(() => {
                label.string = StringUtil.formatMoney(endNum);;
            })
            .to(0.1, { scale: Vec3.ONE })
            .start();
    }

}