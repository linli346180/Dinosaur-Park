import { Enum } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { MapConfigData, MapID } from './MapConfig';
import { Vec2 } from 'cc';
import { EventTouch } from 'cc';
import { Tween } from 'cc';
import { math } from 'cc';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

enum SwipeDirection {
    None,
    Left,
    Right,
    Up,
    Down
}

@ccclass('MapDrag')
export class MapDrag extends Component {
    @property({ type: Enum(MapID), displayName: "默认地图" })
    currentMapID: MapID = MapID.Map1;
    @property(Button)
    btn_right: Button = null!;
    @property(Button)
    btn_left: Button = null!;

    private moveSpeed: number = 1.5;
    private slowSpeed: number = 0.05;
    private _hovMax: number = 540;
    private _hovMin: number = -540;
    private _lastPos: Vec2 = new Vec2();
    private _elasticClamp: number = 50;
    private _isFastSwipe: SwipeDirection = SwipeDirection.None;
    private _lastTime: number = 0;
    private fastSwipeThreshold: number = 2;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);
        this.btn_right?.node.on(Button.EventType.CLICK, this.onRightClick, this);
        this.btn_left?.node.on(Button.EventType.CLICK, this.onLeftClick, this);
    }

    private onRightClick() {
        this.switchMap(this.currentMapID + 1);
    }

    private onLeftClick() {
        this.switchMap(this.currentMapID - 1);
    }

    private onNodeTouchStart(event: EventTouch) {
        this._lastPos = event.getUILocation();
        this._lastTime = Date.now(); // 初始化时间戳
        this._isFastSwipe = SwipeDirection.None;
        Tween.stopAllByTarget(this.node);
    }

    private onNodeTouchMove(event: EventTouch) {
        const curPos = event.getUILocation();
        const curTime = Date.now(); // 使用 Date.now() 获取当前时间戳
        const deltaTime = curTime - this._lastTime;
        let deltaX = (curPos.x - this._lastPos.x) * this.moveSpeed;
        if (this.node.position.x > this._hovMax || this.node.position.x < this._hovMin) {
            deltaX = deltaX * this.slowSpeed;
        }

        const speedX = Math.abs(deltaX / deltaTime);
        if (speedX > this.fastSwipeThreshold) {
            this._isFastSwipe = deltaX > 0 ? SwipeDirection.Right : SwipeDirection.Left;
        }

        const xPos = math.clamp(this.node.position.x + deltaX, this._hovMin - this._elasticClamp, this._hovMax + this._elasticClamp);
        this.node.setPosition(xPos, this.node.position.y, this.node.position.z);
        this._lastPos = curPos;
    }

    private onNodeTouchEnd(event: EventTouch) {
        // 重置最后位置
        this._lastPos = new Vec2();
        if (this._isFastSwipe) {
            let mapId = this._isFastSwipe == SwipeDirection.Left ? this.currentMapID + 1 : this.currentMapID - 1;
            this.switchMap(mapId);
            console.log("快速滑动");
            return;
        }
        this.switchMap(this.getClosestMapID());
    }

    /** 切换地图 */
    public switchMap(mapID: MapID) {
        const mapConfig = MapConfigData[mapID];
        if (mapConfig) {
            const targetPosition = new Vec3(mapConfig.center, this.node.position.y, this.node.position.z);
            tween(this.node)
                .to(0.25, { position: targetPosition }, { easing: 'sineOut' })
                .start();
            this.currentMapID = mapID;
        }
    }

    /** 获取地图最大值 */
    private getMaxCenter(): number {
        let maxCenter = -Infinity;
        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig = MapConfigData[Number(key)];
            if (mapConfig.center > maxCenter) {
                maxCenter = mapConfig.center;
            }
        });
        return maxCenter;
    }

    /** 获取地图最小值 */
    private getMinCenter(): number {
        let minCenter = Infinity;
        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig = MapConfigData[Number(key)];
            if (mapConfig.center < minCenter) {
                minCenter = mapConfig.center;
            }
        });
        return minCenter;
    }

    /** 获取最靠近的地图 */
    private getClosestMapID(): number {
        let mapCenters: number[] = [];
        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig = MapConfigData[Number(key)];
            mapCenters.push(mapConfig.center);
        });

        const curPosX = this.node.position.x;
        let closestMapID = this.currentMapID;
        let minDistance = Infinity;
        mapCenters.forEach((center, index) => {
            const distance = Math.abs(curPosX - center);
            if (distance < minDistance) {
                minDistance = distance;
                closestMapID = Number(Object.keys(MapConfigData)[index]);
            }
        });

        return closestMapID;
    }
}