// IM 客户端实例对象
let imClient;

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

  RongIMLib.RongIMClient.init(appkey, null, {
    navi: Config.navi || null,
    logLevel: 1
  });
  imClient = RongIMLib.RongIMClient.getInstance();
  
  e.nextElementSibling.style.color = '#09f';
};

/**
 * 设置 IM 监听
 * @param {HTMLElement} e 绑定事件的元素对象
 */
const setIMListener = (e) => {
  if (!imClient) {
    alert('请先初始化 IM');
    return;
  }

  /**
   * 设置连接状态监听
   */
  var params = {
    onChanged: function (status) {
      // status 标识当前连接状态
      console.log('连接状态: ', status)
    }
  };
  RongIMClient.setConnectionStatusListener(params);

  /**
   * 设置消息监听
   */
  var params = {
    // 接收到的消息
    onReceived: function (message) {
      console.info(message);
    }
  };
  RongIMClient.setOnReceiveMessageListener(params);

  e.nextElementSibling.style.color = '#09f';
};

/**
 * 连接 IM
 */
const connectIM = () => {
  if (!imClient) {
    alert('请先初始化 IM');
    return;
  }

  const token = document.getElementById('token').value;
  if (!token) {
    alert('请输入 token');
    return;
  }

  RongIMClient.connect(token, {
    onSuccess: function(userId) {
      console.log('连接成功, 用户 ID 为: ', userId);
      isConnected = true;
      document.querySelector('.boundary-line').style.color = '#09f';
    },
    onTokenIncorrect: function() {
      console.log('连接失败, 失败原因: token 无效');
    },
    onError: function(errorCode) {
      console.log('连接失败, 失败原因: ', errorCode);
      alert(`连接失败: ${errorCode}`);
    }
  });
}
