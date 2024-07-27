import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "./components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-black inset-0 h-full max-w-md mx-auto">
          <div className="max-w-md mx-auto bg-white">
            <div>
              <Nav></Nav>
            </div>
            <div className="max-w-md mx-auto">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
