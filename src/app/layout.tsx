import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "박달초 교무실",
  description: "박달초등학교 전담교사 시간표 관리 및 교무 업무 지원 시스템",
  keywords: ["박달초등학교", "교무실", "시간표", "전담교사", "학급시간표"],
  authors: [{ name: "박달초등학교" }],
  openGraph: {
    title: "박달초 교무실",
    description: "전담교사 시간표 관리 및 교무 업무 지원 시스템",
    type: "website",
    locale: "ko_KR",
    siteName: "박달초 교무실",
  },
  twitter: {
    card: "summary_large_image",
    title: "박달초 교무실",
    description: "전담교사 시간표 관리 및 교무 업무 지원 시스템",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
