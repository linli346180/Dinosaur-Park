import { WalletNetService } from './WalletNet';
import { TransactionRequest, WalletConfig } from './WalletDefine';
import { smc } from '../common/SingletonModuleComp';
import TonWeb from '../../../libs/tonweb.js';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';

/** 钱包连接 */
export default class TonConnect {
    public tonConnectUI: any;
    // public tonweb: any;
    public walletConfig: WalletConfig;
    private listeners: ((isConnected: boolean) => void)[] = [];

    // 钱包连接状态变化监听器
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
                        return;
                    }
                    console.log("发送钱包断开通知");
                    this.walletConfig = new WalletConfig();
                    this.notifyStateChange(false);
                });
            }

            if (this.IsConnected) {
                console.log("钱包已连接", this.tonConnectUI);
                this.walletConfig.address = this.tonConnectUI.account.address;
            }

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
            console.log("this.walletConfig", this.walletConfig);

            // 初始化 Jetton Minter 实例
            const webTON = new TonWeb();

            if(request.minterAddress != 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs') {
                console.error("minterAddress不匹配", request.minterAddress);
            }

            const jettonMinter = new webTON.constructor.token.jetton.JettonMinter(webTON.provider, { address: request.minterAddress });
            const jettonMinterAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(this.walletConfig.address));
            const jettonWallet = new webTON.constructor.token.jetton.JettonWallet(webTON.provider, { address: jettonMinterAddress });
            const comment = new Uint8Array([... new Uint8Array(4), ... new TextEncoder().encode(request.payload)]);

            if(request.address != 'UQAhLYn0c5MtoSjSre38RXtcpBBOKiuJtx_ISBmk3HyUKlOi') {
                console.error("address不匹配", request.address);
            }

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
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 6000,
                messages: [
                    {
                        address: jettonMinterAddress.toString(true),
                        payload: TonWeb.utils.bytesToBase64(await payload.toBoc()),
                        amount: tonFee,
                    }
                ]
            };

            console.error("jettonMinterAddress", jettonMinterAddress.toString(true));
            console.log("USDT交易请求", transaction);
            await this.tonConnectUI.sendTransaction(transaction)
                .then(async (response) => {
                    console.log("交易成功", response);
                    const res = await WalletNetService.postWithdrawBoc(response.boc, this.walletConfig.payload);
                    if (res) {
                        oops.gui.toast("支付成功");
                        smc.account.updateCoinData();
                    }
                })
                .catch((error) => {
                    console.error("交易失败", error);
                });            
        } catch (error) {
            console.error("处理交易时出错", error);
        }
    }

    // 发起交易
    public async sendTonTransaction(request: TransactionRequest) {
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
                const res = await WalletNetService.postWithdrawBoc(response.boc, request.payload);
                if (res) {
                    smc.account.updateCoinData();
                }
            })
            .catch((error) => {
                console.error("交易失败", error);
            });
    }

    public get IsConnected() {
        let isConnected = false;
        if (this.tonConnectUI && this.tonConnectUI.connected) {
            isConnected = true;
        }
        return isConnected;
    }

    // 通知所有连接状态变化监听器
    private notifyStateChange(isConnected: boolean) {
        if (this.onStateChange) {
            this.onStateChange(isConnected);
        }
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
