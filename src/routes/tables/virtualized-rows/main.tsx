import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  For,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  Row,
} from "@tanstack/solid-table";
import { createVirtualizer, VirtualItem } from "@tanstack/solid-virtual";

import { makeData, Person } from "./makeData";
import "./index.css";

function App() {
  const [sorting, setSorting] = createSignal([]);

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

  const count = 50000;
  const [data, setData] = createSignal(makeData(count));
  const refreshData = () => setData(makeData(count));

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: columns(),
    state: {
      sorting: sorting(),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const tableContainerRef = createSignal<HTMLDivElement>();

  const { rows } = table.getRowModel();

  // let tableContainerRef: any;
  let parentRef: any;
  const rowVirtualizer = createVirtualizer({
    count,
    getScrollElement: () => parentRef,
    estimateSize: () => 45,
  });

  // const { virtualItems: virtualRows, totalSize} = rowVirtualizer

  const [virtualRows, setVirtualRows] = createSignal();
  const [totalSize, setTotalSize] = createSignal(0);
  const [virtualItems, setVirtualItems] = createSignal<VirtualItem[]>([]);
  const [virtualItemsLength, setVirtualItemsLength] = createSignal(0);
  const [virtualItemsStart, setVirtualItemsStart] = createSignal(0);
  const [paddingTop, setPaddingTop] = createSignal(0);
  const [paddingBottom, setPaddingBottom] = createSignal(0);

  createEffect(() => {
    // const virtualRows = rowVirtualizer.getVirtualItems();
    setVirtualRows(rowVirtualizer.getVirtualItems());
    setTotalSize(rowVirtualizer.getTotalSize());
    setVirtualItems(rowVirtualizer.getVirtualItems());
    setVirtualItemsLength(rowVirtualizer.getVirtualItems().length);
    setVirtualItemsStart(rowVirtualizer.getVirtualItems()[0]?.start || 0);
    // const totalSize = rowVirtualizer.getTotalSize();
    // const virtualItems = rowVirtualizer.getVirtualItems();
    // const virtualItemsLength = virtualItems.length;
    // const virtualItemsStart = virtualItems[0]?.start || 0;
    // Now, virtualRows and totalSize can be used inside this effect as needed
    // console.log(virtualRows, totalSize);

    // const paddingTop = () =>
    //   virtualItemsLength() > 0
    //     ? virtualItemsStart() || 0
    //     : 0;

    setPaddingTop(() =>
      virtualItemsLength() > 0 ? virtualItemsStart() || 0 : 0
    );

    // const paddingBottom = () =>
    //   virtualItemsLength() > 0
    //     ? totalSize() -
    //       (virtualItems()[virtualItemsLength() - 1]?.end ||
    //         0)
    //     : 0;
    // });

    setPaddingBottom(() =>
      virtualItemsLength() > 0
        ? totalSize() - (virtualItems()[virtualItemsLength() - 1]?.end || 0)
        : 0
    );

    // createEffect(() => {
    //   table.refetch();
    // });

    onCleanup(() => {
      // Cleanup code if needed
    });
  });

  return (
    <div class="p-8">
      {/* ... (same as your React component's JSX, but using SolidJS syntax and APIs) */}
      <div class="h-2" />
      <div class="container">
        {" "}
        {/* /ref={tableContainerRef} */}
        {/* <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            class: header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop() > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index] as Row<Person>
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {paddingBottom() > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table> */}
        <table>
          <thead>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th
                        // key={header.id}
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
            {/* {paddingTop()} {paddingBottom()} */}
            <For each={virtualRows() as Person[]}>
              {(virtualRow) => {
                const row = rows[virtualRow.id] as Row<Person>;
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
      {/* <div>{table.getRowModel().rowsById[12]} First Row</div> */}
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
    </div>
  );
}

export default App;

// import { render } from 'solid-js/web';

// const rootElement = document.getElementById('root');
// if (!rootElement) throw new Error('Failed to find the root element');

// render(() => <App />, rootElement);
