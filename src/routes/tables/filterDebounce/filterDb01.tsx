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
import { createStore } from "solid-js/store";

// const [filterValue, setFilterValue] = createSignal<string | number>("");

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

const [columnFilters, setColumnFilters] = createStore<ColumnFiltersState>([]);

function getColumnFilters(): ColumnFiltersState {
  return columnFilters;
}

function App() {
  // const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>(
  //   []
  // );

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
      columnFilters,
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
        Note: DeBounce 1nd attempt, nested debounce inside filter. Using signals
        | /tables/filterDebounce/filterDb01 | FilterDb01
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

  const [filterValue, setFilterValue] = createSignal<string | number>("");
  const columnFilterValue = column.getFilterValue() as string | number;
  setFilterValue(columnFilterValue);

  // const [filterValue, setFilterValue] = createSignal<string | number>("");

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
    // console.log(
    //   "column.getFacetedUniqueValues(): ",
    //   column.getFacetedUniqueValues()
    // );
    // uniqueValues;
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
  } & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange">;

  function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 1000,
    ...props
  }: DebouncedInputProps<string | number>) {
    const [deBounceValue, setDeBounceValue] = createSignal<string | number>(
      initialValue
    );

    // console.log("initial value: ", initialValue);

    createEffect(() => {
      setDeBounceValue(initialValue); //, [initialValue]
      // console.log("initialValue ce1: ", initialValue);
    });

    createEffect(() => {
      const timeout = setTimeout(() => {
        // const updatedValue = deBounceValue();
        onChange(deBounceValue()); // Pass the updated value to the parent component
        // setDeBounceValue(updatedValue);
        // console.log("updatedValue ce2: ", updatedValue);
      }, debounce);

      return () => clearTimeout(timeout);
    }); //, [filterValue, onChange, debounce]

    // createEffect(() => {
    //   setFilterValue(deBounceValue());
    // });

    return (
      <input
        {...(props as JSX.IntrinsicElements["input"])}
        value={initialValue}
        // onChange={(e) => {
        //   setDeBounceValue(e.currentTarget.value);
        //   console.log("onChange input");
        // }}
        onInput={(e) => {
          // setFilterValue(e.currentTarget.value);
          setDeBounceValue(e.currentTarget.value);
          // console.log("onInput input");
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
        oninput={(e) => {
          setFilterValue(e.currentTarget.value);
          // console.log("on db input", filterValue());
        }}
        onChange={(value) => {
          setFilterValue(value);
          // console.log("value db onChange: ", value);
          // console.log("columnFilterValue: ", columnFilterValue);
          // console.log("filterValue: ", filterValue());
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
