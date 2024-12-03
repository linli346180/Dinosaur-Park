import { HttpManager } from "../../net/HttpManager";
import { netConfig } from "../../net/custom/NetConfig";
import { NetErrorCode } from "../../net/custom/NetErrorCode";
import { WalletConfig, WithdrawRequest } from "./WalletDefine";

export namespace WalletNetService {

    /** 获取TonProof */
    export async function getTonProof() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/ton/proof?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`获取TonProof`, response.res);
            return response.res;
        } else {
            console.error(`获取TonProof`, response);
            return null;
        }
    }

    /** 验证签名 */
    export async function getTonCheck(walletConfig: WalletConfig) {
        const http = createHttpManager();
        const params = {
            'address': walletConfig.address,
            'netWork': walletConfig.netWork,
            'signature': walletConfig.signature,
            'timestamp': walletConfig.timestamp.toString(),
            'payload': walletConfig.payload,
            'state_init': walletConfig.state_init,
            'lengthBytes': walletConfig.lengthBytes.toString(),
            'value': walletConfig.value
        };
        const paramString = new URLSearchParams(params).toString();
        console.warn("验证签名参数:", paramString);
        const response = await http.postUrl(`tgapp/api/ton/check?token=${netConfig.Token}`, paramString);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("验证签名:", response.res);
            return response.res;
        } else {
            console.error(`验证签名异常${http.url}`, response);
            return null;
        }
    }

    /** 获取预支付订单 */
    export async function getUserOrder(goodID: number,  coinType: number, walletStr:string) {
        const http = createHttpManager();
        const params = {
            'goodID': goodID.toString(),
            'source': '1',
            'channel': '1',
            'coinType': coinType.toString(),
            'timeStamp': Date.now().toString(),
            'walletStr': walletStr  
        }
        const paramString = new URLSearchParams(params).toString();

        console.log("获取预支付订单参数:", paramString);

        const response = await http.postUrl(`tgapp/api/user/order?token=${netConfig.Token}`, paramString);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("获取预支付订单:", response.res);
            return response.res;
        } else {
            console.error("获取预支付订单异常", response);
            return null;
        }
    }

    /** 查询提现基础信息 */
    export async function getWithdrawInfo() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/presell/searchWithdrawInfo?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("查询提现基础信息:", response.res);
            return response.res;
        } else {
            console.error("查询提现基础信息异常", response);
            return null;
        }
    }

    /** 创建提现信息 */
    export async function createWithdrawRecord(request: WithdrawRequest) {
        const http = createHttpManager();
        const params = {
            'verificationCode': request.verificationCode,
            'purseUrl': request.purseUrl,
            'purseType': request.purseType.toString(),
            'withdrawAmount': request.withdrawAmount.toString(),
        }
        const paramString = new URLSearchParams(params).toString();

        console.warn("创建提现信息参数:", paramString);
        const response = await http.postUrl(`tgapp/api/presell/createWithdrawRecord?token=${netConfig.Token}`, paramString);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("创建提现信息:", response.res);
            return response.res;
        } else {
            console.error("创建提现信息异常", response);
            return null;
        }
    }

    /** 查询提现记录 */
    export async function searchWithdrawRecords() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/presell/searchWithdrawRecords?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("查询提现记录:", response.res);
            return response.res;
        } else {
            console.error("查询提现记录异常", response);
            return null;
        }
    }

     /** 支付成功返回 */
     export async function postWithdrawBoc(boc: string, payLoad: string, coinType: number) {
        const http = createHttpManager();
        const response = await http.postUrl(`tgapp/api/user/order/boc?token=${netConfig.Token}&boc=${boc}&payLoad=${payLoad}&coinType=${coinType}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`支付成功返回 ${http.url}:`, response.res);
            return response.res;
        } else {
            console.error(`支付异常 ${http.url}:`, response);
            return null;
        }
    }

    /** 核验邮箱 */
    export async function checkUserEmail(code: string, userEmail: string) {
        const http = createHttpManager();
        const params = {
            'code': code,
            'userEmail': userEmail
        }
        const paramString = new URLSearchParams(params).toString();
        const response = await http.putUrl(`tgapp/api/presell/checkUserEmail?token=${netConfig.Token}`, paramString);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("核验邮箱:", response.res);
            return response.res;
        } else {
            console.error("核验邮箱异常", response);
            return null;
        }
    }

    /** 发送邮箱验证码 */
    export async function sendEmailCode(userEmail: string) {
        const http = createHttpManager();
        const params = {
            'userEmail': userEmail
        }
        const paramString = new URLSearchParams(params).toString();
        const response = await http.postUrl(`tgapp/api/presell/sendcode?token=${netConfig.Token}`, paramString);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("获取邮箱验证码:", response.res);
            return response.res;
        } else {
            console.error("获取邮箱验证码异常", response);
            return null;
        }
    }


    /** USDT兑换宝石 */
    export async function createGemsExchange(usdtNumber: number) {
        const http = createHttpManager();
        const response = await http.postUrl(`tgapp/api/user/exchange/createGemsExchange?token=${netConfig.Token}&usdtNumber=${usdtNumber}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("USDT兑换宝石:", response.res);
            return response.res;
        } else {
            console.error("USDT兑换宝石异常", response);
            return null;
        }
    }

    /** 查询宝石兑换记录 */
    export async function getGemsExchangeRecord() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/user/exchange/searchExchange?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn("USDT兑换宝石:", response.res);
            return response.res;
        } else {
            console.error("USDT兑换宝石异常", response);
            return null;
        }
    }


    /** 创建 HttpManager 实例并进行配置 */
    function createHttpManager(): HttpManager {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        return http;
    }
}