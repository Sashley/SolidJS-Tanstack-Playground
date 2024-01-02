import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  createSolidTable,
  Row,
} from "@tanstack/solid-table";
import { makeData, Person } from "./makeData";
import { createSignal, For, Show } from "solid-js";

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
    <div class="p-2 bg-stone-200 m-4 text-sm">
      <div class="text-xs bg-orange-100 p-2 m-2">
        Note: Layout | /tables/sorting/App | Layout Example 02
      </div>
      <table>
        <thead>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr class="bg-stone-300">
                <For each={headerGroup.headers}>
                  {(header) => (
                    <th colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        <div
                          class={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none px-6"
                              : undefined
                          }
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
      <div>{table.getRowModel().rows.length} Rows</div>
      <div>
        <button
          class="bg-stone-400 p-2 rounded m-4"
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
