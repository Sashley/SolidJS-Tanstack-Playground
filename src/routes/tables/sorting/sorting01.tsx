import { createSignal, For, Show } from "solid-js";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  Row,
  createSolidTable,
} from "@tanstack/solid-table";
import { makeData, Person } from "./makeData";

function App() {
  const [data, setData] = createSignal(makeData(100_000));
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const refreshData = () => setData(makeData(100_000));

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
    get data() {
      return data();
    },
    columns,
    state: {
      get sorting() {
        return sorting();
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
    filterFns: {
      fuzzy: (rows, id, filterValue) => fuzzyFilter(rows, id, filterValue),
    },
  });

  return (
    <div class="p-10 bg-stone-200 m-4 text-sm">
      <div class="text-xs bg-stone-100 p-2 m-2">
        Note: sorting 01 | /tables/sorting/sorting01 | Sorting01
      </div>
      <table>
        <thead>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th class="px-4 bg-stone-200" colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        <div
                          class={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none bg-stone-300 rounded m-1 px-2"
                              : undefined
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " [+] ",
                            desc: " [-] ",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows.slice(0, 10)}>
            {(row) => (
              <tr>
                <For each={row.getVisibleCells()}>
                  {(cell) => (
                    <td class="bg-stone-100 pc-4">
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
      <div>{table.getRowModel().rows.length} Rows</div>
      <div class="py-4">
        <button
          class="bg-stone-500 text-stone-50 p-2 m-4 rounded"
          onClick={() => refreshData()}
        >
          Refresh Data
        </button>
      </div>
      <pre>{JSON.stringify(sorting(), null, 2)}</pre>
    </div>
  );
}

export default App;
function fuzzyFilter(rows: Row<any>, id: string, filterValue: any): boolean {
  throw new Error("Function not implemented.");
}
