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

三、组件
一个小程序页面可以分解成多个部分组成，组件就是小程序页面的基本组成单元。为了让开发者可以快速进行开发，小程序的宿主环境提供了一系列基础组件。

组件是在WXML模板文件声明中使用的，WXML的语法和HTML语法相似，小程序使用标签名来引用一个组件，通常包含开始标签和结束标签，该标签的属性用来描述该组件。

需要注意，所有组件名和属性都是小写，多个单词会以英文横杠 "-" 进行连接。
对于一些容器组件，其内容可以声明在其开始标签和结束标签之间。

所有组件都拥有表3-7列举的属性，主要涉及样式和事件绑定.参考链接：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000eec0b998e80bb0086f092b5100a

关于组件介绍，可参考：https://mp.weixin.qq.com/debug/wxadoc/dev/component/

四、API
wx对象实际上就是小程序的宿主环境所提供的全局对象，几乎所有小程序的API都挂载在wx对象底下（除了Page/App等特殊的构造器）。

小程序提供的API按照功能主要分为几大类：网络、媒体、文件、数据缓存、位置、设备、界面、界面节点信息还有一些特殊的开放接口。

API一般调用的约定：
a.wx.on* 开头的 API 是监听某个事件发生的API接口，接受一个 Callback 函数作为参数。当该事件触发时，会调用 Callback 函数。
b.如未特殊约定，多数 API 接口为异步接口 ，都接受一个Object作为参数。
c.API的Object参数一般由success、fail、complete三个回调来接收接口调用结果
d.wx.get* 开头的API是获取宿主环境数据的接口。
e.wx.set* 开头的API是写入数据到宿主环境的接口。

例子，通过wx.request发起网络请求
  wx.request({
  url: 'test.php',
  data: {},
  header: { 'content-type': 'application/json' },
  success: function(res) {
  // 收到https服务成功后返回
  console.log(res.data)
  },
  fail: function() {
  // 发生网络错误等情况触发
  },
  complete: function() {
  // 成功或者失败后触发
  }
  })

开发者只要了解一般调用API的技巧，再通过官方API文档 https://mp.weixin.qq.com/debug/wxadoc/dev/api/了解到对应的API参数细节即可。

五、事件
1.什么是事件
UI界面的程序需要和用户互动，例如用户可能会点击你界面上某个按钮，又或者长按某个区域，这类反馈应该通知给开发者的逻辑层，需要将对应的处理状态呈现给用户。
有些时候程序上的“行为反馈”不一定是用户主动触发的，例如我们在视频video播放的过程中，播放进度是会一直变化的，这种反馈也应该通知给开发者做相应的逻辑处理。
在小程序里边，我们把这种“用户在渲染层的行为反馈”以及“组件的部分状态反馈”抽象为渲染层传递给逻辑层的“事件”。

2.事件类型和对象
参考表3-10 常见的事件类型和表3-11 事件对象属性，https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000846df9a03909b0086a50025180a

这里需要注意的是target和currentTarget的区别，currentTarget为当前事件所绑定的组件，而target则是触发该事件的源头组件。

组件的事件可以参考其参数说明，详情见官方文档 https://mp.weixin.qq.com/debug/wxadoc/dev/component/ 


3、【重点】事件绑定与冒泡捕获
A.事件绑定的写法和组件属性一致，以key="value"的形式，其中：
  key以bind或者catch开头，然后跟上事件的类型，如bindtap、catchtouchstart。自基础库版本1.5.0起，bind和catch后可以紧跟一个冒号，其含义不变，如bind:tap、catch:touchstart。同时bind和catch前还可以加上capture-来表示捕获阶段。
  value是一个字符串，需要在对应的页面Page构造器中定义同名的函数，否则触发事件时在控制台会有报错信息。
  
  bind和capture-bind的含义分别代表事件的冒泡阶段和捕获阶段



B.事件捕获和冒泡触发时序

以下示例中，点击 inner view 会先后调用handleTap1、handleTap2、handleTap3、handleTap4。

使用capture-前缀阻止事件的冒泡和捕获
<view id="outer" bind:tap="handleTap4" capture-bind:tap="handleTap1">
  outer view
  <view id="inner" bind:tap="handleTap3" capture-bind:tap="handleTap2">
    inner view
  </view>
</view>
bind事件绑定不会阻止冒泡事件向上冒泡，catch事件绑定可以阻止冒泡事件向上冒泡。如果将以上代码的capture-bind:tap="handleTap1"改成capture-catch:tap="handleTap1"，点击inner view只会触发handleTap1(catch事件阻止了tap事件冒泡)。

