import { HttpManager } from "../common/network/HttpManager";
import { netConfig } from "../common/network/NetConfig";
import { TaskType } from "./TaskDefine";


export namespace TaskNetService{

    /** 获取任务数据 */
    export async function getTaskData(taskType: TaskType) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        // const params = { 
        //     'taskType': taskType
        // };
        const response = await http.getJson(`tgapp/api/user/task/list?taskType=${taskType}`);
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("获取任务列表:", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 领取任务奖励 */
    export async function claimTaskReward(taskId: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = { 
            'taskId': taskId
        };
        const response = await http.postJson("tgapp/api/user/task/receive", JSON.stringify(params));
        if (response.isSucc && response.res.resultCode == "OK") {
            console.warn("领取任务奖励成功:", response.res);
            return response.res;
        } else {
            console.error("领取任务奖励失败", response);
            return null;
        }
    }
    
}

