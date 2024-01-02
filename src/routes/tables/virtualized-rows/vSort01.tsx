import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  For,
} from "solid-js";
import { createStore } from "solid-js/store";

import "./index.css";

import {
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  Row,
  SortingState,
} from "@tanstack/solid-table";

import { makeData, Person } from "./makeData";
import { createVirtualizer, VirtualItem } from "@tanstack/solid-virtual";

function App() {
  const count = 50000;
  const [data, setData] = createSignal(makeData(count));
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const refreshData = () => setData(makeData(count));

  const columns = createMemo<ColumnDef<Person, any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 60,
      },
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
        header: () => <span>First Name</span>,
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        size: 50,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        size: 80,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => info.getValue<Date>().toLocaleString(),
      },
    ],
    []
  );

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: columns(),
    // columns,
    state: {
      // sorting: sorting(),
      get sorting() {
        // console.log("sorting getter", sorting());
        return sorting();
      },
    },
    // onSortingChange: () => {
    //   console.log("sorting changed");
    //   setSorting;
    // },

    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const tableContainerRef = createSignal<HTMLDivElement>();

  const { rows } = table.getRowModel();

  let parentRef: any;
  const rowVirtualizer = createVirtualizer({
    count,
    getScrollElement: () => parentRef,
    estimateSize: () => 45,
    // size: () => rows.length,
    overscan: 10,
  });

  const [virtualRows, setVirtualRows] = createSignal<VirtualItem[]>([]);
  const [totalSize, setTotalSize] = createSignal(0);
  const [virtualItems, setVirtualItems] = createSignal<VirtualItem[]>([]);
  const [virtualItemsLength, setVirtualItemsLength] = createSignal(0);
  const [virtualItemsStart, setVirtualItemsStart] = createSignal(0);
  const [paddingTop, setPaddingTop] = createSignal(0);
  const [paddingBottom, setPaddingBottom] = createSignal(0);

  createEffect(() => {
    setVirtualRows(rowVirtualizer.getVirtualItems());
    setTotalSize(rowVirtualizer.getTotalSize());
    setVirtualItems(rowVirtualizer.getVirtualItems());
    setVirtualItemsLength(rowVirtualizer.getVirtualItems().length);
    setVirtualItemsStart(rowVirtualizer.getVirtualItems()[0]?.start || 0);

    setPaddingTop(() =>
      virtualItemsLength() > 0 ? virtualItemsStart() || 0 : 0
    );

    setPaddingBottom(() =>
      virtualItemsLength() > 0
        ? totalSize() - (virtualItems()[virtualItemsLength() - 1]?.end || 0)
        : 0
    );

    let parentRef: HTMLDivElement | undefined;

    // createEffect(() => {
    //   table.refetch();
    // });

    onCleanup(() => {
      // Cleanup code if needed
    });
  });

  return (
    <div class="p-8 pt-4">
      <div class="h-2" />
      <div class="text-xs bg-orange-100 p-2 m-2">
        Note: virtual | table | column sorting | vSort01 | Not working, needs
        table sorting store. Change to resource?
      </div>
      <div ref={parentRef} class="container">
        <table>
          <thead>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th
                        colSpan={header.colSpan}
                        style={{ width: `${header.getSize()}px` }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            classList={{
                              "cursor-pointer select-none":
                                header.column.getCanSort(),
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody>
            {paddingTop() > 0 && (
              <tr>
                <td style={{ height: `${paddingTop()}px` }} />
              </tr>
            )}
            <For each={virtualRows()}>
              {(virtualRow) => {
                const row = rows[virtualRow.index] as Row<Person>;
                return (
                  <tr>
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <td>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      )}
                    </For>
                  </tr>
                );
              }}
            </For>
            {paddingBottom() > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom()}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div class="pt-4">
        <button
          class="p-2 m-2 bg-stone-200 rounded-lg"
          onClick={() => setData(data())}
        >
          Force Rerender
        </button>
        <button class="p-2 m-2 bg-stone-200 rounded-lg" onClick={refreshData}>
          Refresh Data
        </button>
        {table.getRowModel().rows.length} Rows
      </div>
      <div class="grid grid-cols-2 pt-4">
        <div class="col-span-2 font-semibold">Sorting 01</div>
        <div class="col-span-1">
          Sorting
          <pre>{JSON.stringify(sorting(), null, 2)}</pre>
        </div>
        <div class="col-span-1">
          GetSortedRowModel
          <pre>{JSON.stringify(getSortedRowModel(), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
