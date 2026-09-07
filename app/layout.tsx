import type { Metadata } from 'next';
import './globals.css';
import { publicAsset } from '@/lib/public-asset';
export const metadata: Metadata = {
  title: '星哥 · 让想法成为现实',
  description: '我是星哥。聊生意、聊 AI，也聊你下一步怎么走。了解我参与的项目，探索 AI 应用、项目思路与资源合作。',
  icons: { icon: publicAsset('/images/xingge.jpg') },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" className="dark"><body>{children}</body></html>;
}

