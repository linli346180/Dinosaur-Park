

/** 网络配置 */
class NetConfig {
    // public Server: string = "http://54.169.243.11:10000/";
    public Server: string = "https://konglong.live/";
    // public Server: string = "https://yu.sbpc-api.com/";

    public WebSock: string = "konglong.live/wss";
    // public WebSock: string = "yu.sbpc-api/wss";
    public API: string = "/tgapp/api";
    public VERSION: string = "/v1";
    public PATH: string = "/login";
    public Account: string = "account";
    public Password: string = "123456";
    public Timeout: number = 10000;
    public Token: string = "";
    public timeDifference: number = 0;    // 服务端和系统的时间差(毫秒)
    public GetUrl(PATH: string): string {
        return this.Server + this.API + PATH;
    }
}

export var netConfig = new NetConfig();