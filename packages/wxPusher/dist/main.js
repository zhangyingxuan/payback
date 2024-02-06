"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const compression = require("compression");
const app_module_1 = require("./app.module");
const HttpExceptionFilter_1 = require("./filters/HttpExceptionFilter");
const portManager_1 = require("./utils/portManager");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(compression());
    app.setGlobalPrefix('blowsysun');
    app.useGlobalFilters(new HttpExceptionFilter_1.HttpExceptionFilter());
    const port = await (0, portManager_1.getAvailablePort)(3001);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map