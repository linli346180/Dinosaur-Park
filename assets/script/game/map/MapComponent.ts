import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Vec2 } from 'cc';
import { EventTouch } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { IMapConfig, MapConfigData, MapID } from './MapConfig';
import { Enum } from 'cc';
import { Tween } from 'cc';
import { math } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../account/AccountEvent';
import { smc } from '../common/SingletonModuleComp';
import { STBID } from '../character/STBDefine';
import { STBConfigData } from '../character/STBConfig';
import { ViewUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ViewUtil';
import { ArrayUtil } from '../../../../extensions/oops-plugin-framework/assets/core/utils/ArrayUtil';
const { ccclass, property } = _decorator;

enum SwipeDirection {
    None,
    Left,
    Right,
    Up,
    Down
}

@ccclass('MapComponent')
export class MapComponent extends Component {
    @property({ type: Enum(MapID), displayName: "默认地图" })
    currentMapID: MapID = MapID.Map1;

    private moveSpeed: number = 1.5;
    private slowSpeed: number = 0.05;
    private _hovMax: number = 540;
    private _hovMin: number = -540;
    private _lastPos: Vec2 = new Vec2();
    private _elasticClamp: number = 50;
    private _isFastSwipe: SwipeDirection = SwipeDirection.None;
    private _lastTime: number = 0;
    private fastSwipeThreshold: number = 2;
    private mapNodes: Map<number, Node> = new Map();

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onNodeTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onNodeTouchEnd, this);

        oops.message.on(AccountEvent.AddUserSTB, this.onHandler, this);
        this.initUI();
    }

    initUI() {
        this._hovMax = this.getMaxCenter();
        this._hovMin = this.getMinCenter();
        this.switchMap(this.currentMapID);

        Object.keys(MapConfigData).forEach((key) => {
            const mapConfig: IMapConfig = MapConfigData[Number(key)];
            let mapNode = this.node.getChildByPath(mapConfig.path);
            if (mapNode)
                this.mapNodes.set(Number(key), mapNode);
            else
                console.error("地图节点不存在");
        });
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case AccountEvent.AddUserSTB:
                this.addUserSTBItem(args);
                break;
            case AccountEvent.DelUserSTB:
                this.delUserSTBItem(args);
                break;
        }
    }

    async addUserSTBItem(stb: number) {
        const data = smc.account.AccountModel.getUserSTBData(stb)
        if (data) {
            console.log("添加新的STB");
            const stbConfigID = data.stbConfigID;
            const prefabPath = STBConfigData[stbConfigID].perfab;
            const mapID = STBConfigData[stbConfigID].mapID;

            // 获取随机生成点
            const mapConfig = MapConfigData[mapID];
            if (mapConfig.spawnPoint.length == 0) {
                console.error("地图出生点已用完");
                return;
            }

            const randomSpawnPoint = ArrayUtil.getRandomValueInArray(mapConfig.spawnPoint);
            // 从数组中移除随机选择的出生点
            const index = mapConfig.spawnPoint.indexOf(randomSpawnPoint);
            if (index > -1) {
                mapConfig.spawnPoint.splice(index, 1);
            }

            let itemPerfab = await ViewUtil.createPrefabNodeAsync(prefabPath);
            const mapNode = this.mapNodes.get(mapID);
            if (itemPerfab && mapNode) {
                itemPerfab.setParent(mapNode);
                let spawnPoint = new Vec3(randomSpawnPoint.x, randomSpawnPoint.y, 0);
                itemPerfab.setPosition(spawnPoint);
            }
        }
        else {
            console.log("添加新的STB失败");
        }
    }

    delUserSTBItem(stb: number) {

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
        let maxCenter = -Infinity;  // 初始设置为负无穷大
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
        let minCenter = Infinity;   // 初始设置为正无穷大
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