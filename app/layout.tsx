import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Pivot Coach — Professional Career Transition Platform",
  description: "Executive career transition planning, skill gap analysis, and interview preparation for modern professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
