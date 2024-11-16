import { _decorator, Component, Node } from 'cc';
import { TonConnectUI } from '@tonconnect/ui';

const { ccclass, property } = _decorator;

@ccclass('TonConnectComp')
export class TonConnectComp extends Component {

    private tonConnectUI: TonConnectUI;

    onLoad() {
        // 初始化 TonConnectUI 实例
        this.tonConnectUI = new TonConnectUI({
            manifestUrl: 'https://app.unsgc.com/manifest.json',
            buttonRootId: 'ton-connect-button'
        });

        // 创建并添加连接按钮容器
        const buttonElement = document.createElement('div');
        buttonElement.id = 'ton-connect-button';
        document.body.appendChild(buttonElement);

        // 可以添加自定义逻辑来响应按钮事件或进行进一步处理
        console.error('TonConnect UI initialized');
    }
}


