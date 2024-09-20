
import { JsonUtil } from "../../../../../extensions/oops-plugin-framework/assets/core/utils/JsonUtil";

export class TablePrimaryDebrisConfig {
    static TableName: string = "PrimaryDebrisConfig";

    private data: any;

    init(id: number) {
        var table = JsonUtil.get(TablePrimaryDebrisConfig.TableName);
        this.data = table[id];
        this.id = id;
    }

    /** 编号【KEY】 */
    id: number = 0;

    /** 名称 */
    get name(): string {
        return this.data.name;
    }
    /** 位置 */
    get position(): number {
        return this.data.position;
    }
    /** 图标 */
    get icon(): string {
        return this.data.icon;
    }
}
    