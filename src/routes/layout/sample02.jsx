import { A } from 'solid-start'
// import Countries from '../dataFetch/countries4'
import { createSignal } from 'solid-js';

export default function About() {
  // Local state to track if the sidebar is open
  const [isSidebarOpen, setSidebarOpen] = createSignal(true);
  const [isDrillDownOpen, setDrillDownOpen] = createSignal(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky left-0 w-full bg-slate-600 text-white h-12 flex items-center justify-between px-4">
        <div class="flex flex-row ">
          {/* Button to toggle the sidebar */}
          <button class="px-2 hover:underline text-xs rounded-sm font-semibold text-slate-100 hover:text-lg" onClick={() => setSidebarOpen(!isSidebarOpen())}>
            SideBar
          </button>
          <div class="px-2">
            <A href="/" class="text-slate-50 hover:underline">
              Home
            </A>
          </div>
        </div>
        <span>Options</span>
      </div>
      <div className="flex-1 flex overflow-hidden mt-0">
        {/* Sidebar */}
        {isSidebarOpen() && <div className="xl:block xl:w-64 bg-slate-100 h-screen text-xs p-4">
          Sidebar Content
        </div>}
        {/* Main Body */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Grid 1 */}
            <div className="col-span-2 mb-4">
              <div class="flex flex-row bg-slate-200">
                {/* <div class='font-semibold text-lg px-4'>
                  Grid 1
                </div> */}
                {/* <button class="px-2 hover:underline text-xs rounded-sm font-semibold text-slate-800 hover:text-lg" onClick={() => setDrillDownOpen(!isDrillDownOpen())}>
                  DrillDown
                </button> */}
              </div>
              {/* Flex container for Grid 1 and Drilldown */}
              <div className="flex bg-slate-200 ">
                {isDrillDownOpen() && (
                  <div className="block w-48 bg-slate-100 overflow-y-auto text-xs p-4">
                    DrillDown Content
                  </div>
                )}
                {/* <div class="flex-1">
                  <Countries />
                </div> */}
              </div>
              {/* Grid 2 */}
              <div className="h-[60vh] bg-slate-300 col-span-2 lg:col-span-1 mt-4">
                Grid 2
              </div>
              {/* Grid 3 */}
              <div className="h-[40vh] bg-slate-400 col-span-2 lg:col-span-1 mt-4">
                Grid 3
              </div>

              {/* Grid 3 */}
              <div className="col-span-2 bg-slate-500 mt-4 text-slate-50">
                Grid 4
                {/* <Countries /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
