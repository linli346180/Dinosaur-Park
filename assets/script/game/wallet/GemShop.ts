import { _decorator, Component, Button, Label, Node, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { GemShopItem } from './GemShopItem';
import { BuyGemsConfig } from '../shop/MergeDefine';
import { WalletNetService } from './WalletNet';
import { WalletConfig } from './WalletDefine';

const { ccclass, property } = _decorator;

/** 宝石商店 */
@ccclass('GemShop')
export class GemShop extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Label)
    private gemNum: Label = null!;
    @property({ type: Node })
    private itemContent: Node = null!;
    @property(Prefab)
    private itemPrefab: Prefab = null!;
    @property(Button)
    private btn_connect: Button = null!;
    @property(Button)
    private btn_disconnect: Button = null!;

    private walletConfig: WalletConfig = new WalletConfig();
    private gemConfigs: BuyGemsConfig[] = [];

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.GemShop, false); }, this);
        this.btn_connect?.node.on(Button.EventType.CLICK, this.connectTonWallet, this);
        this.btn_disconnect?.node.on(Button.EventType.CLICK, this.disConnectTonWallet, this);
        this.initUI();
        this.initTonConnectUI();
        oops.message.on(AccountEvent.CoinDataChange, this.updateUI, this);
    }

    onEnable() {
        this.updateUI();
    }

    onDestroy() {
        oops.message.off(AccountEvent.CoinDataChange, this.updateUI, this);
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

    private async onItemClicked(configId: number) {
        if(window['tonConnectUI']) {
            // 如果钱包未连接，先连接钱包
            if (!window['tonConnectUI'].connected) {
                this.connectTonWallet();
                return;
            }

            const order = await WalletNetService.getUserOrder(configId);
            if (order && order.payload) {
                console.log("步骤4: 获取预支付订单");
                this.walletConfig.payaddress = order.payload.address;
                this.walletConfig.payload = order.payload.payLoad;
                this.walletConfig.tonNano = order.payload.tonNano;
                // 步骤5: 发送交易
                this.sendTransaction();
            }        
        }
    }

    /** 初始化钱包 */
    private async initTonConnectUI() {
        // 步骤1: 获取TonProof
        const res = await WalletNetService.getTonProof();
        if (res && res.proof) {
            this.walletConfig.proof = res.proof;
            console.log("步骤1: 获取TonProof成功");
        }
        
        if(window['tonConnectUI']) {
            window['tonConnectUI'].setConnectRequestParameters({
                state: 'ready',
                value: { tonProof: this.walletConfig.proof }
            });

            window['tonConnectUI'].onStatusChange(async wallet => {
                let isConnected = wallet != null;
                if (wallet && wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
                    console.log("步骤2: 连接钱包", wallet);
                    this.walletConfig.netWork = wallet.account.chain;
                    this.walletConfig.state_init = wallet.account.walletStateInit;
                    this.walletConfig.publicKey = wallet.account.publicKey;

                    this.walletConfig.address = wallet.account.address;

                    this.walletConfig.name = wallet.connectItems.tonProof.name;
                    this.walletConfig.payload = wallet.connectItems.tonProof.proof.payload;
                    this.walletConfig.signature = wallet.connectItems.tonProof.proof.signature;
                    this.walletConfig.timestamp = wallet.connectItems.tonProof.proof.timestamp;

                    this.walletConfig.value = wallet.connectItems.tonProof.proof.domain.value;
                    this.walletConfig.lengthBytes = wallet.connectItems.tonProof.proof.domain.lengthBytes;

                    const res = await WalletNetService.getTonCheck(this.walletConfig);
                    if(res && res.isPass == true) {
                        console.log("步骤3: 验证签名成功");
                    } else {
                        console.error("步骤3: 验证签名失败");
                        this.disConnectTonWallet();
                    }
                }
                this.updateButtonState(isConnected);
            });
        }
    }

    private updateUI() {
        this.updateButtonState(window['tonConnectUI'] && window['tonConnectUI'].connected);
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    }

    private connectTonWallet() {
        if(window['tonConnectUI']) {
            window['tonConnectUI'].disconnect();
            window['tonConnectUI'].openModal();
        }
    }

    private disConnectTonWallet() {
        if(window['tonConnectUI']) {
            window['tonConnectUI'].disconnect();
        }
    }
    
    private async sendTransaction() {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [
                {
                    address: this.walletConfig.payaddress,
                    payload: this.walletConfig.payload,
                    amount: this.walletConfig.tonNano.toString(),
                }
            ]
        };
        console.log("步骤5: 发起交易", transaction);
        await window['tonConnectUI'].sendTransaction(transaction)
        .then(async (response) => {
            console.log("交易成功", response);
            // 处理成功的交易逻辑
            const res = await WalletNetService.postWithdrawBoc(response.boc);
            if(res) {
                smc.account.updateCoinData();
            }
        })
        .catch((error) => {
            console.error("交易失败", error);
            // 处理失败的交易逻辑
        });
    }

    private updateButtonState(isConnect: boolean) {
        this.btn_connect.node.active = !isConnect;
        this.btn_disconnect.node.active = isConnect;
    }
}