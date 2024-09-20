import { _decorator, Component, Node } from 'cc';
import { Actor } from './Actor';
import { StateDefine } from './StateDefine';
import { Idle } from './Idle';
import { Run } from './Run';
import { math } from 'cc';
import { bt } from '../ai/BehaviourTree';
import { v3 } from 'cc';
import { BlackboardKey } from '../ai/BlackboardKey';
import { MoveToDest, SetMoveDest, StayIdle } from '../ai/Action';
import { Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ActorController')
export class ActorController extends Component {
    actor: Actor|null = null!;
    ai: bt.BehaviourTree = null!

    public widthLimit: Vec2 = new Vec2();
    public heightLimit: Vec2 = new Vec2();

    start() {
        this.actor = this.node.getComponent(Actor);
        this.createAI();
        this.initBlackboard();

        this.actor?.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor?.stateMgr.registState(new Run(StateDefine.Run, this.actor));
        this.actor?.stateMgr.startWith(StateDefine.Idle);
    }

    update(deltaTime: number) {
        this.ai.update(deltaTime);
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
         rootNode.addChild(idleSeq);
         idleSeq.addChild(new StayIdle());
         let wait = new bt.Wait();
         wait.elapsed = 3.0;
         idleSeq.addChild(wait);
         idleSeq.addChild(new SetMoveDest());   
    }

    initBlackboard() {
        this.ai.setData(BlackboardKey.Escaped, false);
        this.ai.setData(BlackboardKey.Actor, this.actor);
        this.randomNextMoveDest();
    }

    randomNextMoveDest() {
        // let moveDest = v3(math.randomRange(-440, 440), math.randomRange(-600, 640), 0);
        let moveDest = v3(math.randomRange(this.widthLimit.x, this.widthLimit.y), 
        math.randomRange(this.heightLimit.x, this.heightLimit.y), 0);
        // console.error(moveDest);
        this.ai.setData(BlackboardKey.MoveDest, moveDest);
        this.ai.setData(BlackboardKey.MoveDestDuration, 3.0);
    }
}


