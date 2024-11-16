import { _decorator, Component, Button, Label, Node, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { GemShopItem } from './GemShopItem';
import { BuyGemsConfig } from '../shop/MergeDefine';

import { TonConnectUI } from '@tonconnect/ui';

import { WalletNetService } from './WalletNet';
import { WalletConfig } from './WalletDefine';

const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    @property(Button)
    btn_close: Button = null!;
    @property(Label)
    gemNum: Label = null!;

    @property({ type: Node })
    itemContent: Node = null!;
    @property(Prefab)
    itemPrefab: Prefab = null!;

    @property(Button)
    btn_connect: Button = null!;
    @property(Button)
    btn_disconnect: Button = null!;

    private tonConnectUI: TonConnectUI = null;
    private walletConfig: WalletConfig = new WalletConfig();
    private gemConfigs: BuyGemsConfig[] = [];

    async onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.GemShop, false); }, this);
        this.btn_connect?.node.on(Button.EventType.CLICK, this.connectTonWallet, this);
        this.btn_disconnect?.node.on(Button.EventType.CLICK, this.disConnectTonWallet, this);
        oops.message.on(AccountEvent.CoinDataChange, this.initCoinData, this);

        this.initUI();
        this.initTonConnectUI();
    }

    onEnable() {
        this.initCoinData();
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.initCoinData, this);
    }

    /** 初始化购买选项 */
    private async initUI() {
        this.gemConfigs = [];
        this.itemContent.removeAllChildren();
        const res = await AccountNetService.getBugGemConfig();
        if (res && res.buyGemsConfigArr != null) {
            this.gemConfigs = res.buyGemsConfigArr;
            this.gemConfigs.sort((a, b) => a.id - b.id);

            let level = 1;
            for (const gemConfig of this.gemConfigs) {
                this.createItem(gemConfig, level);
                level++;
            }
        }
    }

    private createItem(gemConfig: any, level: number = 1) {
        let itemNode = instantiate(this.itemPrefab);
        if (itemNode) {
            this.itemContent.addChild(itemNode);
            const comp = itemNode.getComponent(GemShopItem);
            if (comp) {
                comp.initItem(gemConfig, level);
                comp.onItemClicked = this.onItemClicked.bind(this);
            }
        }
    }

    /** 初始化钱包 */
    private async initTonConnectUI() {
        const res = await WalletNetService.getTonProof();
        if (res && res?.proof) {
            this.walletConfig.proof = res.proof;
            this.walletConfig.address = res.address;
        }

        try {
            this.tonConnectUI = new TonConnectUI({
                manifestUrl: this.walletConfig.manifestUrl
            });
            this.tonConnectUI.setConnectRequestParameters({
                state: 'ready',
                value: { tonProof: this.walletConfig.proof }
            });
            this.tonConnectUI.onStatusChange(async wallet => {
                let isConnected = wallet != null;
                console.warn("钱包连接状态改变:", wallet);
                if (wallet && wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
                    this.walletConfig.netWork = wallet.account.chain;
                    this.walletConfig.state_init = wallet.account.walletStateInit;
                    this.walletConfig.publicKey = wallet.account.publicKey;

                    this.walletConfig.name = wallet.connectItems.tonProof.name;
                    this.walletConfig.payload = wallet.connectItems.tonProof.proof.payload;
                    this.walletConfig.signature = wallet.connectItems.tonProof.proof.signature;
                    this.walletConfig.timestamp = wallet.connectItems.tonProof.proof.timestamp;

                    this.walletConfig.value = wallet.connectItems.tonProof.proof.domain.value;
                    this.walletConfig.lengthBytes = wallet.connectItems.tonProof.proof.domain.lengthBytes;
                }
                this.updateButtonState(isConnected);
            });

            // 重连钱包
            await this.tonConnectUI.connectionRestored;
            this.updateButtonState(this.tonConnectUI.connected);

            console.log("wallet:",this.tonConnectUI.wallet);
            console.log("account:",this.tonConnectUI.account);

        } catch (error) {
            console.error("初始化钱包异常", error);
        }
    }

    private async onItemClicked(configId: number) {
        const order = await WalletNetService.getUserOrder(configId);
        if (order && order?.payload) {
            console.log("获取订单成功", order);

            this.walletConfig.address = order.payload.address;
            this.walletConfig.proof = order.payload.proof;
            this.walletConfig.tonNano = order.payload.tonNano;

            const tonCheck = await WalletNetService.getTonCheck(this.walletConfig);
            if (tonCheck && tonCheck?.isPass == true) {
                console.log("Ton验证通过", tonCheck);
                this.sendTransaction();
            }
        }
    }

    private initCoinData() {
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    }

    private connectTonWallet() {
        try {
            this.tonConnectUI?.openModal();
        } catch (error) {
            console.error("连接钱包异常", error);
        }
    }

    private disConnectTonWallet() {
        try {
            this.tonConnectUI?.disconnect();
        } catch (error) {
            console.error("断开钱包异常", error);
        }
    }

    private async sendTransaction() {
        if (this.tonConnectUI == null || !this.tonConnectUI.connected) {
            this.connectTonWallet();
            return;
        }

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [
                {
                    address: this.walletConfig.address,
                    payload: this.walletConfig.payload,
                    amount: this.walletConfig.tonNano.toString(),
                }
            ]
        };
        await this.tonConnectUI.sendTransaction(transaction);
    }

    private updateButtonState(isConnect: boolean) {
        // console.log("钱包连接状态", isConnect);
        this.btn_connect.node.active = !isConnect;
        this.btn_disconnect.node.active = isConnect;
    }
}