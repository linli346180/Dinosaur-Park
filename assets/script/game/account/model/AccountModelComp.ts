import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";

/** 
 * 游戏账号数据 
 */
@ecs.register('AccountModel')
export class AccountModelComp extends ecs.Comp {
    user: UserData = new UserData(); // 用户数据
    userInstbData: IUserInstbData = {
        UserInstb: [],      //用户收益星兽列表
        UserNinstb: []  //用户无收益星兽列表
    };

    fillData(data: any) {
        Object.assign(this.user, data.user);
        // Object.assign(this.userInstbData, data.userInstbData);
    }

    reset() {
    }

    /** 添加无收益星兽 */
    addUserUnInComeSTB(STBData: IStartBeastData): boolean {
        let stbId = STBData.id;
        const index = this.userInstbData.UserNinstb.findIndex((element) => element.id === stbId);
        if (index == -1) {
            this.userInstbData.UserNinstb.push(STBData);
            return true
        }
        console.error("添加无收益星兽失败:", stbId);
        return false;
    }

    /** 添加有收益星兽 */
    addInComeSTBData(STBData: IStartBeastData): boolean {
        let stbId = STBData.id;
        const index = this.userInstbData.UserInstb.findIndex((element) => element.id === stbId);
        if (index == -1) {
            this.userInstbData.UserInstb.push(STBData);
            return true
        }
        console.error("添加有收益星兽失败:", stbId);
        return false;
    }

    /** 删除收益星兽(地图上) */
    delUserInComeSTB(stbId: number): boolean {
        const index = this.userInstbData.UserInstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            this.userInstbData.UserInstb.splice(index, 1);
            return true;
        }
        return false;
    }

    /** 删除星兽(背包) */
    delUserUnIncomeSTB(stbId: number): boolean {
        const index = this.userInstbData.UserNinstb.findIndex((element) => element.id === stbId);
        if (index !== -1) {
            this.userInstbData.UserNinstb.splice(index, 1);
            return true;
        }
        return false;
    }

    /* 获取用户收益星兽数据 */
    getUserSTBData(stbId: number): IStartBeastData | null {
        const foundElement = this.userInstbData.UserInstb.find((element) => element.id === stbId);
        return foundElement || null;
    }

    /** 更新星兽数据 */
    updateUnIncomeSTBData(STBData: IStartBeastData): boolean {
        const index = this.userInstbData.UserNinstb.findIndex((element) => element.id === STBData.id);
        if (index !== -1) {
            this.userInstbData.UserNinstb[index] = STBData;
            return true;
        }
        console.error("升级无收益星兽失败:", STBData.id);
        return false;
    }
}

export class UserData {
    id: number = 0; // 用户ID
    createdAt: string = ''; // 创建时间
    updatedAt: string = ''; // 更新时间
    deletedAt: string = ''; // 删除时间
    name: string = ''; // 名称
    email: string = ''; // 邮箱
    mobile: string = ''; // 手机号
    account: string = ''; // 账号
    registerType: number = 0; // 注册类型
    externalAccountType: number = 0; // 外部账号类型
    externalAccountUid: string = ''; // 用户外部ID
    avatarPath: string = ''; // 头像路径
    state: number = 0; // 用户状态
    prohibitionState: number = 0; // 用户封禁状态
    releaseAt: string | null = null; // 解禁时间
}

export interface IUserInstbData {
    UserInstb: IStartBeastData[];
    UserNinstb: IStartBeastData[];
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