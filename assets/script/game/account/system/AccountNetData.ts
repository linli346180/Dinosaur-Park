import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { AccountModelComp } from '../model/AccountModelComp';
import { netChannelManager } from '../../common/network/NetChannelManager';
import { Account } from '../Account';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../AccountEvent';
import { AccountNetService } from '../AccountNet';
const { ccclass, property } = _decorator;

/** 请求玩家游戏数据 */
@ecs.register('AccountNetData')
export class AccountNetDataComp extends ecs.Comp {
    reset() { }
}

/** 请求玩家游戏数据 */
@ecs.register('Account')
export class AccountNetData extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(AccountNetDataComp, AccountModelComp);
    }

    async entityEnter(entity: Account): Promise<void> {
        const response = await netChannelManager.LoginAccount();
        if (response) {
            try {
                // entity.AccountModel.fillData(response);
                entity.AccountModel.user = response.user;

                // 星兽配置
                const configData = await AccountNetService.getStartBeastConfig();
                entity.STBConfigMode.instbConfigData = configData.userInstbData;
    
                // entity.STBConfigMode.instbConfigData.forEach((element: any) => { 
                //     console.log("星兽配置:"+ JSON.stringify(element))
                // });
               
                // 星兽数据
                const stbData = await AccountNetService.GetUserSTBData();
                entity.AccountModel.userInstbData = stbData.userInstbData;
                oops.message.dispatchEvent(AccountEvent.LoginSuccess);

            } catch (error) {
                console.error("网络异常", error);   
            }
        }
        entity.remove(AccountNetDataComp);
    }
}


