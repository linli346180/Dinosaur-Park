import { _decorator } from 'cc';
import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { AccountModelComp } from '../model/AccountModelComp';
import { Account } from '../Account';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountNetService } from '../AccountNet';
import { TGNetService } from '../../../telegram/TGNet';
import { GameEvent } from '../../common/config/GameEvent';
import { EDITOR } from 'cc/env';
import { sys } from 'cc';

@ecs.register('AccountLogin')
export class AccountLoginComp extends ecs.Comp {
    reset() { }
}

@ecs.register('Account')
export class AccountLoginData extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(AccountLoginComp, AccountModelComp);
    }

    async entityEnter(entity: Account): Promise<void> {
        console.log(`【当前平台】'+ ${sys.platform}【运行系统】${sys.os} 【浏览器类型】${sys.browserType}`);
        if (EDITOR) {
            console.log("使用测试登陆")
            await AccountNetService.LoginTestAccount().then((response) => {
                this.onLogonSucess(entity, response)
            });
        } else {
            console.log("使用TD登陆")
            const TGAppData = await TGNetService.GetTelegramAPPData();
            await AccountNetService.LoginTGAcount(TGAppData).then((response) => {
                this.onLogonSucess(entity, response)
            });
        }

        oops.message.dispatchEvent(GameEvent.LoginSuccess);
        entity.remove(AccountLoginComp);
    }

    private onLogonSucess(entity: Account, response: any) {
        entity.AccountModel.user = response.user;
        entity.AccountModel.coinPoolData = response.userCoinIncome;
    }
}