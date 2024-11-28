import { WalletNetService } from './WalletNet';
import { TransactionRequest, WalletConfig } from './WalletDefine';
import { smc } from '../common/SingletonModuleComp';
import TonWeb from '../../../libs/tonweb.js';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';

/** 钱包连接 */
export default class TonConnect {
    public tonConnectUI: any;
    public walletConfig: WalletConfig;
    public onStateChange: (isConnected: boolean) => void;

    constructor() {
        this.walletConfig = new WalletConfig();
        this.tonConnectUI = window['tonConnectUI'];
        // this.tonweb = window['tonWeb'];
    }

    public async initTonConnect() {
        try {
            const res = await WalletNetService.getTonProof();
            if (res && res.proof) {
                this.walletConfig.proof = res.proof;
            }
            if (this.tonConnectUI) {
                // 初始化 TonConnectUI
                this.tonConnectUI.setConnectRequestParameters({
                    state: 'ready',
                    value: { tonProof: this.walletConfig.proof }
                });

                this.tonConnectUI.uiOptions = {
                    actionsConfiguration: {
                        modals: ['before', 'success', 'error'],
                        notifications: ['before', 'success', 'error']
                    }
                };

                // 监听连接状态的变化
                this.tonConnectUI.onStatusChange((status) => {
                    console.log("钱包连接状态改变:", status,);
                    if (status && status.connectItems?.tonProof && 'proof' in status.connectItems.tonProof) {
                        this.walletConfig.address = status.account.address;
                        this.walletConfig.netWork = status.account.chain;
                        this.walletConfig.state_init = status.account.walletStateInit;
                        this.walletConfig.publicKey = status.account.publicKey;
                        this.walletConfig.name = status.connectItems.tonProof.name;
                        this.walletConfig.payload = status.connectItems.tonProof.proof.payload;
                        this.walletConfig.signature = status.connectItems.tonProof.proof.signature;
                        this.walletConfig.timestamp = status.connectItems.tonProof.proof.timestamp;
                        this.walletConfig.value = status.connectItems.tonProof.proof.domain.value;
                        this.walletConfig.lengthBytes = status.connectItems.tonProof.proof.domain.lengthBytes;
                        this.getTonCheck(); // 验证签名
                    } else {
                        console.log("钱包断开通知");
                        this.walletConfig = new WalletConfig();
                        this.notifyStateChange(false);
                        localStorage.removeItem("USDTTransactionID");
                    }
                    this.dump();
                });
            }
            this.connectTonWallet(false);  // 每次进入钱包自动断开连接
            this.dump();
        } catch (error) {
            console.error("初始化TonConnect失败", error);
        }
    }

    async getTonCheck() {
        const res = await WalletNetService.getTonCheck(this.walletConfig);
        if (res && res.isPass == true) {
            console.log("验证签名成功");
            this.notifyStateChange(true);
        } else {
            console.error("验证签名失败");
            this.connectTonWallet(false);
            this.notifyStateChange(false);
        }
    }

    // 连接钱包
    public connectTonWallet(connect: boolean = true) {
        if (this.tonConnectUI) {
            if (connect) {
                console.log("连接钱包");
                this.tonConnectUI.disconnect();
                this.tonConnectUI.openModal();
            } else {
                console.log("断开钱包连接");
                this.tonConnectUI.disconnect();
            }
        }
    }

