// RTC 客户端实例对象
let rtcClient;

// Room 实例
let crtRoom;

// 加入房间后返回的远端资源
let remoteTracks = [];

/**
 * 初始化 rtcClient
 */
const initRTCClient = (e) => {
  if (!imClient || !isConnected) {
    alert('请确保已经初始化完 IM 、并已连接成功');
    return;
  }
	rtcClient = imClient.install(window.RCRTC.installer, {
		mediaServer: Config.mediaServer || undefined,
		timeout: 30 * 1000,
		logLevel: window.RCEngine.LogLevel.DEBUG
	});

  e.nextElementSibling.style.color = '#09f';
};

/**
 * 设置 RTC 监听、订阅远端资源
 */
const initRTCListener = (e) => {
  if (!crtRoom) {
    alert('请加入房间后再设置 Room 监听');
    return;
  }
  // 注册 peerConnection 上报监听
	registerPeerReportListener();
  // 注册房间人员、资源变化监听
	registerRoomListener();
  
  /**
   * 订阅远端资源
   */
  remoteTracks.length && appendVideoEl(remoteTracks);
  remoteTracks.length && subscribe(remoteTracks);

  e.nextElementSibling.style.color = '#09f';
};

/**
 * 注册 peerConnection 上报监听
 */
const registerPeerReportListener = () => {
	crtRoom.registerReportListener({
		onICEConnectionStateChange(state) {
			console.log('onICEConnectionStateChange:', state);
		},
		onConnectionStateChange(state) {
			console.log('onConnectionStateChange:', state);
		},
    // 音视频质量数据监听
		onStateReport(reports) {
			console.log(`质量数据: `, reports);
		}
	});
};

/**
 * 注册房间人员、资源变化监听
 */
const registerRoomListener = () => {
  crtRoom.registerRoomEventListener({
    /**
     * 本端被踢出房间时触发
     */
		onKickOff(byServer) {
			console.log('onKickedByServer', byServer);
		},
		/**
		 * 远端发布资源时触发，此时可订阅远端资源
		 * @param tracks
		 */
		onTrackPublish(tracks) {
			console.log('onTrackPublish:', JSON.stringify(tracks));
      appendVideoEl(tracks);
			subscribe(tracks);
		},
		/**
		 * track 可播放
		 */
		onTrackReady(track) {
			playTrack(track, true);
		},
    /**
     * 房间有其他人员加入时触发
     */
		onUserJoin(userIds) {
			console.log('onUserJoined', JSON.stringify(userIds));
		},
    /**
     * 房间内其他人员退出时触发
     */
		onUserLeave(userIds) {
			console.log('onUserLeft', JSON.stringify(userIds));
			userIds.forEach((userId) => {
				document.querySelectorAll(`.video-wrap-${userId}`).forEach((el) => {
          el.remove();
        });
			});
		}
	});
}

/**
 * 加入房间
 * @param {HTMLElement} e 绑定事件的元素对象
 */
const joinRoom = async (e) => {
  if (!rtcClient) {
    alert('请先初始化 RTC，再加入房间');
    return;
  }

  const roomId = document.getElementById('roomId').value;
  if (!roomId) {
    alert('请输入房间号');
    return;
  }

  if (!(/^[0-9A-Za-z+=\-_]{1,64}$/.test(roomId))) {
    alert('房间号长度不能超过64,可包含: A-Z、a-z、0-9、+、=、-、_');
    return;
  }

  // tracks 为房间内的远端资源，可直接订阅
	const { code, room, tracks } = await rtcClient.joinRTCRoom(roomId);

  if (code !== RCRTC.RCRTCCode.SUCCESS) {
    alert(`加入房间失败: ${code}`);
    return;
  }

	crtRoom = room;
  tracks.length && (remoteTracks = tracks);

  e.nextElementSibling.style.color = '#09f';
  document.querySelector('.rejoin-line').style.color = '#fff';
  document.querySelector('#roomId').nextElementSibling.style.color = '#09f';
};

/**
 * 离开房间
 */
