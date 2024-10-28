import { ecs } from '../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountModelComp } from '../model/AccountModelComp';
import { Account } from '../Account';
import { AccountEvent } from '../AccountEvent';


@ecs.register('AccountNickName')
export class AccountNickNameComp extends ecs.Comp {
    /** 昵称 */ 
    nickname: string = null!;

    reset(): void {
        this.nickname = null!;
    }
}


@ecs.register('AccountNickName')
export class AccountNickNameSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(AccountNickNameComp, AccountModelComp);
    }

    entityEnter(e: Account): void {
        let newNickname = e.AccountNickName.nickname;
        oops.message.dispatchEvent(AccountEvent.ChangeNickName, newNickname);
        e.remove(AccountNickNameComp);
    }
}




