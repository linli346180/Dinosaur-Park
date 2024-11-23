import { _decorator, Component, Button, Node } from 'cc';
import { tonConnect } from './TonConnect';
const { ccclass, property } = _decorator;

@ccclass('WalletConnect')
export class WalletConnect extends Component {
    @property(Button)
    private btn_connect: Button = null!;
    @property(Button)
    private btn_disconnect: Button = null!;

    start() {
        this.btn_connect.node.on(Button.EventType.CLICK, this.connect, this);
        this.btn_disconnect.node.on(Button.EventType.CLICK, this.disconnect, this);
    }

    onEnable() {
        this.onConnectStateChange(tonConnect.IsConnected);
        tonConnect.onStateChange = this.onConnectStateChange.bind(this);
    }

    private connect() {
        tonConnect.connectTonWallet(true);
    }

    private disconnect() {
        tonConnect.connectTonWallet(false);
        this.onConnectStateChange(false);
    }

    private onConnectStateChange(isConnect: boolean) {
        console.log("收到消息:", isConnect);
        if (isConnect) {
            this.btn_disconnect.node.active = true;
            this.btn_connect.node.active = false;
        } else {
            this.btn_disconnect.node.active = false;
            this.btn_connect.node.active = true;
        }
    }
}


