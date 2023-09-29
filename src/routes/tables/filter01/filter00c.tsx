import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
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
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnTable,
} from "@tanstack/solid-table";

import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";

declare module "@tanstack/table-core" {
  // interface FilterFns {
  //   fuzzy: FilterFn<unknown>;
  // }
  // interface FilterMeta {
  //   itemRank: RankingInfo;
  // }
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

const defaultData = () => makeData(10);

type DebouncedInputProps<T> = {
  value: T;
  onChange: (value: T) => void;
  debounce?: number;
} & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange">;

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 3500,
  ...props
}: DebouncedInputProps<string | number>) {
  const [filterValue, setFilterValue] = createSignal<string | number>(
    initialValue
  );
  console.log("filterValue 2: ", filterValue());

  let timeout: any;

  createEffect(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log("value 1: ", filterValue());
      onChange(filterValue());
    }, debounce);
    console.log("timeout, value: ", timeout, filterValue());
    return () => clearTimeout(timeout);
  }, [filterValue]);

  return (
    <input
      {...props}
      value={filterValue()}
      onChange={(e) => setFilterValue(e.currentTarget.value)}
    />
  );
}

function App() {
  const [globalFilter, setGlobalFilter] = createSignal("");
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>(
    []
  );
  // const [sorting, setSorting] = createSignal<SortingState>([]);
  const columns = createMemo<ColumnDef<Person, any>[]>(
    () => [
      {
        header: "Name",
        footer: (props) => props.column.id,
        columns: [
          {
            // accessorKey: "firstName",
            accessorFn: (row) => row.firstName,
            id: "firstName",
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
      // {
      //   header: "Info",
      //   footer: (props) => props.column.id,
      //   columns: [
      //     {
      //       accessorKey: "age",
      //       header: () => "Age",
      //       footer: (props) => props.column.id,
      //     },
      //     {
      //       header: "More Info",
      //       columns: [
      //         {
      //           accessorKey: "visits",
      //           header: () => <span>Visits</span>,
      //           footer: (props) => props.column.id,
      //         },
      //         {
      //           accessorKey: "status",
      //           header: "Status",
      //           footer: (props) => props.column.id,
      //         },
      //         {
      //           accessorKey: "progress",
      //           header: "Profile Progress",
      //           footer: (props) => props.column.id,
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
    []
  );

  const [data, setData] = createSignal<Person[]>(makeData(1000));
  const refreshData = () => setData((old) => makeData(1000));

  // Create the table and pass your options
  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: columns(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },

    // filterFns: {
    //   fuzzy: (rows, id, filterValue, addMeta) =>
    //     fuzzyFilter(rows, id, filterValue, addMeta),
    // },

    state: {
      columnFilters: columnFilters(),
      // globalFilter,
      // get sorting() {
      //   return sorting();
      // },
    },
    // onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),
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
  const [state, setState] = createSignal<TableState>(table.initialState);

  // Override the state managers for the table to your own
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

  table.setOptions((prev) => {
    // console.log("prev: ", prev);
    const currentState = state(); // gets the current value
    // console.log("currentState: ", currentState);

    // Cleanup any previous reactions, if necessary
    onCleanup(() => {
      // Cleanup code if necessary
    });

    return {
      ...prev, // spread previous options
      setState: currentState, // set the current state
      onStateChange: setState,
      debugTable: currentState.pagination.pageIndex > 2,
    };
  });

  // function getClassValue(column: any): string | undefined {
  //   const facetedValues = column.column._getFacetedMinMaxValues?.();

  //   if (Array.isArray(facetedValues)) {
  //     return facetedValues.join(" - ");
  //   } else if (facetedValues !== undefined) {
  //     return facetedValues.toString();
  //   }
  //   return ""; // return empty string by default
  // }

  return (
    <div class="p-2">
      {/* <div class="pb-4">
        <DebouncedInput
          value={globalFilter() ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          class="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      </div> */}
      <table>
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
                      {/* <Show when={!header.isPlaceholder}> */}
                      {/* <div>
                          <div class={getClassValue(header)}></div>
                        </div> */}
                      <div
                      // class={
                      //   header.column.getCanSort()
                      //     ? "cursor-pointer select-none bg-stone-300 rounded m-1"
                      //     : ""
                      // }
                      // onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}{" "}
                        {/* {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}{" "} */}
                        {/* {header.column.getIsSorted()} */}
                      </div>

                      {header.column.getCanFilter() ? (
                        <div class="bg-stone-300">
                          {" "}
                          <Filter column={header.column} table={table} />
                        </div>
                      ) : null}
                      {/* </Show> */}
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
      </table>
      <div class="h-2" />
      <div class="h-4" />
      <button
        onClick={() => refreshData()}
        class="border p-2 bg-stone-200 rounded"
      >
        Rerender 1
      </button>
      {/* <pre>{JSON.stringify(sorting(), null, 2)}</pre> */}
      <pre>{JSON.stringify(table.getState(), null, 2)}</pre>
      {/* <pre>{JSON.stringify(ilter({columns, table}))}</pre> */}
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
  // console.log("column: ", column);
  // console.log("table: ", table);
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  function testFilter01() {
    const [testFilterValue, setTestFilterValue] = createSignal<string | number>(
      // console.log("column.getFilterValue(): ", column.getFilterValue());
      // console.log("columnFilterValue: ", columnFilterValue);
      columnFilterValue ? " " : " "
    );
    console.log("fired testFilter01");
  }

  // console.log(
  //   "column",
  //   column,
  //   "columnFilterValue: ",
  //   columnFilterValue,
  //   "firstValue: ",
  //   firstValue
  // );

  const sortedUniqueValues = createMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );
  // console.log("sortedUniqueValues: ", sortedUniqueValues());

  return typeof firstValue === "number" ? (
    <div>
      {/* <div class="flex space-x-2">
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
            // console.log("value: ", value);
          }}
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ""
          }`}
          class="w-24 border shadow rounded"
        />
      </div> */}
      <div class="h-1" />
    </div>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {Array.from(sortedUniqueValues())
          .slice(0, 10)
          .map((value: any) => (
            <option value={value} />
          ))}{" "}
      </datalist>{" "}
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => {
          console.log("value filter: ", value, "column.id", column.id);
          // console.log("value filter: ", value, "column.id", column.id);
          column.setFilterValue(value);
          // column.setFilterValue(value);
          setTestFilterValue(value);
          testFilter01();
          // table.setColumnFilters((prev) => ({
          //   ...prev,
          //   [column.id]: value,
          // }));
          console.log("column.getFilterValue(): ", column.getFilterValue());
          console.log("columnFilterValue: ", columnFilterValue);
          // console.log("testFilterValue: ", testFilterValue());
        }}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        class="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div class="h-1" />
    </>
  );
}

export default App;