事件的冒泡和捕获
<view id="outer" bind:tap="handleTap4" capture-catch:tap="handleTap1">
  outer view
  <view id="inner" bind:tap="handleTap3" capture-bind:tap="handleTap2">
    inner view
  </view>
</view>

注意，除表3-10列举的事件类型之外的其他组件自定义事件，如无特殊声明都是非冒泡事件，如<form/>的submit事件，<input/>的input事件，<scroll-view/>的scroll事件。

六、兼容
小程序的宿主环境一直在迭代更新，提供更多的能力给开发者去完成更多的事情，所以你的小程序会运行在不同版本的宿主环境下。为了让你的小程序在不同环境下都能提供相应的服务，我们需要来了解一下在小程序中如何实现兼容办法。

我们可能需要针对不同手机进行程序上的兼容，此时可以使用 wx.getSystemInfo 或者 wx.getSystemInfoSync 来获取手机品牌、操作系统版本号、微信版本号以及小程序基础库版本号等，通过这个信息，我们可以针对不同平台做差异化的服务。

1.可以通过判断此API是否存在来做程序上的兼容。
例子，通过判断API是否存在做兼容
if (wx.openBluetoothAdapter) {
  wx.openBluetoothAdapter()
} else {
  // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
  })
}

2.小程序还提供了wx.canIUse这个API，用于判断接口或者组件在当前宿主环境是否可用，其参数格式为: ${API}.${method}.${param}.${options}或者${component}.${attribute}.${option}

各个段的含义如下：

${API} 代表 API 名字
${method} 代表调用方式，有效值为return, success, object, callback
${param} 代表参数或者返回值
${options} 代表参数的可选值
${component} 代表组件名字
${attribute} 代表组件属性
${option} 代表组件属性的可选值
调用的示例代码如下。

wx.canIUse调用示例
// 判断接口及其参数在宿主环境是否可用
wx.canIUse('openBluetoothAdapter')
wx.canIUse('getSystemInfoSync.return.screenWidth')
wx.canIUse('getSystemInfo.success.screenWidth')
wx.canIUse('showToast.object.image')
wx.canIUse('onCompassChange.callback.direction')
wx.canIUse('request.object.method.GET')

 // 判断组件及其属性在宿主环境是否可用
wx.canIUse('contact-button')
wx.canIUse('text.selectable')
wx.canIUse('button.open-type.contact')

3.强制升级
我们可以选择合适的判断方法来做小程序的向前兼容，以保证我们的小程序在旧版本的微信客户端也能工作正常。在不得已的情况下（小程序强依赖某个新的API或者组件时），还可以通过在小程序管理后台设置“基础库最低版本设置”来达到不向前兼容的目的。例如你选择设置你的小程序只支持1.5.0版本以上的宿主环境，那么当运行着1.4.0版本宿主环境的微信用户打开你的小程序的时候，微信客户端会显示当前小程序不可用，并且提示用户应该去升级微信客户端。


#CH4 场景应用
一、布局方法
flex

二、界面交互
1.触摸反馈
hover-class样式或者loading属性

参考：代码清单4-2 设置button的loading属性
https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000224fc9d0f98cb0086f4eff5180a


2.Toast
显示/隐藏Toast
Page({

  onLoad: function() {

    wx.showToast({ // 显示Toast

      title: '已发送',

      icon: 'success',

      duration: 1500

    })

    // wx.hideToast() // 隐藏Toast

  }
})

注意：不应该把Toast用于错误提示，因为错误提示需要明确告知用户具体原因，因此不适合用这种一闪而过的Toast弹出式提示

3.模态对话框
一般需要用户明确知晓操作结果状态的话，会使用模态对话框来提示，同时附带下一步操作的指引。
Page({

  onLoad: function() {
    wx.showModal({
      title: '标题',

      content: '告知当前状态，信息和解决方法',

      confirmText: '主操作',

      cancelText: '次要操作',

      success: function(res) {

        if (res.confirm) {

          console.log('用户点击主操作')

        } else if (res.cancel) {

          console.log('用户点击次要操作')

        }
      }
    })
  }
})

三、发起https网络请求
参考：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000ee27c9c8d98ab0086788fa5b00a

需要留意的是url是有长度限制的，其最大长度是1024字节，同时url上的参数需要拼接到字符串里，参数的值还需要做一次urlEncode。向服务端发送的数据超过1024字节时，就要采用HTTPPOST的形式，此时传递的数据就必须要使用data参数，基于这个情况，一般建议需要传递数据时，使用data参数来传递。