const leaveRoom = async () => {
  if (!rtcClient || !crtRoom) {
    alert('请确保已经初始化完 RTC，并已加入房间');
    return;
  }
	await rtcClient.leaveRoom(crtRoom);

  resetLeaveStyle();
  removeVideoEl();
	crtRoom = null;
};

/**
 * 发布摄像头、麦克风资源
 */
const publishMicrophoneCamera = async (e) => {
  if (!rtcClient || !crtRoom) {
    alert('请确保已经初始化完 RTC，并已加入房间');
    return;
  }

  // 获取摄像头、麦克风资源
  const { code, tracks } = await rtcClient.createMicrophoneAndCameraTracks();
  if (code !== RCRTC.RCRTCCode.SUCCESS) {
    alert(`获取资源失败: ${code}`);
    return;
  }

  // 发布
	const pubRes = await publish(tracks);
  if (pubRes) {
    e.disabled = true
  }
};

/**
 * 发布屏幕共享资源
 */
const publishScreenShare = async (e) => {
  if (!rtcClient || !crtRoom) {
    alert('请确保已经初始化完 RTC，并已加入房间');
    return;
  }

  // 获取屏幕共享资源
  const { code, track } = await rtcClient.createScreenVideoTrack();
  if (code !== RCRTC.RCRTCCode.SUCCESS) {
    alert(`获取资源失败: ${code}`);
    return;
  }

  // 发布
	const pubRes = await publish([track]);
  if (pubRes) {
    e.disabled = true
  }
};

/**
 * 发布资源
 * @param {window.RCRTC.RCLocalTrack[]} tracks 获取资源返回的 tracks
 */
const publish = async (localTracks) => {
  if (!localTracks.length) {
    return;
  }
  const { code } = await crtRoom.publish(localTracks);

	if (code === RCRTC.RCRTCCode.SUCCESS) {
    /**
     * 播放资源
     */
    appendVideoEl(localTracks);
    localTracks.forEach((track) => {
      playTrack(track, false);
    });

    document.querySelector('.pubnext').style.color = '#09f';
    return code;
  } else {
    alert(`发布资源失败: ${code}`);
  }
};

/**
 * 订阅远端资源
 */
const subscribe = async (remoteTracks) => {
	const { code } = await crtRoom.subscribe(remoteTracks);

	if (code !== RCRTC.RCRTCCode.SUCCESS) {
    alert(`订阅远端资源失败: ${code}`);
  }
};

/**
 * 播放资源
 * @param {window.RCRTC.RCTrack} track 音轨、视轨
 * @param {boolean} playAudio 是否播放音频，(本端发布的音频静音，值为 false)
 * @returns 
 */
const playTrack = (track, playAudio) => {
  // 播放视频
	if (track.isVideoTrack()) {
		const node = document.getElementById('rc-video-' + track.getTrackId());
		track.play(node);
		return;
	}

  // 播放音频
	if (playAudio) {
		track.play();
	}
};

/**
 * 往页面中插入 video 元素
 * @param {window.RCRTC.RCTrack[]} tracks 
 */
const appendVideoEl = (tracks) => {
  tracks.forEach((track) => {
    if (track.isVideoTrack()) {
      const node = document.createElement('div');
      const tempHtml = `<span class="res-tag">${track.getTrackId()}</span>
                        <video id="rc-video-${track.getTrackId()}"></video>`;
      node.innerHTML = tempHtml;
      const { userId } = window.RCRTC.helper.parseTrackId(track.getTrackId());
      node.classList = `video-wrap video-wrap-${userId}`;
      document.getElementById('rong-video-box').appendChild(node);
    }
  });
};

/**
 * 处理离开房间后流程线的样式
 */
const resetLeaveStyle = () => {
  document.querySelector('.rejoin-line').style.color = '#09f';
  document.querySelectorAll('.leave-repeat-line').forEach((el) => {
    el.style.color = '#fff';
  });
  document.querySelectorAll('.rong-input-pub').forEach((el) => {
    el.disabled = false;
  });
};

/**
 * 离开房间后，清除所有 video 标签
 */
const removeVideoEl = () => {
  const videoWrapEl = document.getElementById('rong-video-box');
  videoWrapEl.innerHTML = '';
};
