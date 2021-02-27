# Readme #
这是一个快速搭建gulp系统的工具集，内置了一套案例和awesomefont pro, 等优质的图标库
通过改平台开始对bootstrap css样式进行整合和改造
this is a tool tip for build gulp system fastly, set some example and superior icon collections


### 怎么运行?
* 这套工具集是基于gulp平台搭建的，使用了gulp任务列表进行构建
使用基本的gulp命令就能搭建
+ 搭建方式如下:
  * 安装nodeJS任何从5.0开始的版本 (https://nodejs.org/en/)
  * 设置node的环境变量，用于在命令行输入node就能进行js编写
  * cmd命令进入当当前项目根路径
  * npm install gulp
  * npm install
  * gulp build
* 设置上线环境

### 一些说明
+ gulp命令
  * gulp build 开启服务
  * gulp build-dist 对源码进行渲染输出，包括handlebar模板，scss和js
  * gulp build-bundle 仅对scss和js进行渲染输出
  * gulp build-html 对handlebar模板渲染输出为html
  * gulp connect 开启服务
  * gulp watch 对src下的文件进行实时监听
+ 内置图标集
  * awesomefont-pro
  * nextgen-fonts

### 新功能
* 可以进行对es6语法的转换
build.json->`compile:{"babelify": true}`

toc, markdown插件，可在handlebars文档中插入markdown，渲染成html


### bootstrap css样式整理和改造
- alert
- button
- badge

ssh -i "/mnt/e/one drive/OneDrive/machine/bekazone.pem" ec2-user@ec2-3-16-160-161.us-east-2.compute.amazonaws.com

scp -i "/mnt/e/one drive/OneDrive/machine/bekazone.pem" source  ec2-user@ec2-3-16-160-161.us-east-2.compute.amazonaws.com:~/






