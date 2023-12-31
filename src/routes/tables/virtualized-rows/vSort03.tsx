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

  const columns: ColumnDef<Person>[] = [
    {
      header: "Name",
      footer: (props) => props.column.id,
      columns: [
        {
          accessorKey: "firstName",
          cell: (info) => info.getValue(),
          header: () => <span>First Name</span>,
          footer: (props) => props.column.id,
        },
        {
          accessorFn: (row) => row.lastName,
          id: "lastName",
          cell: (info) => info.getValue(),
          header: () => <span>Last Name</span>,
          footer: (props) => props.column.id,
        },
      ],
    },
    {
      header: "Info",
      footer: (props) => props.column.id,
      columns: [
        {
          accessorKey: "age",
          header: () => "Age",
          footer: (props) => props.column.id,
        },
        {
          header: "More Info",
          columns: [
            {
              accessorKey: "visits",
              header: () => <span>Visits</span>,
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "status",
              header: "Status",
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "progress",
              header: "Profile Progress",
              footer: (props) => props.column.id,
            },
          ],
        },
      ],
    },
  ];

  const table = createSolidTable({
    // data: {
    //   get data() {
    //   return data();
    //   },
    // },
    data: data(),
    // columns: columns(),
    columns,
    state: {
      get sorting() {
        return sorting();
      },
      // sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const tableContainerRef = createSignal<HTMLDivElement>();

  const { rows } = table.getRowModel();

  let parentRef: any;
  // let parentRef: tableContainerRef;
  const rowVirtualizer = createVirtualizer({
    count,
    // parentRef: tableContainerRef,
    getScrollElement: () => parentRef,
    estimateSize: () => 20,
    // size: () => rows.length,
    overscan: 4,
  });

  // const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

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
    console.log("sorting", sorting());

    onCleanup(() => {
      // Cleanup code if needed
    });
  });

  interface VirtualItem {
    [key: string]: any; // This is the index signature
    // Other properties go here
  }

  return (
    <div class="p-8">
      <div class="h-2" />
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
                              "cursor-pointer select-none bg-red-200":
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
      <div>{table.getRowModel().rows.length} Rows</div>
      <div>
        <button
          class="p-2 m-2 bg-stone-200 rounded-lg"
          onClick={() => setData(data())}
        >
          Force Rerender
        </button>
      </div>
      <div>
        <button class="p-2 m-2 bg-stone-200 rounded-lg" onClick={refreshData}>
          Refresh Data
        </button>
      </div>
      Sorting 02{" "}
      <pre>
        {JSON.stringify(sorting(), null, 2)}
        {virtualRows()
          .slice(0, 5)
          .map((item: VirtualItem) =>
            Object.keys(item).map((key) => `${key}: ${item[key]}`)
          )
          .join(", ")}
      </pre>
      <pre>
        {virtualRows()
          .slice(2, 10)
          .map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<Person>;
            return row
              .getVisibleCells()
              .map((cell) => cell.getValue())
              .join(", ");
          })
          .join("\n")}
      </pre>
    </div>
  );
}

export default App;
