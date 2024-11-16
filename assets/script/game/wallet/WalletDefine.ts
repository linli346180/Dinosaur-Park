
/** 钱包配置 */
export class WalletConfig {
    readonly manifestUrl: string;

    // 支付目标参数
    proof: string = '';             // 验证数据
    address: string = '';           // 发起交易的目标地址
    payload: string = '';           // 发起交易的proof
    tonNano: number = 0;            // 发起交易的金额

    // 钱包参数
    name: string = '';              // 钱包名称
    publicKey: string = '';         // 公钥
    walletStateInit: string = '';   // 钱包状态
    netWork: string = '';           // 网络id(chain)
    timestamp: number = 0;          // 时间戳
    signature: string = '';         // 签名
    state_init: string = '';        // 返回的数据
    lengthBytes: number = 0;        // 前端地址长度
    value: string;                  // 前段地址   

    constructor() {
        this.manifestUrl = 'https://app.unsgc.com/manifest.json';
        this.address = 'UQD5YMPkIHwt0rDzeRa8cFL6y9WiGyKesKCfFSz7NfFe-uoS';
    }
}

/** 提现配置 */
export interface WithdrawConfig {
    userBalance: string;                // 用户余额
    uMiniWithdraw: string;              // 最小提现金额
    handlingFee: string;                // 提现手续费(百分比)
    miniHandlingFee: string;            // 最小提现手续费(金额)
    isAllowedWithdrawal: number;        // 是否允许提现
}

/** 提现请求 */
export interface WithdrawRequest {
    verificationCode: string;
    purseUrl: string;
    purseType: number;          // 钱包类型 1:TRC20 2:ERC20
    withdrawAmount: number;
}

/** 提现记录 */
export interface WithdrawRecord {
    withdrawTime: number;  // 提现记录
    withdrawNum: number;    // 提现金额
    withdrawStatus: number; // 提现状态 1-审批中 2-已同意 3-已拒绝
} 
