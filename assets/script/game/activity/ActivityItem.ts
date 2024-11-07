import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { BounsRankData } from './ActivityDefine';
import { Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ActivityItem')
export class ActivityItem extends Component {
    @property(Node)
    icon:Sprite = null!;

    @property(Label)
    userName:Label  = null!;
    @property(Label)
    time:Label = null!;
    @property(Label)
    count:Label = null!;

    public initItem(data: BounsRankData) {
        this.userName.string = data.name;
        this.time.string =  this.formatDate(data.createdAt);
        this.count.string = data.rpAmount.toString();

        // TODO 设置头像
        if (data.id % 2 === 0) {
            const sprite = this.node.getComponent(Sprite);
            if (sprite) {
                sprite.color = new Color(248, 205, 139);
            }
        }
    }

    private formatDate(dateString: string): string {
        // 解析日期字符串
        const date = new Date(dateString);

        // 格式化日期
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };

        const formatter = new Intl.DateTimeFormat('zh-CN', options);
        const parts = formatter.formatToParts(date);

        // 提取并组合日期和时间部分
        const year = parts.find(part => part.type === 'year')?.value;
        const month = parts.find(part => part.type === 'month')?.value;
        const day = parts.find(part => part.type === 'day')?.value;
        const hour = parts.find(part => part.type === 'hour')?.value;
        const minute = parts.find(part => part.type === 'minute')?.value;

        return `${year}-${month}-${day} ${hour}:${minute}`;
    }
}


