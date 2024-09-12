import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";

/** 
 * 游戏账号数据 
 */
@ecs.register('AccountModel')
export class AccountModelComp extends ecs.Comp {

    user: UserData = new UserData()
    userCoin: UserCoinData = new UserCoinData() //用户收益星兽列表
    userInstbData: IUserInstbData = { UserInstb: [], UserNinstb: [] };  //用户无收益星兽列表
    codexData: CodexData[] = [];    //星兽图鉴数据

    fillData(data: any) {
        Object.assign(this.user, data.user);
        Object.assign(this.userCoin, data.userCoin);
        Object.assign(this.userInstbData, data.userInstbData);
    }

    reset() {
    }

    /** 删除星兽(背包) */
    delUserNinSTB(stbId: number): boolean {
        const index = this.userInstbData.UserNinstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            this.userInstbData.UserNinstb.splice(index, 1);
        }
        else {
            console.error("删除失败:", stbId);
            return false;
        }
        return true;
    }

    /** 添加无收益星兽 */
    addUserNinSTB(STBData: any): boolean {
        let stbId = STBData.id;
        const index = this.userInstbData.UserNinstb.findIndex((element) => element.id === stbId);
        if (index == -1) {
            this.userInstbData.UserNinstb.push({ 
                id: stbId, 
                createdAt: STBData.createdAt, 
                updatedAt: STBData.updatedAt, 
                userID: STBData.userID, 
                stbConfigID: STBData.stbConfigID, 
                stbPosition: STBData.stbPosition, 
                LastIncomeTime: STBData.LastIncomeTime 
            });
        } else {
            console.error("添加失败:", stbId);
            return false;
        }
        return true
    }

    /** 添加有收益星兽 */
    addUserSTB(STBData: any): boolean {
        let stbId = STBData.id;
        const index = this.userInstbData.UserInstb.findIndex((element) => element.id === stbId);
        if (index == -1) {
            this.userInstbData.UserInstb.push({ 
                id: stbId, 
                createdAt: STBData.createdAt, 
                updatedAt: STBData.updatedAt, 
                userID: STBData.userID, 
                stbConfigID: STBData.stbConfigID, 
                stbPosition: STBData.stbPosition, 
                LastIncomeTime: STBData.LastIncomeTime 
            });
        } else {
            console.error("添加失败:", stbId);
            return false;
        }
        return true
    }

    /* 获取用户收益星兽数据 */
    getUserSTBData(stbId: number) : IStartBeastData | null{
        const foundElement = this.userInstbData.UserInstb.find((element) => element.id === stbId);
        return foundElement || null;
    }

    /** 升级星兽 */
    upgradeUserNinSTB(stbId: number): boolean {
        const index = this.userInstbData.UserNinstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            this.userInstbData.UserNinstb[index].stbConfigID += 1;
        }
        else {
            console.error("升级失败:", stbId);
            return false;
        }
        return true;
    }
}

export class UserData {
    ID: number = 0
    Name: string = ''
    Email: string = ''
    Mobile: string = ''
    Account: string = ''
    AvatarPath: string = ''
}

export class UserCoinData {
    goldCoin: number = 0    //金币(金币星兽产出)
    gemsCoin: number = 0      //宝石(宝石星兽产出)
    usdt: number = 0          //USDT(钻石星兽产出)
    starBeastCoin: number = 0 //星兽币(sbpc,至尊星兽产出)
}

export interface IUserInstbData {
    UserInstb: IStartBeastData[];
    UserNinstb: IStartBeastData[];
}

/** 星兽数据 */
export interface IStartBeastData {
    id: number;
    createdAt: string;
    updatedAt: string;
    userID: number;
    stbConfigID: number;
    stbPosition: number;
    LastIncomeTime: string;
    // stbConfig: IStbConfig;
}

/** 星兽配置 */
export interface IStbConfig {
    id: number;
    createdAt: string;
    updatedAt: string;
    stbKinds: number;
    stbName: string;
    stbGrade: number;
    isIncome: number;
    stbSurvival: number;
    incomeType: number;
    incomeCycle: number;
    incomeNumMin: number;
    incomeNumMax: number;
    incomeGetOpport: number;
    incomeGetMethod: number;
    isPur: number;
    purConCoin: number;
    purConCoinNum: number;
    desc: string;
}

interface CodexData {
    [key: string]: number;
}