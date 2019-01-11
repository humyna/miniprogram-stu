// pages/wxml/index.js
/**
 * JavaScript同浏览器中的 JavaScript 以及 NodeJS 中的 JavaScript 是不相同的
 * 主要区别参考：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000a8806958588cb00862bd5851c0a 中2.4.1ECMAScript
 * 
 * 小程序中的 JavaScript 是由ECMAScript 以及小程序框架和小程序 API 来实现的。
 * 
 * 小程序目前可以运行在三大平台：
    iOS平台，包括iOS9、iOS10、iOS11
    Android平台
    小程序IDE
    这种区别主要是体现三大平台实现的 ECMAScript 的标准有所不同。
  截止到当前一共有七个版本的ECMAScript 标准，目前开发者大部分使用的是 ECMAScript 5 和 ECMAScript 6 的标准，但是在小程序中， iOS9和iOS10 所使用的运行环境并没有完全的兼容到 ECMAScript 6 标准，一些 ECMAScript 6 中规定的语法和关键字是没有的或者同标准是有所不同的，例如：箭头函数、let const、模板字符串…
  因此开发者需要在项目设置中，勾选 ES6 转 ES5 开启此功能，兼容旧版本

  模块化：小程序中可以将任何一个JavaScript 文件作为一个模块，通过module.exports 或者 exports 对外暴露接口。

  脚本的执行顺序：
    在小程序中的脚本执行顺序有所不同。小程序的执行的入口文件是 app.js 。并且会根据其中 require 的模块顺序决定文件的运行顺序
    当 app.js 执行结束后，小程序会按照开发者在 app.json 中定义的 pages 的顺序，逐一执行

  作用域：
    小程序的脚本的作用域同 NodeJS 更为相似。
    在文件中声明的变量和函数只在该文件中有效，不同的文件中可以声明相同名字的变量和函数，不会互相影响
    当需要使用全局变量的时，通过使用全局函数 getApp() 获取全局的实例，并设置相关属性值，来达到设置全局变量的目的（注意：当需要保证全局的数据可以在任何文件中安全的被使用到，那么可以在 App() 中进行设置）
 */
Page({

  /**
   * Page initial data
   */
  data: {
    time:(new Date()).toString(),
    a:10,
    array:[
      {message:"foo"},
      {message:"bar"}
    ],
    objectArray:[
      { id: 5,unique: "unique_5" },
      { id: 4, unique: "unique_4" },
      { id: 3, unique: "unique_3" },
      { id: 2, unique: "unique_2" },
      { id: 1, unique: "unique_1" },
      { id: 0, unique: "unique_0" },

    ],
    numberArray:[1,2,3,4],
    item:(
      {
        index: 0,
        msg: 'this is a template',
        time: '2019-01-11'
      }
    ),
    loading :false
  },

  switch:function(e) {
    const length = this.data.objectArray.length
    for(let i=0;i<length;++i){
      const x=Math.floor(Math.random()*length)
      const y = Math.floor(Math.random() * length)
      const temp = this.data.objectArray[x]
      this.data.objectArray[x] = this.data.objectArray[y]
      this.data.objectArray[y] = temp
    }

    this.setData({
      objectArray:this.data.objectArray
    })
  },

  addToFront:function(e) {
    const length = this.data.objectArray.length;
    this.data.objectArray = [{id:length,unique:'unique_' +length}].concat(this.data.objectArray)
    this.setData({
      objectArray : this.data.objectArray
    })
  },
  addNumberToFront:function(e){
    this.data.numberArray = [this.data.numberArray.length +1].concat(this.data.numberArray)
    this.setData({
      numberArray :this.data.numberArray
    })
  },
  tapName:function(e){
    console.log(e)
  },
  tap:function(e){
    this.setData({loading:true});
    //TODO 做其他耗时的事，然后恢复

    this.setData({ loading: false });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    // wx.showToast({
    //   title: '已加载',
    //   icon: 'success',
    //   duration: 1500
    // })

    wx.showModal({
      title: '标题',
      content: '练习模态通知',
      confirmText: '主操作',
      cancelText: '次要操作',
      success:function(res){
        if(res.confirm){
          console.log('用户点击主操作')
        }else if(res.cancel){
          console.log('用户点击次要操作')
        }
      }

    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    // 用户触发了下拉刷新操作
    console.log("用户触发了下拉刷新操作");
    // 拉取新数据重新渲染界面
    console.log("拉取新数据重新渲染界面");
    wx.stopPullDownRefresh() // 可以停止当前页面的下拉刷新。

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    console.log("当界面的下方距离页面底部距离小于100像素时触发回调")
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})