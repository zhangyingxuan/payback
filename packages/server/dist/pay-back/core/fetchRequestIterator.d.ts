export declare class FetchRequestIterator {
    middlewares: Array<Function>;
    constructor();
    add(fn: any): this;
    run(ctx: any): Promise<void>;
}
export declare function nextRegister(args: Array<Function>): void;
