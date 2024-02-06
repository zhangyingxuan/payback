"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRobotInstance = void 0;
require("dotenv/config.js");
const wechaty_1 = require("wechaty");
const qrcodeTerminal = require('qrcode-terminal');
function onScan(qrcode, status) {
    console.log(qrcodeTerminal);
    if (status === wechaty_1.ScanStatus.Waiting || status === wechaty_1.ScanStatus.Timeout) {
        qrcodeTerminal.generate(qrcode, { small: true });
        const qrcodeImageUrl = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('');
        wechaty_1.log.info('StarterBot', 'onScan: %s(%s) - %s', wechaty_1.ScanStatus[status], status, qrcodeImageUrl);
    }
    else {
        wechaty_1.log.info('StarterBot', 'onScan: %s(%s)', wechaty_1.ScanStatus[status], status);
    }
}
function onLogin(user) {
    wechaty_1.log.info('StarterBot', '%s login', user);
}
function onLogout(user) {
    wechaty_1.log.info('StarterBot', '%s logout', user);
}
async function onMessage(msg) {
    if (msg.self()) {
        console.log('this message is sent by myself!');
    }
    else {
        wechaty_1.log.info('StarterBot', msg.toString());
    }
    if (msg.text() === 'ding') {
        await msg.say('dong');
    }
}
function getRobotInstance() {
    const bot = wechaty_1.WechatyBuilder.build({
        name: 'ding-dong-bot',
        puppet: 'wechaty-puppet-wechat4u',
    });
    bot.on('scan', onScan);
    bot.on('login', onLogin);
    bot.on('logout', onLogout);
    bot.on('message', onMessage);
    bot
        .start()
        .then(() => wechaty_1.log.info('StarterBot', 'Starter Bot Started.'))
        .catch(e => wechaty_1.log.error('StarterBot', e));
    return bot;
}
exports.getRobotInstance = getRobotInstance;
//# sourceMappingURL=ding-dong-bot.js.map