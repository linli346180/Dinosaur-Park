
import { JsonUtil } from "../../../../../extensions/oops-plugin-framework/assets/core/utils/JsonUtil";

export class TableSTBConfig {
    static TableName: string = "STBConfig";

    private data: any;

    init(id: number) {
        var table = JsonUtil.get(TableSTBConfig.TableName);
        this.data = table[id];
        this.id = id;
    }

    /** 编号【KEY】 */
    id: number = 0;

    /** 名称 */
    get name(): string {
        return this.data.name;
    }
    /** 图标 */
    get icon(): string {
        return this.data.icon;
    }
    /** 围栏 */
    get map(): number {
        return this.data.map;
    }
    /** 动画 */
    get animation(): string {
        return this.data.animation;
    }
    /** 星兽种类 */
    get kinds(): number {
        return this.data.kinds;
    }
    /** 星兽等级 */
    get grade(): number {
        return this.data.grade;
    }
    /** 是否可以收益(1.是,2.否) */
    get income(): number {
        return this.data.income;
    }
    /** 星兽存活时间 */
    get survival(): number {
        return this.data.survival;
    }
    /** 是否可以购买 */
    get pur(): number {
        return this.data.pur;
    }
    /** 购买消耗货币类型 */
    get purcoin(): number {
        return this.data.purcoin;
    }
    /** 购买图标 */
    get puricon(): string {
        return this.data.puricon;
    }
    /** 预制体 */
    get perfab(): string {
        return this.data.perfab;
    }
}
    