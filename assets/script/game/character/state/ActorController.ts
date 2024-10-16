import { _decorator, Component, Node } from 'cc';
import { Actor } from './Actor';
import { StateDefine } from './StateDefine';
import { Idle } from './Idle';
import { Run } from './Run';
import { math } from 'cc';
import { bt } from '../ai/BehaviourTree';
import { v3 } from 'cc';
import { BlackboardKey } from '../ai/BlackboardKey';
import { MoveToDest, SetMoveDest, StayIdle, Wait } from '../ai/Action';
import { Vec2 } from 'cc';
import { IStartBeastData } from '../../account/model/AccountModelComp';
import { smc } from '../../common/SingletonModuleComp';
import { Color } from 'cc';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { AccountEvent } from '../../account/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('ActorController')
export class ActorController extends Component {
    actor: Actor | null = null!;
    ai: bt.BehaviourTree = null!

    public stbId: number = 0;  // 星兽ID
    public stbData: IStartBeastData | undefined; // 星兽数据

    public widthLimit: Vec2 = new Vec2();
    public heightLimit: Vec2 = new Vec2();

    private survivalSec: number = 0;
    private isSurvival: boolean = true;

    start() {
        this.actor = this.node.getComponent(Actor);
        this.createAI();
        this.initBlackboard();

        this.actor?.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor?.stateMgr.registState(new Run(StateDefine.Run, this.actor));
        this.actor?.stateMgr.startWith(StateDefine.Idle);

        this.survivalSec = smc.account.getSTBSurvivalSec(this.stbId);
        // this.survivalSec = 10;
        if (this.actor && this.actor.survival) {
            this.actor.survival.string = ` ${this.survivalSec} 秒`;
        }

        // TODO 生命周期
        if (this.survivalSec > 0) {
            console.log("剩余生命周期:" + this.survivalSec)
            this.schedule(this.updateActorTime, 1.0, this.survivalSec, 0);
        }
    }

    update(deltaTime: number) {
        if (this.isSurvival)
            this.ai.update(deltaTime);
    }

    updateActorTime() {
        if (this.survivalSec > 0) {
            this.survivalSec--;
            if (this.actor && this.actor.survival) {
                this.actor.survival.string = ` ${this.survivalSec} 秒`;
            }

            if(this.survivalSec<=3){
                if (this.actor && this.actor.survival) {
                    this.actor.survival.color = Color.RED;
                }
            }
        } else {
            this.unschedule(this.updateActorTime);
            console.log('时间到，执行相关逻辑');
            
            this.isSurvival = false;

            // 监听Sock消息
            // this.actor?.stateMgr.transit(StateDefine.Idle);
            // smc.account.delUserSTBData(this.stbId)
            // oops.message.dispatchEvent(AccountEvent.DedIncomeSTB, this.stbId);
        }
    }

    createAI() {
        this.ai = new bt.BehaviourTree();
        let rootNode = new bt.Fallback();
        this.ai.root = rootNode;

        // Partrol .... move to dest position
        let moveDestSeq = new bt.Sequence();
        let hasMoveDest = new bt.IsTrue();
        hasMoveDest.key = BlackboardKey.MoveDest;
        moveDestSeq.addChild(hasMoveDest);

        let moveDest = new MoveToDest();
        moveDestSeq.addChild(moveDest);
        rootNode.addChild(moveDestSeq);

        // wait for nothing 
        let idleSeq = new bt.Sequence();
        idleSeq.addChild(new StayIdle());
        let wait = new Wait();
        wait.interval = 5.0;
        idleSeq.addChild(wait);
        idleSeq.addChild(new SetMoveDest());

        rootNode.addChild(idleSeq);
    }

    initBlackboard() {
        this.ai.setData(BlackboardKey.Escaped, false);
        this.ai.setData(BlackboardKey.Actor, this.actor);
        this.randomNextMoveDest();
    }

    /** 随机位移 */
    randomNextMoveDest() {
        let moveDest = v3(math.randomRange(this.widthLimit.x, this.widthLimit.y),
            math.randomRange(this.heightLimit.x, this.heightLimit.y), 0);
        this.ai.setData(BlackboardKey.MoveDest, moveDest);
        this.ai.setData(BlackboardKey.MoveDestDuration, 3.0);
    }

    /** 是否被拖拽 */
    setDragState(isDrag: boolean) {
        if (this.actor) {
            this.ai.setData(BlackboardKey.Drag, isDrag);
        }
    }

    setWaitState() {
        this.ai.removeData(BlackboardKey.MoveDest);
    }
}