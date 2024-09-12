import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { AccountModelComp } from '../model/AccountModelComp';
import { netChannelManager } from '../../common/network/NetChannelManager';
import { Account } from '../Account';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../AccountEvent';
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
        const loginResponse = await netChannelManager.LoginAccount();
        entity.AccountModel.fillData(loginResponse);

        oops.message.dispatchEvent(AccountEvent.LoginSuccess);
        entity.remove(AccountNetDataComp);
    }
}


