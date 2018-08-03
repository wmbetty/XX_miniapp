# XX_miniapp
小程序前端问题集：
1.小程序自带底部tab栏不支持自定义样式怎么办？
   可以不用自带的tab栏，通过导航的形式自定义和配置tab。
   优点：自定义样式和皮肤，灵活多变
   缺点：体验不如自带的流畅，切换页面和图标会有闪烁
   参考实例：微信小程序自定义tabBar组件开发(https://blog.csdn.net/qq_29729735/article/details/78933721)
2.当页面有textarea文本输入框，又需要弹窗时，如何解决textarea层级最高的问题?
   显示弹窗时隐藏textarea (wx:if 或 hidden,看需要取舍)
3.ios中，textarea聚焦容易将自带标题栏顶下来，如何处理？
    textarea有个adjust-position (键盘弹起时，是否自动上推页面)属性，前端判断如果是iOS就将此属性设为false，适当调节页面高度保证键盘不盖住输入框；安卓手机可将此属性设为true，再加上cursor-spacing(指定光标与键盘的距离，单位 px 。取 textarea 距离底部的距离和 cursor-spacing 指定的距离的最小值作为光标与键盘的距离), 可保证页面流畅性。
    (关于textarea文本输入详见官方文档：小程序textarea组件 https://developers.weixin.qq.com/miniprogram/dev/component/textarea.html)
