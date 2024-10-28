
/** 状态 */
export interface IState<TKey> {
    id: TKey
    onEnter(): void;
    onExit(): void;
    update(deltaTime: number): void;
    onDestory(): void;
    canTransit(to: TKey): boolean;
}

/** 跳转 */
export interface ITransitable<TKey> {
    transiteTo(name: TKey): void;
}

export interface IMachine<TKey> {
    addState(state: IState<TKey>): void;
    removeState(name: TKey): void;
    update(dt: number): void;
}

/** 状态机 */
export class SubMachine<TKey> implements IMachine<TKey>, IState<TKey>, ITransitable<TKey> {
    id: TKey;
    states: Map<TKey, IState<TKey>> = new Map();    // 总状态
    currState: IState<TKey>;    // 当前状态
    defaultState: TKey;         // 默认状态

    addState(state: IState<TKey>) {
        this.states.set(state.id, state);
    }

    removeState(name: TKey) {
        this.states.delete(name);
    }

    update(dt: number) {
        this.currState?.update(dt);
    }

    transiteTo(name: TKey) {
        if (this.currState && !this.currState.canTransit(name)) {
            return;
        }
        this.currState?.onExit();
        this.currState = this.states.get(name);
        this.currState?.onEnter();
    }

    onEnter(): void {
        if (this.defaultState) {
            this.transiteTo(this.defaultState);
        }
    }

    onExit(): void {
        this.currState?.onExit();
    }

    onDestory(): void {
        this.currState = null;
        this.states.clear();
    }

    canTransit(to: TKey): boolean {
        return this.currState?.canTransit(to);
    }
}