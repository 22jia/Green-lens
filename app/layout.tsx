import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Lens - ESG 消费透镜",
  description: "打破 ESG 报告与消费者之间的信息壁垒",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}