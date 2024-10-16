

/** TG Token */
export const botToken = '7175903697:AAGqeX_Z5N1GC0HWyGS_WZE8nzzJiTZGwa0'

/**
 * TG传输数据 https://core.telegram.org/bots/webapps#webappinitdata
 */
export class TGWebAppInitData {
    UserData: TGWebAppUser;  // 用户数据
    Auth_date: number;       // 授权时间
    Hash: string;            // 哈希值
    InviteCode: string;      // 邀请码
    AvatarUrl: string;       // 头像地址
    chat_instance: string;  // 聊天实例
    chat_type: string;      // 聊天类型
    constructor(
        userData: TGWebAppUser = new TGWebAppUser(),
        auth_date: number = Date.now(),
        hash: string = '',
        inviteCode: string = '',
        avatarUrl: string = '',
        chat_instance: string = '',
        chat_type: string = ''
    ) {
        this.UserData = userData;
        this.Auth_date = auth_date;
        this.Hash = hash;
        this.InviteCode = inviteCode;
        this.AvatarUrl = avatarUrl;
        this.chat_instance = chat_instance;
        this.chat_type = chat_type;
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