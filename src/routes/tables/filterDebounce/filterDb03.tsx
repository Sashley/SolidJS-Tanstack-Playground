import { For, JSX, createEffect, createMemo, createSignal } from "solid-js";

import { makeData, Person } from "../makeData02";

import {
  Column,
  Table,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  createSolidTable,
  FilterFn,
  ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from "@tanstack/solid-table";

import { rankItem } from "@tanstack/match-sorter-utils";

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

function App() {
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = createSignal("");

  const columns = createMemo<ColumnDef<Person, any>[]>(
    () => [
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
    ],
    []
  );

  const [data, setData] = createSignal<Person[]>(makeData(1000));

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
      get globalFilter() {
        return globalFilter();
      },
    },

    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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

  return (
    <div class="p-4 bg-stone-300 text-sm h-fit overflow-auto">
      <div class="text-sm bg-stone-100 p-2 m-2 rounded-lg">
        Note: DeBounce 3nd attempt, seems to be working, nested debounce inside
        filter. Using signals | /tables/filterDebounce/filterDb03 | FilterDb03
      </div>
      <div class="w-full-screen overflow-y-scroll h-96">
        <table class="m-2 text-sm">
          <thead class="bg-stone-100 rounded-lg">
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th
                        class="border bg-stone-200 px-2"
                        colSpan={header.colSpan}
                      >
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}{" "}
                        </div>

                        {header.column.getCanFilter() ? (
                          <div class="bg-stone-300">
                            {" "}
                            <Filter column={header.column} table={table} />
                          </div>
                        ) : null}
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody class="max-h-96">
            <For each={table.getRowModel().rows}>
              {(row) => (
                <tr class="bg-stone-50">
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td class="">
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
        </table>
      </div>
      <pre class="text-xs">{JSON.stringify(table.getState(), null, 2)}</pre>
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

  const [filterValue, setFilterValue] = createSignal<string | number>(
    column.getFilterValue() as string | number
  );

  const applyFilter = () => {
    // Apply filtering logic here using filterValue
    // Example: Update the filtered data in the table
    column.setFilterValue(filterValue());
  };

  // Use a custom useEffect to apply filtering when filterValue changes
  createEffect(() => {
    applyFilter();
  });

  const uniqueValues = (): void => {
    Array.from(column.getFacetedUniqueValues().keys()).sort();
  };

  const sortedUniqueValues = createMemo(
    () => (typeof firstValue === "number" ? [] : uniqueValues()),
    [column.getFacetedUniqueValues()]
  );

  type DebouncedInputProps<T> = {
    value: T;
    onChange: (value: T) => void;
    debounce?: number;
  } & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onInput">;

  function DebouncedInput({
    value,
    onChange,
    debounce = 500,
    ...props
  }: DebouncedInputProps<string | number>) {
    const [immediateValue, setImmediateValue] = createSignal<string | number>(
      value
    );
    const [debouncedValue, setDebouncedValue] = createSignal<string | number>(
      value
    );

    createEffect(() => {
      const currentImmediateValue = immediateValue();
      const timeout = setTimeout(() => {
        if (currentImmediateValue !== debouncedValue()) {
          setDebouncedValue(currentImmediateValue);
          onChange(currentImmediateValue);
        }
      }, debounce);

      return () => {
        clearTimeout(timeout);
      };
    });

    return (
      <input
        {...(props as JSX.IntrinsicElements["input"])}
        value={immediateValue()}
        onInput={(e) => {
          setImmediateValue(e.currentTarget.value);
        }}
      />
    );
  }

  return (
    <>
      <datalist id={column.id + "list"}>
        {Array.from(sortedUniqueValues() || [])
          .slice(0, 10)
          .map((value: any) => (
            <option value={value} />
          ))}{" "}
      </datalist>{" "}
      <DebouncedInput
        type="text"
        value={filterValue()}
        onChange={(value: any) => {
          setFilterValue(value);
        }}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        class="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div>
        <pre>
          {""}
          {String(
            column.getFilterValue() !== undefined
              ? column.getFilterValue()
              : "no filter"
          )}{" "}
        </pre>
      </div>
    </>
  );
}

export default App;
