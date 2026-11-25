export async function readTextFile(file: File): Promise<string> {
  if (!/\.(md|markdown|txt)$/i.test(file.name)) {
    throw new Error('支持导入 .md、.markdown 和 .txt 文件');
  }
  // 在读取前限制大小，避免单个文件占用过多草稿空间和模型上下文。
  if (file.size > 64 * 1024) throw new Error('文件大小不能超过 64 KiB');

  const bytes = await file.arrayBuffer();
  let content: string;
  try {
    // 严格解码，避免其他编码或二进制文件被静默转成乱码。
    content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('请选择 UTF-8 编码的文本文件');
  }
  if (content.includes('\0')) throw new Error('请选择 UTF-8 编码的文本文件');
  if (!content.trim()) throw new Error('文件内容为空');
  return content;
}
