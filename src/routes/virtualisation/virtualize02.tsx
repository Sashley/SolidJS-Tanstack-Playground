import {
  ColumnDef,
  createSolidTable,
  Column,
  Table,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  TableState,
  FilterFn,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  Row,
} from "@tanstack/solid-table";

import { createMemo, createSignal, For, onCleanup } from "solid-js";
// Adjust other imports to be SolidJS-compatible, if available

import { makeData, Person } from "../tables/makeData02";

import { createVirtualizer } from "@tanstack/solid-virtual";

import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

function SolidTableVirtualized() {
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = createSignal("");

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

  const [data, setData] = createSignal<Person[]>(makeData(10));
  console.log("data", data());

  // Adjust table logic for SolidJS
  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: columns(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting: sorting(),
    },
    onSortingChange: setSorting,
    // ... rest of the options
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const { rows } = table.getRowModel();

  let parentRef: any;
  const virtualizer = createVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef,
    estimateSize: () => 34,
    overscan: 20,
  });

  onCleanup(() => {
    // Any cleanup logic, if needed
  });

  return (
    // <div ref={parentRef} class="container">
    //   {/*... rest of your JSX, but remember that SolidJS uses () => {} for event handlers, not {}*/}
    // </div>
    <div class="bg-stone-50 m-2">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getTotalSize()}
        <table>
          <thead>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th
                        colSpan={header.colSpan}
                        class="px-4"
                        // style={{ width: header.getSize() }}
                      >
                        {header.colSpan}
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {" "}
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
            <For each={virtualizer.getVirtualItems()}>
              {(virtualRow, index) => {
                const row = rows[virtualRow.index] as Row<Person>;
                const virtualRowStart = Number(virtualRow.start); // Cast to number
                const virtualRowSize = Number(virtualRow.size); // Cast to number
                const translateY =
                  virtualRowStart - Number(index as unknown) * virtualRowSize;
                return (
                  <tr
                    // key={row.id}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${translateY}px)`,
                    }}
                  >
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <td
                        // key={cell.id}
                        >
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
            {/* {virtualizer.getVirtualItems().map((virtualRow, index) => {
              const row = rows[virtualRow.index] as Row<Person>
              return (
                <tr key={row.id} 
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                }}>
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
            })} */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  return (
    <div class="m-2 text-sm">
      <p class="bg-orange-100">
        For tables, the basis for the offset of the translate css function is
        from the row's initial position itself. Because of this, we need to
        calculate the translateY pixel count different and base it off the the
        index.
      </p>
      <br />
      <SolidTableVirtualized />
    </div>
  );
}

// const container = document.getElementById('root');

// // Here's where SolidJS rendering logic differs significantly:
// import { render } from 'solid-js/web';
// render(App, container);

export default App;