防止重复提交
参考：https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000ee27c9c8d98ab0086788fa5b00a
【2. 请求前后的状态处理】
wx.request常见的示例代码

var hasClick = false;

Page({
  tap: function() {
    if (hasClick) {
      return
    }

    hasClick = true
    wx.showLoading()

    wx.request({
      url: 'https://test.com/getinfo',
      method: 'POST',
      header: { 'content-type':'application/json' },
      data: { },

      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
        }
      },

      fail: function (res) {
        wx.showToast({ title: '系统错误' })
      },

      complete: function (res) {
        wx.hideLoading()
        hasClick = false
      }
    })
  }
})

一定要设置超时
"networkTimeout": {
    "request": 3000
}

如何排查网络请求异常？
  检查手机网络状态以及wifi连接点是否工作正常。
  检查小程序是否为开发版或者体验版，因为开发版和体验版的小程序不会校验域名。
  检查对应请求的HTTPS证书是否有效，同时TLS的版本必须支持1.2及以上版本，可以在开发者工具的console面板输入showRequestInfo()查看相关信息。
  域名不要使用IP地址或者localhost，并且不能带端口号，同时域名需要经过ICP备案。
  检查app.json配置的超时时间配置是否太短，超时时间太短会导致还没收到回报就触发fail回调。
  检查发出去的请求是否302到其他域名的接口，这种302的情况会被视为请求别的域名接口导致无法发起请求。


四、微信登录
1.获取临时身份认证code——安全角度考虑
为了避免黑客轮询的风险，wx.login是生成一个带有时效性的凭证，就像是一个会过期的临时身份证一样，在wx.login调用时，会先在微信后台生成一张临时的身份证，其有效时间仅为5分钟。然后把这个临时身份证返回给小程序方，这个临时的身份证我们把它称为微信登录凭证code。
由于这个临时身份证5分钟后会过期，如果黑客要冒充一个用户的话，那他就必须在5分钟内穷举所有的身份证id，然后去开发者服务器换取真实的用户身份。显然，黑客要付出非常大的成本才能获取到一个用户信息，同时，开发者服务器也可以通过一些技术手段检测到5分钟内频繁从某个ip发送过来的登录请求，从而拒绝掉这些请求。

2.通过wx.request发送code到开发者服务器(使用https协议)
A.使用code获取微信id（要同时带上AppId和AppSecret,在小程序管理平台的开发设置界面可以看到）
B.绑定维信id和业务id（有了这个绑定信息，小程序在下次需要用户登录的时候就可以不需要输入账号密码，因为通过wx.login获取到code之后，可以拿到用户的微信身份openid，通过绑定信息就可以查出业务侧的用户身份id，这样静默授权的登录方式显得非常便捷。）
C.返回sessionid

微信服务器提供的接口地址是：https://api.weixin.qq.com/sns/jscode2session?appid=<AppId>&secret=<AppSecret>&js_code=<code>&grant_type=authorization_code



五、本地数据缓存
1.缓存的用途
本地数据缓存是小程序存储在当前设备上硬盘上的数据，本地数据缓存有非常多的用途，
  我们可以利用本地数据缓存来存储用户在小程序上产生的操作，在用户关闭小程序重新打开时可以恢复之前的状态。
  我们还可以利用本地缓存一些服务端非实时的数据提高小程序获取数据的速度，在特定的场景下可以提高页面的渲染速度，减少用户的等待时间。

2.读写本地数据缓存
通过wx.getStorage/wx.getStorageSync读取本地缓存
通过wx.setStorage/wx.setStorageSync写数据到缓存，

其中Sync后缀的接口表示是同步接口

3.缓存限制和隔离
小程序宿主环境会管理不同小程序的数据缓存。

小程序宿主环境会管理不同小程序的数据缓存，不同小程序的本地缓存空间是分开的，每个小程序的缓存空间上限为10MB，如果当前缓存已经达到10MB，再通过wx.setStorage写入缓存会触发fail回调。


考虑到同一个设备可以登录不同微信用户，宿主环境还对不同用户的缓存进行了隔离，避免用户间的数据隐私泄露。

用户的关键信息不建议只存在本地缓存，应该把数据放到服务器端进行持久化存储。

4.使用案例：
a.利用本地缓存提前渲染界面。

注意：
时效性高的不建议使用。
对数据实时性/一致性要求不高的页面采用这个方法来做提前渲染，用以优化小程序体验。

b.利用本地缓存持久存储用户登录态SessionId
https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000a2c7c9f4a981b0086bd31e5b40a
代码清单4-17 


六、设备能力
微信扫码（点餐等）
获取网络状态（下载前验证）
