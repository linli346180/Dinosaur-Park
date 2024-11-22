import { Button } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { tonConnect } from './TonConnect';
const { ccclass, property } = _decorator;

@ccclass('WalletConnect')
export class WalletConnect extends Component {
    @property(Sprite)
    private icon:Sprite = null!;
    @property(Button)
    private btn_connect:Button = null!;
  
    protected onLoad(): void {
        this.btn_connect.node.on(Button.EventType.CLICK, this.onConnectClick, this);
      
        // 添加连接状态变化监听器
        tonConnect.addListener(this.onConnectStateChange);
        this.onConnectStateChange(tonConnect.isConnected);
    }

    private onConnectClick() {
        if(tonConnect.isConnected) {
            tonConnect.disConnectTonWallet();
        } else {
            tonConnect.connectTonWallet()
        }
    }

    private onConnectStateChange(isConnect: boolean) {
        this.icon.grayscale = !isConnect;
    }
}


