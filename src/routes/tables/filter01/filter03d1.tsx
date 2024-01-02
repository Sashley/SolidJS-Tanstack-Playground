import { For, JSX, createEffect, createMemo, createSignal } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";

import { makeData, Person } from "./makeData02";

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
    ],
    []
  );

  const [data, setData] = createSignal<Person[]>(makeData(10));

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
    },
    onColumnFiltersChange: setColumnFilters,
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
    <div class="p-2 bg-stone-300 m-4 text-sm">
      <div class="text-xs bg-orange-100 p-2 m-2">
        Note: Second, filtering attempt, additional fields, string only, extra
        added it, own state managment was the original issue. |
        /tables/filter01/filter03d1 | Filter03d1
      </div>
      <div class="w-full-screen overflow-x-scroll">
        <table class="m-2 text-sm">
          <thead class="bg-stone-100">
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th
                        class="border bg-stone-200 px-8"
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
        </table>
      </div>

      {/* <pre>{JSON.stringify(table.getState(), null, 2)}</pre> */}
    </div>
  );
}

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
  const [filterValue, setFilterValue] = createSignal<string | number>(
    initialValue === "" ? "" : initialValue
  );

  // console.log("filter value 1: ", initialValue);
  // console.log("filter value 10: ", filterValue());

  createEffect(() => {
    setFilterValue(initialValue);
  }, [initialValue]);

  createEffect(() => {
    const timeout = setTimeout(() => {
      // console.log("filter value 1: ", filterValue());
      onChange(filterValue());
      console.log("effect run");
      // console.log("filter value 2: ", filterValue());
    }, debounce);

    return () => clearTimeout(timeout);
  }, [filterValue, onChange, debounce]);

  // createEffect(() => {
  //   // This effect will run whenever filterValue changes
  //   console.log("Filter value updated:", filterValue());
  // }, [filterValue]);

  return (
    <>
      <input
        {...props}
        value={filterValue()}
        // onInput={(e) => {
        //   const newValue = e.currentTarget.value;
        //   // console.log("Input value changed:", newValue);
        //   setFilterValue(newValue); // Update the filter value
        //   console.log("filterValue: ", filterValue());
        //   // setFilterValue(e.currentTarget.value);
        // }}
        onChange={(e) => {
          const newValue = e.currentTarget.value;
          console.log("Input value changed:", newValue);
        }}
      />
      {filterValue()}
    </>
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

  const [filterVal, setFilterVal] = createSignal<string | number>("");

  const applyFilter = () => {
    // Apply filtering logic here using filterValue
    // Example: Update the filtered data in the table
    // const filteredData = (column.setFilterValue(filterVal))
    column.setFilterValue(filterVal);
  };

  // Use a custom useEffect to apply filtering when filterValue changes
  createEffect(() => {
    applyFilter();
  }, [filterVal]);

  const uniqueValues = (): void => {
    console.log(
      "column.getFacetedUniqueValues(): ",
      column.getFacetedUniqueValues()
    );
    Array.from(column.getFacetedUniqueValues().keys()).sort();
  };

  const sortedUniqueValues = createMemo(
    () => (typeof firstValue === "number" ? [] : uniqueValues()),
    [column.getFacetedUniqueValues()]
  );

  return (
    <>
      <datalist id={column.id + "list"}>
        {Array.from(sortedUniqueValues() || [])
          .slice(0, 100)
          .map((value: any) => (
            <option value={value} />
          ))}{" "}
      </datalist>{" "}
      <DebouncedInput
        type="text"
        // value={(columnFilterValue ?? "") as string}
        value={filterVal()}
        onChange={(value) => {
          console.log("value: ", value);
          console.log("columnFilterValue: ", columnFilterValue);
          console.log("filterVal: ", filterVal());

          // console.log(
          //   "Input value changed:",
          //   value,
          //   "IVC: ",
          //   columnFilterValue
          // );
          // column.setFilterValue(value);
          // console.log("test");
          // console.log("columnFilterValue: ", columnFilterValue);
          setFilterVal(value);
        }}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        class="w-36 border shadow rounded"
        list={column.id + "list"}
      />{" "}
      <div>
        <pre>
          {" "}
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
