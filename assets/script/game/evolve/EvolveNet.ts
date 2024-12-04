import { HttpManager } from "../../net/HttpManager";
import { netConfig } from "../../net/custom/NetConfig";
import { NetErrorCode } from "../../net/custom/NetErrorCode";


export namespace EvolueNetService {

    /** 查询进化基础信息 */
    export async function getEvolveConfig(stbConfigID: number) {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/user/stb/evolution/info?token=${netConfig.Token}&stbId=${stbConfigID}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`查询进化基础信息`, response.res);
            return response.res;
        } else {
            console.error(`查询进化基础信息异常`, response);
            return null;
        }
    }

     /** 查询进化手册 */
     export async function getEvolveTips() {
        const http = createHttpManager();
        const response = await http.getUrl(`tgapp/api/user/stb/evolution/tips?token=${netConfig.Token}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`查询进化手册`, response.res);
            return response.res;
        } else {
            console.error(`查询进化手册异常`, response);
            return null;
        }
    }

    /** 进化星兽 */
    export async function evolveRequest(stbConfigID: number, evolutionNumber: number) {
        const http = createHttpManager();
        const response = await http.postUrl(`tgapp/api/user/stb/evolution?token=${netConfig.Token}&stbId=${stbConfigID}&evolutionNumber=${evolutionNumber}`);
        if (response.isSucc && response.res.resultCode == NetErrorCode.Success) {
            console.warn(`进化星兽`, response.res);
            return response.res;
        } else {
            console.error(`进化星兽异常`, response);
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

