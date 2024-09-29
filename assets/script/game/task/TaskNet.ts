import { HttpManager, ResultCode } from "../common/network/HttpManager";
import { netConfig } from "../common/network/NetConfig";
import { TaskType } from "./TaskDefine";


export namespace TaskNetService {

    /** 获取任务数据 */
    export async function getTaskData(taskType: TaskType) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;

        const response = await http.getUrl(`tgapp/api/user/task/list?taskType=${taskType}&token=${netConfig.Token}`);  
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("获取任务列表:", response.res);
            return response.res;
        } else {
            console.error("请求异常", response);
            return null;
        }
    }

    /** 领取任务奖励 */
    export async function claimTaskReward(taskCompileConditionId: number, taskProgressId: number) {
        const http = new HttpManager();
        http.server = netConfig.Server;
        http.token = netConfig.Token;
        http.timeout = netConfig.Timeout;
        const params = {
            'taskCompileConditionId': taskCompileConditionId.toString(),
            'taskProgressId': taskProgressId.toString()
        };
        const newParams = new URLSearchParams(params).toString();
        const response = await http.getUrl("tgapp/api/user/task/receive?token="+netConfig.Token, newParams);
        if (response.isSucc && response.res.resultCode == ResultCode.OK) {
            console.warn("领取任务奖励成功:", response.res);
            return response.res;
        } else {
            console.error("领取任务奖励失败", response);
            return null;
        }
    }

}

