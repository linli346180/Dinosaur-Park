import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIConfigData, UIID } from '../common/config/GameUIConfig';
import { Prefab } from 'cc';
import { PaymentMethod, paymentMethods, PayType, TransactionRequest } from './WalletDefine';
import { instantiate } from 'cc';
import { WalletPayItem } from './WalletPayItem';
import { tonConnect } from './TonConnect';
import { WalletNetService } from './WalletNet';
const { ccclass, property } = _decorator;

@ccclass('WalletPaySelect')
export class WalletPaySelect extends Component {
    @property(Button)
    private btn_close: Button = null!;
    @property(Node)
    private content: Node = null!;
    @property(Prefab)
    private payItemPrefab: Prefab = null!;
    private configId: number = 0;

    public initConfig(id: number) {
        this.configId = id;
    }

    onLoad() {
        this.btn_close.node.on(Button.EventType.CLICK, this.onClose, this);
        this.initUI();
    }

    private onClose() {
        oops.gui.remove(UIID.WalletPaySelect, false)
    }

    private initUI() {
        this.content.removeAllChildren();
        for (let item of paymentMethods) {
            this.createItem(item);
        }
    }

    private createItem(method: PaymentMethod) {
        const itemNode = instantiate(this.payItemPrefab);
        if (itemNode) {
            this.content.addChild(itemNode);
            const comp = itemNode.getComponent(WalletPayItem);
            if (comp) {
                comp.initItem(method);
                comp.onItemClicked = this.onItemClicked.bind(this);
            }
        }
    }

    private async onItemClicked(method: PaymentMethod) {
        if (!tonConnect.IsConnected) {
            tonConnect.connectTonWallet();
            return;
        }

        let coinType: number = 100;
        if (method.type != PayType.TonWallet) {
            coinType = 101;
        }

        const order = await WalletNetService.getUserOrder(this.configId, coinType, tonConnect.walletConfig.appname);
        if (order && order.payload) {
            console.log("步骤2:获取预支付订单");
            let request: TransactionRequest = new TransactionRequest();
            request.address = order.payload.address;
            request.payload = order.payload.payLoad;
            request.amount = order.payload.tonNano;
            request.expired = order.payload.expired;
            request.timeStamp = order.payload.timeStamp;
            request.coinType = order.payload.coinType;

            request.minterAddress = order.payload.minterAddress;

            if (method.type == PayType.TonWallet){
                tonConnect.sendTonTransaction(request);
            }else {
                tonConnect.sendUSDTTransaction(request);
            }
        }

        this.onClose();
    }
}


