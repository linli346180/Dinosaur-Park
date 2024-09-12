import { _decorator, Component, Node } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { netChannelManager } from '../../common/network/NetChannelManager';
import { Account } from '../Account';
import { AccountEvent } from '../AccountEvent';
import { STBConfigModeComp } from '../model/STBConfigModeComp';
const { ccclass, property } = _decorator;


/** 请求玩家游戏数据 */
@ecs.register('STBConfigNetData')
export class STBConfigNetDataComp extends ecs.Comp {
    reset() { }
}

/** 请求玩家游戏数据 */
@ecs.register('Account')
export class STBConfigNetData extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(STBConfigNetDataComp, STBConfigModeComp);
    }

    async entityEnter(entity: Account): Promise<void> {
        // 星兽配置
        const responseData = await netChannelManager.getStartBeastConfig();
        entity.STBConfigMode.userInstbData = responseData.userInstbData;
        oops.message.dispatchEvent(AccountEvent.STBConfigSuccess);

        // 星兽图鉴
        const statData = await netChannelManager.getStartBeastStatData();
        entity.AccountModel.codexData = statData.codexData;
        entity.remove(STBConfigNetDataComp);
    }
}

