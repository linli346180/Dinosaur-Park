
/** 钱包配置 */
export class WalletConfig {
    readonly manifestUrl: string;

    // 支付目标参数
    proof: string = '';             // 验证数据
    payload: string = '';           // 发起交易的proof
    tonNano: number = 0;            // 发起交易的金额
    payaddress: string = '';        // 发起交易的目标地址

    // 钱包参数
    address: string = '';           // 自己钱包地址
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
        this.address;
    }
}

/** 交易请求 */
export class TransactionRequest { 
    address: string;        // 转账目标地址
    payload: string;        // 交易数据
    amount: number;         // 交易金额
    timeStamp: number;      // 时间戳
    expired:number;         // 过期时间
    minterAddress:string;   // 合约地址
    coinType: number;       // 币种类型
}

/** 提现配置 */
export interface WithdrawConfig {
    userBalance: string;                // 用户余额
    uMiniWithdraw: string;              // 最小提现金额
    handlingFee: string;                // 提现手续费(百分比)
    miniHandlingFee: string;            // 最小提现手续费(金额)
    isAllowedWithdrawal: number;        // 是否允许提现
    gemsExchangeRate:number;            // 宝石兑换比例
}

/** 提现请求 */
export interface WithdrawRequest {
    verificationCode: string;
    purseUrl: string;
    purseType: number;          // 钱包类型 1:TRC20 2:ERC20
    withdrawAmount: number;
}


export enum USDTRecordType {
    Withdraw = 1,   // 提现 = 1
    Exchange = 2,   // 兑换 = 2
}

/** 提现记录 */
export interface WithdrawRecord {
    withdrawTime: number;   // 提现记录
    withdrawNum: number;    // 提现金额
    withdrawStatus: number; // 提现状态 0-未知 1-审批中 2-已同意 3-已拒绝
} 

/** 兑换记录 */
export interface ExchangeRecord {
    exchangeTime: number;   // 兑换时间
    usdtNumber: number;     // USDT数量
    gemsNumber: number;     // 宝石数量
 }

/** 支付类型 */
export enum PayType { 
    TonWallet = 'TON钱包',
    TonUSDT = 'TRC-USDT钱包',
    TrcUsdtWallet = 'TRC-USDT钱包',
    ErcUsdtWallet = 'ERC-USDT钱包',
    TonUsdtWallet = 'TON-USDT钱包',
    EthUsdtWallet = 'ETH-USDT钱包'
}

/** 支付参数 */
export interface PaymentMethod {
    type: PayType;      // 支付方式类型，例如 'TON币支付'
    chain: string;      // 链名称，例如 'TON'
    ratio: number;      // 比例
}

// 允许的支付列表
export const paymentMethods: PaymentMethod[] = [
    { type: PayType.TonWallet, chain: 'TON', ratio: 0.179918 },
    { type: PayType.TonUSDT, chain: 'TonUSDT', ratio: 0.179918 },
    // { type: PayType.TrcUsdtWallet, chain: 'TRC20', ratio: 0.179918 },
    // { type: PayType.ErcUsdtWallet, chain: 'ERC20', ratio: 0.179918 },
    // { type: PayType.TonUsdtWallet, chain: 'TON', ratio: 0.179918 },
    // { type: PayType.EthUsdtWallet, chain: 'ETH', ratio: 0.179918 }
];
