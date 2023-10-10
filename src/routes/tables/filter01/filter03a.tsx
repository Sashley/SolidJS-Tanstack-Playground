import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";

// import "./makeData";
import { makeData, Person } from "./makeData02";

import {
  Column,
  Table,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  createSolidTable,
  TableState,
  FilterFns,
  FilterFn,
  SortingFn,
  sortingFns,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from "@tanstack/solid-table";

import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

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

const defaultData = () => makeData(100);

// const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
//   let dir = 0;

//   // Only sort by rank if the column has ranking information
//   if (rowA.columnFiltersMeta[columnId]) {
//     dir = compareItems(
//       rowA.columnFiltersMeta[columnId]?.itemRank!,
//       rowB.columnFiltersMeta[columnId]?.itemRank!
//     );
//   }

//   // Provide an alphanumeric fallback for when the item ranks are equal
//   return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
// };

// // type Person = {
// //   firstName: string;
// //   lastName: string;
// //   age: number;
// //   visits: number;
// //   status: string;
// //   progress: number;
// // };

type DebouncedInputProps<T> = {
  value: T;
  onChange: (value: T) => void;
  debounce?: number;
} & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange">;

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedInputProps<string | number>) {
  const [value, setValue] = createSignal<string | number>(initialValue);

  createEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  createEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof initialValue === "number") {
        onChange(Number(value()));
      } else {
        onChange(value());
      }
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);

  return (
    <input
      {...props}
      value={value()}
      onInput={(e) => setValue(e.currentTarget.value)}
    />
  );
}

function App() {
  const [globalFilter, setGlobalFilter] = createSignal("");
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>(
    []
  );

  const columns = createMemo<ColumnDef<Person, any>[]>(
    () => [
      {
        header: "Name",
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: "firstName",
            cell: (info) => info.getValue(),
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
    ],
    []
  );

  const [data, setData] = createSignal<Person[]>(makeData(5000));
  const refreshData = () => setData((old) => makeData(5000));

  // const [columns] = React.useState<typeof defaultColumns>(() => [
  //   ...defaultColumns,
  // ])

  // const rerender = React.useReducer(() => ({}), {})[1]

  // Create the table and pass your options
  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: columns(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      get columnFilters() {
        return columnFilters();
      },
      // columnFilters: columnFilters(), //??
      get globalFilter() {
        return globalFilter();
      },
      // globalFilter: globalFilter(),
    },
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

  createEffect(() => {
    if (table.getState().columnFilters[0]?.id === "fullName") {
      if (table.getState().sorting[0]?.id !== "fullName") {
        table.setSorting([{ id: "fullName", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  // Manage your own state
  // const [state, setState] = createSignal<TableState>(table.initialState);

  // // Override the state managers for the table to your own - failed with SolidJS - needs reworking
  // table.setOptions((prev) => ({
  //   ...prev,
  //   state: state(),
  //   onStateChange: setState,
  //   // These are just table options, so if things
  //   // need to change based on your state, you can
  //   // derive them here

  //   // Just for fun, let's debug everything if the pageIndex
  //   // is greater than 2
  //   debugTable: state().pagination.pageIndex > 2,
  // }));

  function getClassValue(column: any): string | undefined {
    const facetedValues = column.column._getFacetedMinMaxValues?.();

    if (Array.isArray(facetedValues)) {
      return facetedValues.join(" - ");
    } else if (facetedValues !== undefined) {
      return facetedValues.toString();
    }
    return ""; // return empty string by default
  }

  return (
    <div class="p-2 bg-stone-300 m-4 text-sm">
      <div class="text-xs bg-stone-100 p-2 m-2">
        Note: Second, filtering attempt, additional fields, string only, extra
        added it, own state managment was the original issue. |
        /tables/filter01/filter03a | Filter03a
      </div>
      <div class="pb-4 m-2">
        <DebouncedInput
          value={globalFilter() ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          class="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      </div>
      <div class="w-full-screen overflow-x-scroll">
        <table class="m-2">
          <thead class="bg-stone-100">
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(column) => (
                      <th
                        class="border bg-stone-200 px-8"
                        // {...column.getHeaderProps()}
                        colSpan={column.colSpan}
                      >
                        {/* {flexRender(
                          column.column.columnDef.header,
                          column.getContext()
                        )} */}
                        <Show when={!column.isPlaceholder}>
                          <div>
                            <div class={getClassValue(column)}></div>
                          </div>

                          <>
                            {/* <div
                              {...{
                                class: column.column.getCanSort()
                                  ? "cursor-pointer select-none bg-stone-300"
                                  : "",
                                onClick: column.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                column.column.columnDef.header,
                                column.getContext()
                              )}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[column.column.getIsSorted() as string] ?? null}
                            </div> */}

                            <div
                              class={
                                column.column.getCanSort()
                                  ? "cursor-pointer select-none bg-stone-300"
                                  : ""
                              }
                              onClick={() =>
                                console.log(
                                  column.column.getToggleSortingHandler()
                                )
                              }
                            >
                              {flexRender(
                                column.column.columnDef.header,
                                column.getContext()
                              )}
                              <Show
                                when={column.column.getIsSorted() === "asc"}
                              >
                                🔼
                              </Show>
                              <Show
                                when={column.column.getIsSorted() === "desc"}
                              >
                                🔽
                              </Show>
                            </div>

                            {column.column.getCanFilter() ? (
                              <div class="bg-stone-200">
                                <Filter column={column.column} table={table} />
                              </div>
                            ) : null}
                          </>
                        </Show>
                        {/* {colShow>mn.render("Header")} */}
                      </th>
                    )}
                  </For>
                </tr>
              )}
              {/* {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))} */}
            </For>
          </thead>
          <tbody>
            {/* {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))} */}
            <For each={table.getRowModel().rows}>
              {(row) => (
                <tr class="bg-stone-50">
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
              )}
            </For>
          </tbody>
          <tfoot>
            {/* {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))} */}
            <For each={table.getFooterGroups()}>
              {(footerGroup) => (
                <tr>
                  <For each={footerGroup.headers}>
                    {(header) => (
                      <th colSpan={header.colSpan}>
                        <Show when={!header.isPlaceholder}>
                          {flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                        </Show>
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tfoot>
        </table>
      </div>

      <div class="h-2" />
      <div class="flex items-center gap-2">
        <button
          class="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          class="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          class="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          class="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span class="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span class="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            class="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option value={pageSize}>Show {pageSize}</option>
          ))}
        </select>
      </div>
      <div class="h-4" />
      <button onClick={() => refreshData()} class="border p-2">
        Rerender
      </button>
    </div>
  );
}

function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = createMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  return typeof firstValue === "number" ? (
    <div>
      <div class="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ""
          }`}
          class="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) => {
            column.setFilterValue((old: [number, number]) => [old?.[0], value]);
            console.log("value: ", value);
          }}
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ""
          }`}
          class="w-24 border shadow rounded"
        />
      </div>
      <div class="h-1" />
    </div>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {Array.from(sortedUniqueValues())
          .slice(0, 5000)
          .map((value: any) => (
            <option value={value} />
          ))}
      </datalist>
      <input
        type="text"
        value={(column.getFilterValue() ?? "") as string}
        onInput={(e) => column.setFilterValue(e.currentTarget.value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        class="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div class="h-1" />
    </>
  );
}

export default App;
