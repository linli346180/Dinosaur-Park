import { _decorator, Component, Button, Label, Node, Prefab, instantiate } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { AccountNetService } from '../account/AccountNet';
import { smc } from '../common/SingletonModuleComp';
import { AccountEvent } from '../account/AccountEvent';
import { GemShopItem } from './GemShopItem';
import { BuyGemsConfig } from '../shop/MergeDefine';
import { WalletNetService } from './WalletNet';
import { TransactionRequest, WalletConfig } from './WalletDefine';
import { tonConnect } from './TonConnect';
import { CryptoDefine } from './Crypto';
import { UICallbacks } from '../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines';
import { WalletPaySelect } from './WalletPaySelect';

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

    private gemConfigs: BuyGemsConfig[] = [];

    onLoad() {
        this.btn_close?.node.on(Button.EventType.CLICK, () => { oops.gui.remove(UIID.GemShop, false); }, this);
        this.initUI();
        oops.message.on(AccountEvent.CoinDataChange, this.updateUI, this);
    }

    onEnable() {
        this.updateUI();
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
        var uic: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                node.getComponent(WalletPaySelect)?.initConfig(configId);
                oops.gui.remove(UIID.GemShop, false);
            },
            onRemoved: (node: Node | null, params: any) => {
                oops.gui.open(UIID.GemShop);
            }
        };
        let uiArgs: any;
        oops.gui.open(UIID.WalletPaySelect, uiArgs, uic);
        return;

        const order = await WalletNetService.getUserOrder(configId);
        if (order && order.payload) {
            let request: TransactionRequest = new TransactionRequest();
            request.address = order.payload.address;
            request.payload = order.payload.payLoad;
            request.amount = order.payload.tonNano;
     
            try {
                const message = `address=${order.payload.address}
                &expired=${order.payload.expired}
                &payLoad${order.payload.payLoad}
                &randomStr=${order.payload.randomStr.substring(0,6)}
                &signture=
                &timeStamp=${order.payload.timeStamp}
                &tonNano=${order.payload.tonNano}`;

                const signature = order.payload.signture;
                const publicKeyPem = `-----BEGIN PUBLIC KEY-----
                MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyTZ7cz2AMvd6OCcF2a8k
                CroTrLDRrkXc1AYQd3WCAtxq4SZqmqmyUE67u4takFzvpN41s0lCiZ+gcJ933XeE
                a9Nc5jXHknC/Ib4KpLsfcutIQrkW/4HI3i2/vAQs8npn4xNjPHr4/rTsYBSoxegJ
                q1GfK9nZLya32ZYc57LmrEKXBuj8dgzCqb1f2XXB7gb1jg+fOAH1RJc9rQltyiB5
                7uVA8W9jiY4fot5XnfOaCH/6qov6NWBZbQO3DzTcbrW+0Mi6rrLUB50sxHfOaxwk
                sWqEeEBf3XjoCGMncB0N7assXsbdYnTayGDQScqZk4eBZJnMEd4f1ukLIarVHTEk
                mQIDAQAB
                -----END PUBLIC KEY-----`;

                // 验签
                console.log(`publicKeyPem: ${publicKeyPem} message:${message}  signature:${signature}`);
                CryptoDefine.verifySignature(publicKeyPem, message, signature).then(isValid => {
                    console.warn(`验证结果: ${isValid}`);
                }).catch(error => {
                    console.error("Error verifying signature:", error);
                });
            } catch (error) {
                console.log(`error: ${error}`);
            }
            tonConnect.sendTransaction(request);
        }  
    }

    private updateUI() {
        this.gemNum.string = Math.floor(smc.account.AccountModel.CoinData.gemsCoin).toString();
    }

}