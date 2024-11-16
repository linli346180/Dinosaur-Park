

/** 网络配置 */
class NetConfig {
    public get Server() {
        if (this.dynamicRoute) {
            return `https://${this.Route}/`
        }
        return this.ServerConfigList[this.curEnvironment].Server;
    }

    public get WebSock() {
        if (this.dynamicRoute) {
            return `${this.Route}/wss`
        }
        return this.ServerConfigList[this.curEnvironment].WebSock;
    }

    public get BotToken() {
        return this.ServerConfigList[this.curEnvironment].BotToken;
    }

    private curEnvironment: EnvironmentType = EnvironmentType.PreRelease;
    private ServerConfigList = {
        [EnvironmentType.Development]: {
            Server: "https://konglong.live/",
            WebSock: "konglong.live/wss",
            BotToken: '7512648791:AAGsR1Qbuh-A-B_l1SrizMdSBIm1MmZLuZQ'
        },
        [EnvironmentType.PreRelease]: {
            Server: "https://kong-long.cyou/",
            WebSock: "kong-long.cyou/wss",
            BotToken: '7175903697:AAGqeX_Z5N1GC0HWyGS_WZE8nzzJiTZGwa0'
        },
        [EnvironmentType.Production]: {
            Server: "https://yu.sbpc-api.com/",
            WebSock: "yu.sbpc-api.com/wss",
            BotToken: '7175903697:AAGqeX_Z5N1GC0HWyGS_WZE8nzzJiTZGwa0'
        }
    };

    public ExampleLogin: boolean = false;   // 是否使用测试账号登陆
    public API: string = "/tgapp/api";
    public VERSION: string = "/v1";
    public PATH: string = "/login";
    public Account: string = "account";
    public Password: string = "123456";
    public Timeout: number = 10000;
    public Token: string = "";
    public timeDifference: number = 0;    // 服务端和系统的时间差(毫秒)
    public deviceCode: string = '';       // 设备码
    public GetUrl(PATH: string): string {
        return this.Server + this.API + PATH;
    };
    public dynamicRoute: boolean = false;   // 是否动态路由
    public Route: string = '';            // 动态路由
}

/** 网络配置 */
enum EnvironmentType {
    Development = '开发环境',
    PreRelease = '测试环境',
    Production = '发布环境'
}

export var netConfig = new NetConfig();