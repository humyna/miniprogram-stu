# CH3.小程序宿主环境

一. 渲染层和逻辑层
小程序的运行环境分成渲染层和逻辑层。
WXML 模板和 WXSS 样式工作在渲染层；
JS 脚本工作在逻辑层。

a.渲染层和数据相关。 -数据驱动
b.逻辑层负责产生、处理数据。
c.逻辑层通过 Page 实例的 setData 方法传递数据到渲染层。 -通信模型

1、通信模型
小程序的渲染层和逻辑层分别由2个线程管理：渲染层的界面使用了WebView 进行渲染；逻辑层采用JsCore线程运行JS脚本。一个小程序存在多个界面，所以渲染层存在多个WebView线程，这两个线程的通信会经由微信客户端（下文中也会采用Native来代指微信客户端）做中转，逻辑层发送网络请求也经由Native转发

通信模型图见：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0000286f908988db00866b85f5640a

2、数据驱动
在开发UI界面过程中，程序需要维护很多变量状态，同时要操作对应的UI元素。随着界面越来越复杂，我们需要维护很多变量状态，同时要处理很多界面上的交互事件，整个程序变得越来越复杂。通常界面视图和变量状态是相关联的，如果有某种“方法”可以让状态和视图绑定在一起（状态变更时，视图也能自动变更），那我们就可以省去手动修改视图的工作。
这个方法就是“数据驱动”。

小程序的数据驱动的原理：
WXML结构实际上等价于一棵Dom树，通过一个JS对象也可以来表达Dom树的结构。
WXML可以先转成JS对象，然后再渲染出真正的Dom树。

通过setData把msg数据从“Hello World”变成“Goodbye”，产生的JS对象对应的节点就会发生变化，此时可以对比前后两个JS对象得到变化的部分，然后把这个差异应用到原来的Dom树上，从而达到更新UI的目的，这就是“数据驱动”的原理。

数据驱动示例图参考：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0000286f908988db00866b85f5640a

3、双线程下的界面渲染
小程序的逻辑层和渲染层是分开的两个线程。在渲染层，宿主环境会把WXML转化成对应的JS对象，在逻辑层发生数据变更的时候，我们需要通过【宿主环境提供的setData方法】把数据从逻辑层传递到渲染层，再经过对比前后差异，把差异应用在原来的Dom树上，渲染出正确的UI界面。

示例图参考：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0000286f908988db00866b85f5640a

二、程序与页面
从逻辑组成来说，一个小程序是由多个“页面”组成的“程序”。
我们需要在“程序”启动或者退出的时候存储数据或者在“页面”显示或者隐藏的时候做一些逻辑处理，了解程序和页面的概念以及它们的生命周期是非常重要的。

1.程序
A.程序构造器App()
宿主环境提供了 App() 构造器用来注册一个程序App，需要留意的是App() 构造器必须写在项目根目录的app.js里，App实例是单例对象，在其他JS脚本中可以使用宿主环境提供的 getApp() 来获取程序实例。


App({
  onLaunch: function(options) {},
  onShow: function(options) {},
  onHide: function() {},
  onError: function(msg) {},
  globalData: 'I am global data'
})
App构造器接受一个Object参数
onLaunch / onShow / onHide 三个回调是App实例的生命周期函数


B.程序的生命周期
初次进入小程序的时候，微信客户端初始化好宿主环境，同时从网络下载或者从本地缓存中拿到小程序的代码包，把它注入到宿主环境，初始化完毕后，微信客户端就会给App实例派发onLaunch事件，App构造器参数所定义的onLaunch方法会被调用。
进入小程序之后，用户可以点击左上角的关闭，或者按手机设备的Home键离开小程序，此时小程序并没有被直接销毁，我们把这种情况称为“小程序进入后台状态”，App构造器参数所定义的onHide方法会被调用。
当再次回到微信或者再次打开小程序时，微信客户端会把“后台”的小程序唤醒，我们把这种情况称为“小程序进入前台状态”，App构造器参数所定义的onShow方法会被调用。
我们可以看到，App的生命周期是由微信客户端根据用户操作主动触发的。
注意：为了避免程序上的混乱，我们不应该从其他代码里主动调用App实例的生命周期函数。

C.程序的打开场景
在微信客户端中打开小程序有很多途径：从群聊会话里打开，从小程序列表中打开，通过微信扫一扫二维码打开，从另外一个小程序打开当前小程序等，针对不同途径的打开方式，小程序有时需要做不同的业务处理，所以微信客户端会把打开方式带给onLaunch和onShow的调用参数options。

注意：小程序的宿主环境在迭代更新过程会增加不少打开场景，因此要获取最新的场景值说明请查看官方文档：https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/app.html。


