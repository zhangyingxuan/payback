const VISUAL_FILE_TYPES = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';
export const VISUAL_FILE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';
export const VISUAL_LABEL_SUFFIX = /\n\n【附件】(?:图片|视频抽帧) · [^\n]+$/;

export interface VisualAttachment {
  label: string;
  image: string;
}

function waitForVideo(video: HTMLVideoElement, event: string, start: () => void) {
  return new Promise<void>((resolve, reject) => {
    // 即使浏览器未派发解码错误，也要解除等待并释放本地视频地址。
    const finish = (error?: string) => {
      clearTimeout(timer);
      video.onloadeddata = video.onseeked = video.onerror = null;
      if (error) reject(new Error(error));
      else resolve();
    };
    const timer = setTimeout(() => finish('读取视频超时'), 10000);
    video.onerror = () => finish('浏览器无法解码此视频');
    if (event === 'loadeddata') video.onloadeddata = () => finish();
    else video.onseeked = () => finish();
    try {
      start();
    } catch {
      finish('读取视频失败');
    }
  });
}

export async function readVisualFile(file: File): Promise<VisualAttachment> {
  // 部分系统仅提供扩展名，最终仍由浏览器解码确认文件内容。
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const knownType = VISUAL_FILE_TYPES.split(',').includes(file.type);
  if (!knownType && !VISUAL_FILE_EXTENSIONS.split(',').includes(extension)) {
    throw new Error('不支持此附件格式');
  }
  const isVideo = knownType ? file.type.startsWith('video/') : /\.(mp4|webm|mov)$/.test(extension);
  const maxMiB = isVideo ? 100 : 20;
  if (!file.size || file.size > maxMiB * 1024 * 1024) {
    throw new Error(`附件不能为空，大小上限为 ${maxMiB} MiB`);
  }

  const url = URL.createObjectURL(file);
  const video = isVideo ? document.createElement('video') : undefined;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  try {
    if (!ctx) throw new Error('当前浏览器无法处理附件画面');
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      await waitForVideo(video, 'loadeddata', () => { video.src = url; });
      if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration) || video.duration <= 0) {
        throw new Error('视频没有可读取的画面');
      }

      // 三帧合成一张带时间戳的图，供两种模型后端使用，并控制请求体积。
      const scale = Math.min(1, 768 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.height = (height + 24) * 3;
      for (const [index, ratio] of [0.15, 0.5, 0.85].entries()) {
        const time = video.duration * ratio;
        if (video.currentTime !== time) {
          await waitForVideo(video, 'seeked', () => { video.currentTime = time; });
        }
        const y = index * (height + 24);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, y, canvas.width, 24);
        ctx.fillStyle = '#000';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${time.toFixed(2)} s`, 6, y + 17);
        ctx.drawImage(video, 0, y + 24, canvas.width, height);
      }
    } else {
      const source = new Image();
      source.src = url;
      await source.decode();
      const scale = Math.min(1, 1280 / Math.max(source.naturalWidth, source.naturalHeight));
      canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    }

    const preview = canvas.toDataURL('image/jpeg', 0.82);
    const image = preview.length <= 512 * 1024 ? preview : canvas.toDataURL('image/jpeg', 0.55);
    if (!image.startsWith('data:image/jpeg;base64,') || image.length > 512 * 1024) {
      throw new Error('附件画面过大，请选择更小的文件');
    }
    return { label: isVideo ? `视频抽帧 · ${file.name}` : `图片 · ${file.name}`, image };
  } finally {
    if (video) {
      video.removeAttribute('src');
      video.load();
    }
    URL.revokeObjectURL(url);
  }
}
