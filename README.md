# Ant Design Pro

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.

## Environment Prepare

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
npm start
```

### Build project

```bash
npm run build
```

### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

### Test code

```bash
npm test
```

## More

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).
git clone http://gitlab.dnatime.com/front-end/ecm-antd.git  
cd ecm-end  
安装依赖 npm i
启动 npm start
打包
开发 npm run dev
测试 npm run test
生产 npm run build 


node 版本v8.0以上  
相关文档
ui框架 antd https://ant.design/index-cn
ajax库 axios  https://www.kancloud.cn/yunye/axios/234845  


注意:开发时npm start启动默认为dev环境，需要请求test、pro、接口请手机个性utils/config文件中的env参数
打包为自动更改api host无修手动修改
