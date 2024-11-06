

/**
 * TG传输数据 https://core.telegram.org/bots/webapps#webappinitdata
 */
export class TGWebAppInitData {
    // TG参数
    UserData: TGWebAppUser;  // 用户数据
    Auth_date: number;       // 授权时间
    Hash: string;            // 哈希值
    InviteCode: string;      // 邀请码
    AvatarUrl: string;       // 头像地址
    chat_instance: string;  // 聊天实例
    chat_type: string;      // 聊天类型
    // 邀请参数
    inviteSigin: string;     // 邀请签名
    inviteType: number;       // 邀请类型

    constructor() {
        this.UserData = new TGWebAppUser();
        this.Auth_date = Date.now(),
        this.Hash = '';
        this.InviteCode = '';
        this.AvatarUrl = '';
        this.chat_instance = '';
        this.chat_type = '';
        this.inviteSigin = '';
        this.inviteType = 0;
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