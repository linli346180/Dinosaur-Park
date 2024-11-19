import { WalletNetService } from './WalletNet';
import { TransactionRequest, WalletConfig } from './WalletDefine';
import { smc } from '../common/SingletonModuleComp';

/** 钱包连接 */
export class TonConnect {
    public tonConnectUI: any;
    public walletConfig: WalletConfig;
    public connectStateChange: (isConnected: boolean) => void;
    private isInit: boolean = false;

    constructor() {
        this.walletConfig = new WalletConfig();
        this.tonConnectUI = window['tonConnectUI'];
    }

    public async initTonConnect() { 
        if(this.isInit) return;
        const res = await WalletNetService.getTonProof();
        if (res && res.proof) {
            this.walletConfig.proof = res.proof;
        }
        if(this.tonConnectUI) {
            this.tonConnectUI.setConnectRequestParameters({
                state: 'ready',
                value: { tonProof: this.walletConfig.proof }
            });
            this.tonConnectUI.onStatusChange(async wallet => {
                if (wallet && wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
                    console.log("连接钱包", wallet);
                    this.walletConfig.address = wallet.account.address;
                    this.walletConfig.netWork = wallet.account.chain;
                    this.walletConfig.state_init = wallet.account.walletStateInit;
                    this.walletConfig.publicKey = wallet.account.publicKey;
                    this.walletConfig.name = wallet.connectItems.tonProof.name;
                    this.walletConfig.payload = wallet.connectItems.tonProof.proof.payload;
                    this.walletConfig.signature = wallet.connectItems.tonProof.proof.signature;
                    this.walletConfig.timestamp = wallet.connectItems.tonProof.proof.timestamp;
                    this.walletConfig.value = wallet.connectItems.tonProof.proof.domain.value;
                    this.walletConfig.lengthBytes = wallet.connectItems.tonProof.proof.domain.lengthBytes;

                    const res = await WalletNetService.getTonCheck(this.walletConfig);
                    if(res && res.isPass == true) {
                        this.isInit = true;
                        console.log("验证签名成功");
                        if(this.connectStateChange) {
                            this.connectStateChange(true);
                        }
                    } else {
                        console.error("验证签名失败");
                        this.disConnectTonWallet();
                        if(this.connectStateChange) {
                            this.connectStateChange(false);
                        }
                    }
                } else {
                    this.walletConfig = new WalletConfig();
                    if(this.connectStateChange) {
                        this.connectStateChange(false);
                    }
                }
            });
        }

        if(this.isConnected()) {
            this.walletConfig.address = this.tonConnectUI.account.address;
        }
    }

    // 连接钱包
    public connectTonWallet() {
        if(this.tonConnectUI) {
            this.tonConnectUI.disconnect();
            this.tonConnectUI.openModal();
        }
    }

    // 断开钱包连接
    public disConnectTonWallet() {
        if(this.tonConnectUI)  {
            this.tonConnectUI.disconnect();
        }
    }

    // 发起交易
    public async sendTransaction(request: TransactionRequest) {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [
                {
                    address: request.address,
                    payload: request.payload,
                    amount: request.amount.toString(),
                }
            ]
        };
        await this.tonConnectUI.sendTransaction(transaction)
        .then(async (response) => {
            console.log("交易成功", response);
            const res = await WalletNetService.postWithdrawBoc(response.boc);
            if(res) {
                smc.account.updateCoinData();
            }
        })
        .catch((error) => {
            console.error("交易失败", error);
        });
    }

    public isConnected() { 
        return this.tonConnectUI && this.tonConnectUI.connected;
    }
}

export const tonConnect = new TonConnect();