D.小程序的全局数据
不同页面直接可以通过App实例下的属性来共享数据。
App构造器可以传递其他参数作为全局属性以达到全局共享数据的目的。

注意：所有页面的脚本逻辑都跑在同一个JsCore线程，页面使用setTimeout或者setInterval的定时器，然后跳转到其他页面时，这些定时器并没有被清除，需要开发者自己在页面离开的时候进行清理。

2.页面
A.文件构成和路径
一个页面是分三部分组成：界面、配置和逻辑。
界面由WXML文件和WXSS文件来负责描述，配置由JSON文件进行描述，页面逻辑则是由JS脚本文件负责。一个页面的文件需要放置在同一个目录下，其中WXML文件和JS文件是必须存在的，JSON和WXSS文件是可选的。

页面路径需要在小程序代码根目录app.json中的pages字段声明，否则这个页面不会被注册到宿主环境中。在app.json的pages字段的代码路径需要去除.后缀

B.页面构造器Page()
宿主环境提供了 Page() 构造器用来注册一个小程序页面，Page()在页面脚本page.js中调用.

Page构造器
Page({
  data: { text: "This is page data." },
  onLoad: function(options) { },
  onReady: function() { },
  onShow: function() { },
  onHide: function() { },
  onUnload: function() { },
  onPullDownRefresh: function() { },
  onReachBottom: function() { },
  onShareAppMessage: function () { },
  onPageScroll: function() { }
})

Page构造器接受一个Object参数
data属性是当前页面WXML模板中可以用来做数据绑定的初始数据
onLoad / onReady / onShow / onHide /onUnload 5个回调是Page实例的生命周期函数
onPullDownRefresh / onReachBottom / onShareAppMessage / onPageScroll 4个回调是页面的用户行为

C.页面的生命周期
页面初次加载的时候，微信客户端就会给Page实例派发onLoad事件，Page构造器参数所定义的onLoad方法会被调用，onLoad在页面没被销毁之前只会触发1次，在onLoad的回调中，可以获取当前页面所调用的打开参数option.
页面显示之后，Page构造器参数所定义的onShow方法会被调用，一般从别的页面返回到当前页面时，当前页的onShow方法都会被调用。
在页面初次渲染完成时，Page构造器参数所定义的onReady方法会被调用，onReady在页面没被销毁前只会触发1次，onReady触发时，表示页面已经准备妥当，在逻辑层就可以和视图层进行交互了。
以上三个事件触发的时机是onLoad早于 onShow，onShow早于onReady。

页面不可见时，Page构造器参数所定义的onHide方法会被调用，这种情况会在使用wx.navigateTo切换到其他页面、底部tab切换时触发。
当前页面使用wx.redirectTo或wx.navigateBack返回到其他页时，当前页面会被微信客户端销毁回收，此时Page构造器参数所定义的onUnload方法会被调用。
注意：Page的生命周期是由微信客户端根据用户操作主动触发的。为了避免程序上的混乱，我们不应该在其他代码中主动调用Page实例的生命周期函数。

D.页面的参数传递（重要）
让我们来设想这样一个场景，我们实现一个购物商城的小程序，我们需要完成一个商品列表页和商品详情页，点击商品列表页的商品就可以跳转到该商品的详情页，当然我们不可能为每个商品单独去实现它的详情页。我们只需要实现一个商品详情页的pages/detail/detail.(代表WXML/WXSS/JS/JSON文件)即可，在列表页打开商品详情页时把商品的id传递过来，详情页通过刚刚说的onLoad回调的参数option就可以拿到商品id，从而绘制出对应的商品，代码如下所示。

页面的打开参数Page构造器
// pages/list/list.js
// 列表页使用navigateTo跳转到详情页
wx.navigateTo({ url: 'pages/detail/detail?id=1&other=abc' })

// pages/detail/detail.js
Page({
  onLoad: function(option) {
        console.log(option.id)
        console.log(option.other)
  }
})

小程序把页面的打开路径定义成页面URL，其组成格式和网页的URL类似，在页面路径后使用英文 ? 分隔path和query部分，query部分的多个参数使用 & 进行分隔，参数的名字和值使用 key=value 的形式声明。在页面Page构造器里onLoad的option可以拿到当前页面的打开参数，其类型是一个Object，其键值对与页面URL上query键值对一一对应。

注意：和网页URL一样，页面URL上的value如果涉及特殊字符（例如：&字符、?字符、中文字符等，详情参考URI的RFC3986说明 ），需要采用UrlEncode后再拼接到页面URL上。

E.页面的数据
初始化页面数据：来自于页面Page构造器的data字段，data参数是页面第一次渲染时从逻辑层传递到渲染层的数据。

