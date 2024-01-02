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
  // const [visibility, setVisibility] = createSignal("hidden");

  return (
    <div class="flex flex-col h-screen">
      <div class="bg-stone-900 sticky top-0 z-40 h-12">
        <nav class="flex items-center justify-between text-stone-200">
          {/* Hamburger Icon for smaller screens */}
          <div class="p-4">
            <button onClick={() => setIsMenubarOpen(!isMenubarOpen())}>
              <div class="px-2 text-xs rounded-sm font-semibold text-stone-100 hover:text-lg">
                Menu
              </div>
            </button>
          </div>
          <div class="pr-8 font-bold">TanStack Table | SolidJs</div>
        </nav>
      </div>
      <div class="flex flex-grow max-h-[calc(100%-3rem)]">
        {/* Menubar */}
        <div
          class={`xl:w-80 min-w-[16rem] ${
            isMenubarOpen() ? "flex" : "hidden"
          } 2xl:flex flex-col`}
        >
          {/* Menu Header */}

          {/* <style>
            .p-4:hover + .text-sm {
              visibility: visible;
            }

            .text-sm {
              visibility: hidden;
            }
          </style> */}

          <div class="p-4 bg-stone-900 ">
            <h1 class="font-thin text-md text-stone-400">Menu Header</h1>
            <div class="text-xs hover:text-md text-orange-500 hover:bg-stone-100 hover:font-bold hover:p-2 rounded-md">
              <div>strikethrough -</div>
              WIP or Rework required
            </div>
          </div>

          {/* Menu Content */}
          <div class="flex-grow overflow-y-auto max-h-[calc(100%-7rem)] bg-stone-800">
            <div class="py-4 rounded-lg text-stone-100">
              <div class="flex flex-col text-sm">
                <MenuItems />
              </div>
            </div>
          </div>

          {/* Menu Footer */}
          <div class="p-4 bg-stone-900 ">
            <h1 class="font-thin text-md text-stone-400">Menu Footer</h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div class={`flex-grow overflow-y-auto`}>
          <Routes>
            <FileRoutes />
          </Routes>
        </div>
      </div>
    </div>
  );
}
