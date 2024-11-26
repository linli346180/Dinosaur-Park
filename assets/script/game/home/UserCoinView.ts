import { _decorator, Component, Button, Label, Node, tween, Vec3, v3 } from 'cc';
import { StringUtil } from '../common/utils/StringUtil';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { AccountCoinType, UserCoinData } from '../account/AccountDefine';

const { ccclass, property } = _decorator;

@ccclass('UserCoinView')
export class UserCoinView extends Component {
    @property(Node)
    private status_gold: Node = null!;
    @property(Node)
    private status_gem: Node = null!;
    @property(Node)
    private status_dinosaur: Node = null!;
    @property(Node)
    private status_usdt: Node = null!;

    private goldCoin: Label = null!;
    private gemsCoin: Label = null!;
    private starBeastCoin: Label = null!;
    private usdtCoin: Label = null!;
    private btn_buygem: Button = null!;
    private btn_buyusdt: Button = null!;
    private coinData: UserCoinData = new UserCoinData();
    private playingNode: Set<Node> = new Set();

    start() {
        this.goldCoin = this.status_gold.getChildByName("num")?.getComponent(Label)!;
        this.gemsCoin = this.status_gem.getChildByName("num")?.getComponent(Label)!;
        this.starBeastCoin = this.status_dinosaur.getChildByName("num")?.getComponent(Label)!;
        this.usdtCoin = this.status_usdt.getChildByName("num")?.getComponent(Label)!;

        this.btn_buygem = this.status_gem.getChildByName("btn_buy")?.getComponent(Button)!;
        this.btn_buyusdt = this.status_usdt.getChildByName("btn_buy")?.getComponent(Button)!;
        this.btn_buygem?.node.on(Button.EventType.CLICK, () => { oops.gui.open(UIID.GemShop) }, this);
        this.btn_buyusdt?.node.on(Button.EventType.CLICK, this.openWallet, this);

        this.setupButtonHandler(this.status_gold, AccountCoinType.Gold);
        this.setupButtonHandler(this.status_gem, AccountCoinType.Gems);
        this.setupButtonHandler(this.status_dinosaur, AccountCoinType.StarBeast);
        this.setupButtonHandler(this.status_usdt, AccountCoinType.USDT);

        oops.message.on(AccountEvent.CoinDataChange, this.onHandler, this);
        this.initUI();
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.onHandler, this);
    }

    private initUI() {
        Object.assign(this.coinData, smc.account.AccountModel.CoinData);
        this.goldCoin.string = StringUtil.formatMoney(this.coinData.goldCoin);
        this.gemsCoin.string = StringUtil.formatMoney(this.coinData.gemsCoin);
        this.starBeastCoin.string = StringUtil.formatMoney(this.coinData.starBeastCoin);
        this.usdtCoin.string = StringUtil.formatMoney(this.coinData.usdt);
    }

    private openWallet() {
        oops.gui.toast(oops.language.getLangByID("common_tips_Not_Enabled"));
        return;
        oops.gui.open(UIID.Wallet)
    }

    private setupButtonHandler(statusNode: Node, coinType: AccountCoinType, holdSec: number = 1) {
        statusNode.getChildByName("btn_show")?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            this.playCoinAnim(coinType, 0, holdSec);
        });
    }

    private onHandler(event: string, args: any) {
        if (event === AccountEvent.CoinDataChange) {
            this.updateCoinDataWithAnim();
        }
    }

    // 播放金币增加动画
    private updateCoinDataWithAnim() {
        if (this.coinData.goldCoin !== smc.account.AccountModel.CoinData.goldCoin) {
            this.playCoinAnim(AccountCoinType.Gold, 1, 1, () => {
                this.goldCoin.string = StringUtil.formatMoney(this.coinData.goldCoin);
            });
        }

        if (this.coinData.gemsCoin !== smc.account.AccountModel.CoinData.gemsCoin) {
            this.playCoinAnim(AccountCoinType.Gems, 0, 1, () => {
                this.gemsCoin.string = StringUtil.formatMoney(this.coinData.gemsCoin);
            });
        }

        if (this.coinData.starBeastCoin !== smc.account.AccountModel.CoinData.starBeastCoin) {
            this.playCoinAnim(AccountCoinType.StarBeast, 0, 1, () => {
                this.starBeastCoin.string = StringUtil.formatMoney(this.coinData.starBeastCoin);
            });
        }

        if (this.coinData.usdt !== smc.account.AccountModel.CoinData.usdt) {
            this.playCoinAnim(AccountCoinType.USDT, 0, 1, () => {
                this.usdtCoin.string = StringUtil.formatMoney(this.coinData.usdt);
            });
        }

        Object.assign(this.coinData, smc.account.AccountModel.CoinData);
    }

    /**
     * Plays a coin animation.
     * 
     * @param coinType - The type of the coin.
     * @param delaySec - 延迟播放时间
     * @param holdSec - 持续时间
     * @param decimalPlaces - 小数点精度
     */
    playCoinAnim(coinType: AccountCoinType, delaySec: number = 0, holdSec: number = 1, callback?: Function) {
        const { label, startNum, endNum } = this.getCoinAnimData(coinType);
        if (!label || this.playingNode.has(label.node)) return;

        const targetScale = new Vec3(1.2, 1.2, 1.2);
        this.playingNode.add(label.node);

        tween(label.node)
            .delay(delaySec)
            .to(0.1, { scale: Vec3.ZERO })
            .call(() => { label.string = startNum.toString(); })
            .to(0.1, { scale: targetScale })
            .to(holdSec, {}, {
                onUpdate: (target, ratio) => {
                    if (ratio == undefined) return;
                    if (startNum != endNum) {
                        const currentNum = Math.floor(startNum + (endNum - startNum) * ratio);
                        label.string = currentNum.toString();
                    }
                }
            })
            .to(0.1, { scale: Vec3.ZERO })
            .call(() => {
                this.playingNode.delete(label.node);
                label.string = StringUtil.formatMoney(endNum);

                if (callback) callback();
            })
            .to(0.1, { scale: Vec3.ONE })
            .start();
    }

    private getCoinAnimData(coinType: AccountCoinType) {
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
                startNum = Math.floor(this.coinData.starBeastCoin)
                endNum = Math.floor(smc.account.AccountModel.CoinData.starBeastCoin);
                break;
            case AccountCoinType.USDT:
                label = this.usdtCoin;
                startNum = smc.account.AccountModel.CoinData.usdt;
                endNum = smc.account.AccountModel.CoinData.usdt;
                break;
        }
        return { label, startNum, endNum };
    }
}