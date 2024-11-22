import { _decorator, Component, Node } from 'cc';
import { PaymentMethod, PayType } from './WalletDefine';
import { Label } from 'cc';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WalletPayItem')
export class WalletPayItem extends Component {
    @property(Node)
    private icon_ton: Node = null!;
    @property(Node)
    private icon_usdt: Node = null!;
    @property(Label)
    private chain: Label = null!;
    @property(Label)
    private rate: Label = null!;
    @property(Button)
    private btn_item: Button = null!;
    private config: PaymentMethod = null!;

    public onItemClicked: (config: PaymentMethod) => void = null!;

    public initItem(config: PaymentMethod) {
        this.config = config;
        this.chain.string = config.chain;
        this.rate.string = `${config.ratio} TON`;
        this.icon_ton.active = config.type == PayType.TonWallet;
        this.icon_usdt.active = config.type != PayType.TonWallet;
    }

    onLoad() {
        this.btn_item.node.on(Button.EventType.CLICK, this.onItemClick, this);
    }

    private onItemClick() {
        if (this.onItemClicked) {
            this.onItemClicked(this.config);
        }
    }
}