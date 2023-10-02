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

      get globalFilter() {
        return globalFilter();
      },
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
    <div class="p-2">
      <div class="text-xs bg-stone-100 p-2 m-2">
        Note: Second, filtering attempt, additional fields, string only, extra
        added it, own state managment was the original issue.
      </div>
      <div class="pb-4 m-2">
        <DebouncedInput
          value={globalFilter() ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          class="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      </div>
      <table class="m-2">
        <thead class="bg-stone-100">
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(column) => (
                    <th
                      class="border bg-stone-200 px-8"
                      colSpan={column.colSpan}
                    >
                      <Show when={!column.isPlaceholder}>
                        <div>
                          <div class={getClassValue(column)}></div>
                        </div>
                        <>
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
                            <Show when={column.column.getIsSorted() === "asc"}>
                              🔼
                            </Show>
                            <Show when={column.column.getIsSorted() === "desc"}>
                              🔽
                            </Show>
                          </div>

                          {column.column.getCanFilter() ? (
                            <div class="bg-stone-200">
                              {" "}
                              vv <pre>{column.column.id}</pre>
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
          </For>
        </thead>
        <tbody>
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
        <input
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onInput={(value) =>
            column.setFilterValue((old: [number, number]) => [
              value.currentTarget.value,
              old?.[1],
            ])
          }
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ""
          }`}
          class="w-24 border shadow rounded"
        />
        <input
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onInput={(value) => {
            column.setFilterValue((old: [number, number]) => [
              old?.[0],
              value.currentTarget.value,
            ]);
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
