const playwright = require('playwright');

class PlayWrightST {
  private static instance: PlayWrightST;
  private constructor() {}
  public static async getInstance() {
    if (!PlayWrightST.instance) {
      PlayWrightST.instance = await playwright.chromium.launch();
    }

    return PlayWrightST.instance;
  }
}
