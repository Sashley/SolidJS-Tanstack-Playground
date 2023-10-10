import { useLocation, A, FileRoutes, Routes } from "solid-start";
import "../../root.css";
import MenuItems from "./menuItems/menuItems03";
import { createSignal } from "solid-js";

export default function Layout() {
  const location = useLocation();
  const [isMenubarOpen, setIsMenubarOpen] = createSignal(true); // Menubar toggle state
  const active = (path: string) =>
    path == location.pathname
      ? "border-stone-700"
      : "border-transparent hover:border-stone-800";
  const mainContentMargin = isMenubarOpen() ? "ml-64" : "ml-0";

  return (
    <div class="h-screen flex flex-col overflow-y-hidden">
      {/* <div class="flex flex-col w-screen"> */}
      <div class="bg-stone-900 sticky top-0 z-40 h-12">
        <nav class="flex items-center justify-between text-stone-200">
          {/* Hamburger Icon for smaller screens */}
          <div class="p-2">
            <button onClick={() => setIsMenubarOpen(!isMenubarOpen())}>
              <div class="px-2 text-xs rounded-sm font-semibold text-stone-100 hover:text-lg">
                Menu
              </div>
            </button>
          </div>
          <div class="pr-8 font-bold">TanStack Table | SolidJs</div>

          {/* <MenuItems /> */}
        </nav>
      </div>
      <div class="flex flex-grow">
        {/* Menubar */}
        <div
          class={`xl:w-64 min-w-[16rem] bg-stone-800 ${
            isMenubarOpen() ? "flex" : "hidden"
          } 2xl:flex`}
        >
          <div class="px-2">
            <div class="py-4 rounded-lg text-stone-100">
              {/* Menubar Content */}
              <div class="flex flex-col text-xs max-h-screen overflow-y-scroll m-4">
                <MenuItems />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {/* <div class={`border-b ${mainContentMargin} flex-grow p-4 overflow-y-auto`}> */}
        <div class={`border-b flex-grow overflow-y-auto`}>
          <Routes>
            <FileRoutes />
          </Routes>
        </div>
      </div>
    </div>
  );
}
