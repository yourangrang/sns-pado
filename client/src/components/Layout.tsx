import NavBar from "./NavBar";
import LeftSideBar from "./LeftSideBar";
import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false);

  return (
      <div className="flex max-w-6xl mx-auto relative">
          <NavBar onToggle={() => setSidebarOpen(prev => !prev)} />
          

           {/* 오버레이 */}
          {sidebarOpen && (
            <div
              onClick={closeSidebar}
              className="fixed inset-0 z-20 bg-black/30 md:hidden"
            />
          )}

          {/* 왼쪽 사이드바 */}
          <div className={` md:block  md:w-[100px] lg:w-[246px] h-screen bg-sky-400  ${sidebarOpen ? "block" : "hidden md:block"}`}
          >
            <LeftSideBar closeSidebar={closeSidebar} />
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 w-full bg-gray-200">
            {children}
          </div>
      </div>
  );
}
