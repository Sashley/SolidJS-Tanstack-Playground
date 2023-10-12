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
  FilterFn,
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

const defaultData = () => makeData(10);

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
    initialValue
  );
  // console.log(?"filterValue 2: ", filterValue());

  // let timeout: any;

  createEffect(() => {
    setFilterValue(initialValue);
  }, [initialValue]);

  createEffect(() => {
    const timeout = setTimeout(() => {
      onChange(filterValue());
    }, debounce);

    return () => clearTimeout(timeout);
  }, [filterValue, onChange, debounce]);

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
            accessorKey: "firstName",
            // accessorFn: (row) => row.firstName,
            // id: "firstName",
            cell: (info) => info.getValue(),
            // header: () => <span>First Name</span>,
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

  const [data, setData] = createSignal<Person[]>(makeData(5000));
  const refreshData = () => setData((old) => makeData(50000));

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

  // // Manage your own state
  // const [state, setState] = createSignal<TableState>(table.initialState);

  // table.setOptions((prev) => {
  //   const currentState = state(); // gets the current value

  //   // Cleanup any previous reactions, if necessary
  //   onCleanup(() => {
  //     // Cleanup code if necessary
  //   });

  //   return {
  //     ...prev, // spread previous options
  //     setState: currentState, // set the current state
  //     onStateChange: setState,
  //     debugTable: currentState.pagination.pageIndex > 2,
  //   };
  // });

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
    <div class="p-2 bg-stone-200 text-sm m-4">
      <div class="text-xs bg-stone-100 p-2 m-2">
        Note: First, basic filtering attempt, string only. Input vs
        DebouncedInput method | /tables/filter01/filter | Filter
      </div>
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
        class="border p-2 bg-stone-300 rounded"
      >
        ReRender
      </button>
      <pre class="text-xs m-2">{JSON.stringify(table.getState(), null, 2)}</pre>
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

  // const columnFilterValue = column.getFilterValue();

  function testFilter01() {
    const [testFilterValue, setTestFilterValue] = createSignal<
      string | number
    >();
    // columnFilterValue ? " " : " "
    console.log("fired testFilter01");
  }

  const sortedUniqueValues = createMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  return typeof firstValue === "number" ? (
    <div>
      <div class="h-1" />
    </div>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {Array.from(sortedUniqueValues())
          .slice(0, 5000)
          .map((value: any) => (
            <option value={value} />
          ))}{" "}
      </datalist>{" "}
      <input
        type="text"
        value={(column.getFilterValue() ?? "") as string}
        onInput={(e) => column.setFilterValue(e.currentTarget.value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        class="w-36 border shadow rounded"
        list={column.id + "list"}
      />{" "}
      <div>
        <pre>
          {String(
            column.getFilterValue() !== undefined
              ? column.getFilterValue()
              : "no filter"
          )}
        </pre>
      </div>
      <div class="h-1" />
    </>
  );
}

export default App;
