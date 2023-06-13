declare const playwright: any;
declare class PlayWrightST {
    private static instance;
    private constructor();
    static getInstance(): Promise<PlayWrightST>;
}