    /** 发起USDT支付 */
    async sendUSDTTransaction(request: TransactionRequest) {
        try {
            console.log("USDT支付请求", request);
            const webTON = new TonWeb();
            const jettonMinter = new webTON.constructor.token.jetton.JettonMinter(webTON.provider, { address: request.minterAddress });
            const jettonMinterAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(this.walletConfig.address));
            const jettonWallet = new webTON.constructor.token.jetton.JettonWallet(webTON.provider, { address: jettonMinterAddress });
            const comment = new Uint8Array(new TextEncoder().encode(request.payload));
            console.log("comment:", comment);
            const jettonBody = {
                    queryId: Date.now(),
                    jettonAmount: request.amount,
                    toAddress: new TonWeb.utils.Address(request.address),
                    responseAddress: new TonWeb.utils.Address(this.walletConfig.address),
                    forwardPayload: comment
                };    
            console.log("JettonBody", jettonBody);
            let payload = await jettonWallet.createTransferBody(jettonBody);
            console.log("payload", payload);
            const tonFee = '50000000' //多了就会自动退回的手续费
            // 记录交易ID
            let localValue: string | null = localStorage.getItem("USDTTransactionID");
            if (localValue == null || localValue == '') {
                localValue = '0';
            }
            const localId = Number(localValue);
            const transaction = {
                id: localId,
                validUntil: Math.floor(Date.now() / 1000) + 6000,
                messages: [
                    {
                        address: jettonMinterAddress.toString(true),
                        payload: TonWeb.utils.bytesToBase64(await payload.toBoc()),
                        amount: tonFee,
                    }
                ]
            };
            localStorage.setItem("USDTTransactionID", (Number(localId) + 1).toString());
            const response = await this.tonConnectUI.sendTransaction(transaction);
            if(response) {
                const res = await WalletNetService.postWithdrawBoc(response.boc, request.payload, request.coinType);
                if (res) {
                    oops.gui.toast(oops.language.getLangByID("tips_transaction_sucess"));
                    smc.account.updateCoinData();
                }
            }
        } catch (error) {
            console.error("USDT支付异常", error);   
        }
    }

    // 发起交易
    public async sendTonTransaction(request: TransactionRequest) {
        const address = request.address;
        const num = request.amount;
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 6000,
            messages: [
                {
                    address: address,
                    payload: request.payload,
                    amount: num,
                }
            ]
        };
        console.warn("Ton交易请求", transaction);
        try {
            const result = await this.tonConnectUI.sendTransaction(transaction);
            const res = await WalletNetService.postWithdrawBoc(result.boc, request.payload, request.coinType);
            if (res) {
                oops.gui.toast(oops.language.getLangByID("tips_transaction_sucess"));
                smc.account.updateCoinData();
            }
        } catch (error) {
            console.error("Ton交易异常", error);
        }
    }

    public get IsConnected() {
        let isConnected = false;
        if (this.tonConnectUI && this.tonConnectUI.connected) {
            isConnected = true;
        }
        return isConnected;
    }

    private notifyStateChange(isConnected: boolean) {
        if (this.onStateChange) {
            this.onStateChange(isConnected);
        }
    }

    dump() {
        const currentWallet = this.tonConnectUI.wallet;
        const currentWalletInfo = this.tonConnectUI.walletInfo;
        const currentAccount = this.tonConnectUI.account;
        const currentIsConnectedStatus = this.tonConnectUI.connected;

        console.log("当前钱包:", currentWallet);
        console.log("当前钱包信息:", currentWalletInfo);
        console.log("当前账户:", currentAccount);
        console.log("当前连接状态:", currentIsConnectedStatus);
    }
}

export const tonConnect = new TonConnect();


// const order = await WalletNetService.getUserOrder(configId, 100);
//         if (order && order.payload) {
//             let request: TransactionRequest = new TransactionRequest();
//             request.address = order.payload.address;
//             request.payload = order.payload.payLoad;
//             request.amount = order.payload.tonNano;
     
//             try {
//                 const message = `address=${order.payload.address}
//                 &expired=${order.payload.expired}
//                 &payLoad${order.payload.payLoad}
//                 &randomStr=${order.payload.randomStr.substring(0,6)}
//                 &signture=
//                 &timeStamp=${order.payload.timeStamp}
//                 &tonNano=${order.payload.tonNano}`;

//                 const signature = order.payload.signture;
//                 const publicKeyPem = `-----BEGIN PUBLIC KEY-----
//                 MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyTZ7cz2AMvd6OCcF2a8k
//                 CroTrLDRrkXc1AYQd3WCAtxq4SZqmqmyUE67u4takFzvpN41s0lCiZ+gcJ933XeE
//                 a9Nc5jXHknC/Ib4KpLsfcutIQrkW/4HI3i2/vAQs8npn4xNjPHr4/rTsYBSoxegJ
//                 q1GfK9nZLya32ZYc57LmrEKXBuj8dgzCqb1f2XXB7gb1jg+fOAH1RJc9rQltyiB5
//                 7uVA8W9jiY4fot5XnfOaCH/6qov6NWBZbQO3DzTcbrW+0Mi6rrLUB50sxHfOaxwk
//                 sWqEeEBf3XjoCGMncB0N7assXsbdYnTayGDQScqZk4eBZJnMEd4f1ukLIarVHTEk
//                 mQIDAQAB
//                 -----END PUBLIC KEY-----`;

//                 // 验签
//                 console.log(`publicKeyPem: ${publicKeyPem} message:${message}  signature:${signature}`);
//                 CryptoDefine.verifySignature(publicKeyPem, message, signature).then(isValid => {
//                     console.warn(`验证结果: ${isValid}`);
//                 }).catch(error => {
//                     console.error("Error verifying signature:", error);
//                 });
//             } catch (error) {
//                 console.log(`error: ${error}`);
//             }
//             tonConnect.sendTonTransaction(request);
//         }  
