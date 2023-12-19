// IM 是否被初始化
let isInitIM = false;

// IM 是否连接成功
let isConnected = false;

/**
 * 初始化 IM
 * @param {HTMLElement} e 绑定事件的元素对象
 */
const initIM = (e) => {
  const appkey = document.getElementById('appkey').value;
  if (!appkey) {
    alert('请输入 appkey');
    return;
  }

  RongIMLib.init({
    appkey,
    navigators: Config.navi ? [Config.navi] : undefined,
    logLevel: 1
  });

  isInitIM = true;
  
  e.nextElementSibling.style.color = '#09f';
};

/**
 * 设置 IM 监听
 * @param {HTMLElement} e 绑定事件的元素对象
 */
const setIMListener = (e) => {
  if (!isInitIM) {
    alert('请先初始化 IM');
    return;
  }

  /**
   * 监听消息通知
   */
  const Events = RongIMLib.Events;
  RongIMLib.addEventListener(Events.MESSAGES, (event) => {
    console.log('received messages', event.messages);
  });

  /**
   * 监听 IM 连接状态变化
   */
  RongIMLib.addEventListener(Events.CONNECTING, () => {
    console.log('onConnecting');
  });
  RongIMLib.addEventListener(Events.CONNECTED, () => {
    console.log('onConnected');
  });
  RongIMLib.addEventListener(Events.DISCONNECT, (code) => {
    console.log('onDisconnect:', code);
  });
  RongIMLib.addEventListener(Events.SUSPEND, (code) => {
    console.log('onSuspend:', code);
  });

  e.nextElementSibling.style.color = '#09f';
};

/**
 * 连接 IM
 */
const connectIM = () => {
  if (!isInitIM) {
    alert('请先初始化 IM');
    return;
  }

  const token = document.getElementById('token').value;
  if (!token) {
    alert('请输入 token');
    return;
  }

  RongIMLib.connect(token).then((res) => {
    if (res.code !== RongIMLib.ErrorCode.SUCCESS) {
      console.error('connect failed:', res.code);
      return;
		}

    console.log('connect success:', res.data.userId);
    isConnected = true;
    document.querySelector('.boundary-line').style.color = '#09f';
  });
}
