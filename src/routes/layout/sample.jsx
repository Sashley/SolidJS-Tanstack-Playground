
import { A } from 'solid-start'

export default function About() {
  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky left-0 w-full bg-slate-600 text-white h-12 flex items-center justify-between px-4">
        <div>
          <span class="pr-8">Logo</span>
          <A href="/" class="text-slate-50 hover:underline">
            Home
          </A>
        </div>

        <span>Options</span>
      </div>

      <div className="mt-12 flex">
        {/* Sidebar */}
        <div className="hidden md:block md:w-64 bg-slate-100 h-screen">
          Sidebar Content
        </div>

        {/* Main Body */}
        <div className="flex-1 bg-white p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Grid 1 */}
            <div className="h-[60vh] bg-slate-200">
              Grid 1
            </div>

            {/* Grid 2 */}
            <div className="h-[60vh] bg-slate-300">
              Grid 2
            </div>

            {/* Grid 3 */}
            <div className="col-span-2 h-[30vh] bg-slate-400 mt-4">
              Grid 3
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
