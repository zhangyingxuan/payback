const playwright = require('playwright');
class PlayWrightST {
    constructor() { }
    static async getInstance() {
        if (!PlayWrightST.instance) {
            PlayWrightST.instance = await playwright.chromium.launch();
        }
        return PlayWrightST.instance;
    }
}
//# sourceMappingURL=playWrightST.js.map