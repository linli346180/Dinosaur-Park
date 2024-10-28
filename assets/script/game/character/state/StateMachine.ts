import { _decorator } from 'cc';
import { IState, SubMachine } from './State';


/** 有限状态机总入口 */
export class StateMachine<TKey> {

    mainMachine: SubMachine<TKey> = new SubMachine();

    get currState(): IState<TKey> {
        return this.mainMachine.currState;
    }

    startWith(name: TKey) {
        this.mainMachine.defaultState = name;
        this.mainMachine.transiteTo(name);
    }

    registState(state: IState<TKey>) {
        this.mainMachine.addState(state);
    }

    deregistState(name: TKey) {
        this.mainMachine.removeState(name);
    }

    transit(name: TKey) {
        this.mainMachine.transiteTo(name);
    }

    update(dt: number) {
        this.mainMachine.update(dt);
    }
}