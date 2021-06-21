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

  imClient = RongIMLib.init({
    appkey,
    navigators: Config.navi ? [Config.navi] : undefined,
    logLevel: 1
  });
  
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

  imClient.watch({
    // 监听消息通知
		message(message) {
			console.log('receive message =>', message);
		},
    // 监听 IM 连接状态变化
		status(evt) {
			console.log('connection status change:', evt.status);
		}
  });
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

  imClient.connect({ token }).then((user) => {
			console.log('connect success', user.id);
      isConnected = true;
      document.querySelector('.boundary-line').style.color = '#09f';
		})
		.catch((error) => {
			alert(`连接失败: ${error}`);
		});
}
