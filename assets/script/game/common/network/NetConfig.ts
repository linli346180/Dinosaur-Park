

/** 网络配置 */
class NetConfig {
    // public Server: string = "http://54.169.243.11:10000/";
    public Server: string = "https://konglong.live/";
    public API: string = "/tgapp/api";
    public VERSION: string = "/v1";
    public PATH: string = "/login";
    public Account: string = "account";
    public Password: string = "123456";
    public Timeout: number = 10000;
    public Token: string = "";
    public GetUrl(PATH: string): string {
        return this.Server + this.API + PATH;
    }
}

export var netConfig = new NetConfig();