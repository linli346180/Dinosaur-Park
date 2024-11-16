import { sys } from "cc";


/**
 * TG传输数据 https://core.telegram.org/bots/webapps#webappinitdata
 */
export class TGWebAppInitData {
    // TG参数
    initData: string;        // 初始化数据
    UserData: TGWebAppUser;  // 用户数据
    Auth_date: number;       // 授权时间
    Hash: string;            // 哈希值

    AvatarUrl: string;       // 头像地址
    chat_instance: string;  // 聊天实例
    chat_type: string;      // 聊天类型

    // 邀请参数
    start_param: string;      // 邀请参数
    inviteSign: string;         // 邀请签名
    inviteType: number;       // 邀请类型

    // 登录设备(每次登录都会生成一个新的设备码)
    get LoginEquipMent() {
        let equipMentCode = TGWebAppInitData.GenerateGUID();
        console.warn('登录设备:', equipMentCode);
        return equipMentCode;
    }

    // 设备码(每个设备唯一)
    get DeviceCode() {
        let deviceCode: string | null = localStorage.getItem("deviceCode");
        if (deviceCode == null || deviceCode == '') {
            deviceCode = TGWebAppInitData.GenerateGUID();
            localStorage.setItem("deviceCode", deviceCode);
        }
        console.warn('设备码:', deviceCode);
        return deviceCode;
    }

    constructor() {
        this.initData = '';
        this.UserData = new TGWebAppUser();
        this.Auth_date = Date.now();
        this.Hash = '';

        this.AvatarUrl = '';
        this.chat_instance = '';
        this.chat_type = '';
        this.start_param = '';
        this.inviteSign = '';
        this.inviteType = 0;
    }

    // 生成GUID
    static GenerateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export class TGWebAppUser {
    id: number;                // 用户id
    first_name: string;        // 名字
    last_name: string;         // 姓氏
    username: string;          // 用户名
    language_code: string;     // 语言代码

    constructor(
        id: number = 0,
        first_name: string = '',
        last_name: string = '',
        username: string = '',
        language_code: string = ''
    ) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.username = username;
        this.language_code = language_code;
    }
}