
import { JsonUtil } from "../../../../../extensions/oops-plugin-framework/assets/core/utils/JsonUtil";

export class TableItemConfig {
    static TableName: string = "ItemConfig";

    private data: any;

    init(id: number) {
        var table = JsonUtil.get(TableItemConfig.TableName);
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
}
    