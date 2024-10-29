import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { AccountType, RegisterType, UserCoinData, UserData } from "../AccountDefine";

/** 
 * 游戏账号数据 
 */
@ecs.register('AccountModel')
export class AccountModelComp extends ecs.Comp {
    user: UserData = new UserData(); // 用户数据
    CoinData :UserCoinData = new UserCoinData(); // 户货币数据
    UserInstb?: IStartBeastData[];    //用户收益星兽列表
    UserNinstb?: IStartBeastData[];  //用户无收益星兽列表

    reset() {
        this.user = new UserData();
    }

    /** 添加无收益星兽 */
    addUserUnInComeSTB(STBData: IStartBeastData): boolean {
        let stbId = STBData.id;
        const index = this.UserNinstb.findIndex((element) => element.id === stbId);
        if (index == -1) {
            this.UserNinstb.push(STBData);
            return true
        }
        console.error("添加无收益星兽失败:", stbId);
        return false;
    }

    /** 添加有收益星兽 */
    addInComeSTBData(STBData: IStartBeastData): boolean {
        let stbId = STBData.id;
        const index = this.UserInstb.findIndex((element) => element.id === stbId);
        if (index == -1) {
            this.UserInstb.push(STBData);
            return true
        }
        console.error("添加有收益星兽失败:", stbId);
        return false;
    }

    /** 删除收益星兽(地图上) */
    delUserInComeSTB(stbId: number): boolean {
        const index = this.UserInstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            this.UserInstb.splice(index, 1);
            return true;
        }
        return false;
    }

    /** 删除星兽(背包) */
    delUserUnIncomeSTB(stbId: number): boolean {
        const index = this.UserNinstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            this.UserNinstb.splice(index, 1);
            return true;
        }
        return false;
    }

    /* 获取用户收益星兽数据 */
    // getUserSTBData(stbId: number): IStartBeastData | null {
    //     const foundElement = this.UserInstb.find((element) => element.id === stbId);
    //     return foundElement || null;
    // }

    /** 更新星兽数据 */
    updateUnIncomeSTBData(STBData: IStartBeastData): boolean {
        const index = this.UserNinstb.findIndex((element) => element.id === STBData.id);
        if (index !== -1) {
            this.UserNinstb[index] = STBData;
            return true;
        }
        console.error("升级无收益星兽失败:", STBData.id);
        return false;
    }
}

/** 星兽数据 */
export interface IStartBeastData {
    id: number;             //星兽ID
    createdAt: string;      //创建时间
    updatedAt: string;      //更新时间
    userID: number;         //用户ID
    stbConfigID: number;    //星兽配置ID
    stbPosition: number;    //星兽位置
    lastIncomeTime: string; //最后收益时间
    // stbConfig: IStbConfig;
}