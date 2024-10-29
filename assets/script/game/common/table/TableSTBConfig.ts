
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
    /** 动画 */
    get animation(): string {
        return this.data.animation;
    }
    /** 购买图标 */
    get puricon(): string {
        return this.data.puricon;
    }
    /** 地图 */
    get map(): number {
        return this.data.map;
    }
    /** 预制体 */
    get perfab(): string {
        return this.data.perfab;
    }
}
    