更新页面数据：宿主环境所提供的Page实例的原型中有setData函数，我们可以在Page实例下的方法调用this.setData把数据传递给渲染层，从而达到更新界面的目的。（异步过程）

setData其一般调用格式是 setData(data, callback)，其中data是由多个key: value构成的Object对象。
data中的key还可以非常灵活，以数据路径的形式给出，例如 this.setData({"d[0]": 100}); this.setData({"d[1].text": 'Goodbye'}); 

页面更新的性能技巧：只要保持一个原则就可以提高小程序的渲染性能——每次只设置需要改变的最小单位数据。

使用setData更新渲染层数据
// page.js
Page({
  data: {
    a: 1, b: 2, c: 3,
    d: [1, {text: 'Hello'}, 3, 4]
  }
  onLoad: function(){
       // a需要变化时，只需要setData设置a字段即可
    this.setData({a : 2})
  }
})

注意：
a.直接修改 Page实例的this.data 而不调用 this.setData 是无法改变页面的状态的，还会造成数据不一致。
b.由于setData是需要两个线程的一些通信消耗，为了提高性能，每次设置的数据不应超过1024kB。
c.不要把data中的任意一项的value设为undefined，否则可能会有引起一些不可预料的bug。

F.页面的用户行为（触发事件）
小程序宿主环境提供了四个和页面相关的用户行为回调：
a.下拉刷新 onPullDownRefresh
监听用户下拉刷新事件，需要在app.json的window选项中或页面配置page.json中设置enablePullDownRefresh为true。当处理完数据刷新后，wx.stopPullDownRefresh可以停止当前页面的下拉刷新。
b.上拉触底 onReachBottom
监听用户上拉触底事件。可以在app.json的window选项中或页面配置page.json中设置触发距离onReachBottomDistance。在触发距离内滑动期间，本事件只会被触发一次。
c.页面滚动 onPageScroll
监听用户滑动页面事件，参数为 Object，包含 scrollTop 字段，表示页面在垂直方向已滚动的距离（单位px）。
d.用户转发 onShareAppMessage
只有定义了此事件处理函数，右上角菜单才会显示“转发”按钮，在用户点击转发按钮的时候会调用，此事件需要return一个Object，包含title和path两个字段，用于自定义转发内容

G.页面的跳转与路由
一个小程序拥有多个页面，我们可以通过wx.navigateTo推入一个新的页面，在首页使用2次wx.navigateTo后，页面层级会有三层，我们把这样的一个页面层级称为页面栈。

小程序宿主环境限制了这个页面栈的最大层级为10层。

我们采用这样的方式进行描述页面栈：[ pageA, pageB, pageC ]，其中pageA在最底下，pageC在最顶上，也就是用户所看到的界面。
使用 wx.navigateTo({ url: 'pageD' }) 可以往当前页面栈多推入一个 pageD，此时页面栈变成 [ pageA, pageB, pageC, pageD ]。
使用 wx.navigateBack() 可以退出当前页面栈的最顶上页面，此时页面栈变成 [ pageA, pageB, pageC ]。
使用wx.redirectTo({ url: 'pageE' }) 是替换当前页变成pageE，此时页面栈变成 [ pageA, pageB, pageE ]，当页面栈到达10层没法再新增的时候，往往就是使用redirectTo这个API进行页面跳转。


小程序提供了原生的Tabbar支持，我们可以在app.json声明tabBar字段来定义Tabbar页。
app.json定义小程序底部tab
{
  "tabBar": {
    "list": [
      { "text": "Tab1", "pagePath": "pageA" },
      { "text": "Tab1", "pagePath": "pageF" },
      { "text": "Tab1", "pagePath": "pageG" }
    ]
  }
}
在刚刚的例子所在的页面栈中使用wx.switchTab({ url: 'pageF' })，此时原来的页面栈会被清空（除了已经声明为Tabbar页pageA外其他页面会被销毁），然后会切到pageF所在的tab页面，页面栈变成 [ pageF ]，此时点击Tab1切回到pageA时，pageA不会再触发onLoad，因为pageA没有被销毁。
补充一下，wx.navigateTo和wx.redirectTo只能打开非TabBar页面，wx.switchTab只能打开Tabbar页面。

我们还可以使用 wx. reLaunch({ url: 'pageH' }) 重启小程序，并且打开pageH，此时页面栈为 [ pageH ]。


下面链接中 https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0004eec99acc808b00861a5bd5280a 查看
表3-5 页面路由触发方式及页面生命周期函数的对应关系
表3-6 页面路由触发方式及页面生命周期函数的对应关系（tap页面）