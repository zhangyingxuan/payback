FROM mcr.microsoft.com/playwright:v1.35.0-jammy

# copy project (including tests)
COPY ./packages/server /e2e

WORKDIR /e2e

ENV TZ="Asia/Shanghai"

# Install dependencies
# RUN npm install
RUN npm i --production --registry=https://registry.npm.taobao.org

# Install browsers；仅安装 chromium
RUN npx playwright install firefox

EXPOSE 7001

# Run playwright test
CMD yarn start
# CMD [ "npx", "playwright", "test", "--reporter=list" ]