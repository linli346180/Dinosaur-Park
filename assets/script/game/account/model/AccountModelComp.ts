import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { AccountType, RegisterType, UserCoinData, UserCoinIncome, UserData } from "../AccountDefine";

/** 
 * 游戏账号数据 
 */
@ecs.register('AccountModel')
export class AccountModelComp extends ecs.Comp {
    userData: UserData = new UserData(); // 用户数据
    coinPoolData: UserCoinIncome = new UserCoinIncome(); // 户货币数据(待领取)
    CoinData: UserCoinData = new UserCoinData(); // 户货币数据

    private UserInstb: StartBeastData[] = [];    //用户收益星兽列表
    private UserNinstb: StartBeastData[] = [];  //用户无收益星兽列表

    public getUserInstb(): StartBeastData[] {
        return [...this.UserInstb];
    }

    public setUserInstb(value: StartBeastData[]) {
        this.UserInstb = value;
    }

    public getUserNinstb(): StartBeastData[] {
        return [...this.UserNinstb];
    }

    public setUserNinstb(value: StartBeastData[]) {
        this.UserNinstb = value;
    }

    public createGuideData() {
        this.coinPoolData = new UserCoinIncome();
        this.CoinData = new UserCoinData();
        const curTimestamp = Date.now();
        this.UserInstb = [];
        this.UserNinstb = [
            { id: 1, createdAt: curTimestamp, userID: 0, stbConfigID: 101, stbPosition: 1, lastIncomeTime: curTimestamp },
            { id: 2, createdAt: curTimestamp, userID: 0, stbConfigID: 102, stbPosition: 2, lastIncomeTime: curTimestamp },
        ];
    }

    reset() {
        this.userData = new UserData();
        this.coinPoolData = new UserCoinIncome();
        this.CoinData = new UserCoinData();
        this.UserInstb = [];
        this.UserNinstb = [];
    }

    /** 添加星兽数据 */
    private addSTBData(STBData: StartBeastData, list: StartBeastData[]): boolean {
        const index = list.findIndex(element => element.id === STBData.id);
        if (index === -1) {
            console.log("星兽不存在,添加数据:", STBData.id, STBData.stbConfigID);
            list.push({ ...STBData });
        } else {
            list[index] = { ...STBData };
            console.log("星兽已存在,替换数据:", STBData.id, STBData.stbConfigID);
        }
        return true;
    }

    /** 删除星兽数据 */
    private delSTBData(stbId: number, list: StartBeastData[]): boolean {
        const index = list.findIndex(element => element.id === stbId);
        if (index !== -1) {
            list.splice(index, 1);
            return true;
        }
        console.error("星兽不存在,删除失败", stbId);
        return false;
    }

    /** 添加有收益星兽 */
    addInComeSTBData(STBData: StartBeastData): boolean {
        return this.addSTBData(STBData, this.UserInstb);
    }

    /** 删除有收益星兽 */
    delUserInComeSTB(stbId: number): boolean {
        return this.delSTBData(stbId, this.UserInstb);
    }

    /** 添加无收益星兽 */
    addUserUnInComeSTB(STBData: StartBeastData): boolean {
        return this.addSTBData(STBData, this.UserNinstb);
    }

    /** 删除无收益星兽 */
    delUserUnIncomeSTB(stbId: number): boolean {
        const index = this.UserNinstb.findIndex(element => element.id === stbId);
        if (index !== -1) {
            this.UserNinstb[index].stbConfigID = 0;
            return true;
        }
        return false;
    }

    /** 更新星兽数据 */
    updateUnIncomeSTBData(STBData: StartBeastData): boolean {
        const index = this.UserNinstb.findIndex(element => element.id === STBData.id);
        if (index !== -1) {
            this.UserNinstb[index] = { ...STBData };
            return true;
        }
        return false;
    }
}

/** 星兽数据 */
export class StartBeastData {
    readonly id: number = 0;                        //星兽ID
   
    stbConfigID: number = 0;                        //星兽配置ID
    readonly stbPosition: number = 0;               //星兽位置
    readonly userID: number| null = 0;                    //用户ID
    readonly createdAt: number | null = 0;          //创建时间
    readonly lastIncomeTime: number | null = 0;     //最后收益时间
}

export enum UserSTBType {
    InCome = 1, //有收益星兽
    UnInCome = 2, //无收益星兽
}