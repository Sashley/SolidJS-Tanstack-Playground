import { createSignal, For, Show } from "solid-js";
import { makeData, Person } from "./makeData";
import { faker } from "@faker-js/faker";
import {
  flexRender,
  getCoreRowModel,
  ColumnOrderState,
  VisibilityState,
  ColumnDef,
  createSolidTable,
} from "@tanstack/solid-table";

const defaultColumns: ColumnDef<Person>[] = [
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

function App() {
  const [data, setData] = createSignal(makeData(20));
  const [columnOrder, setColumnOrder] = createSignal<ColumnOrderState>([]);
  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>(
    {}
  );
  const rerender = () => setData(() => makeData(20));

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns: defaultColumns,
    state: {
      get columnOrder() {
        return columnOrder();
      },
      get columnVisibility() {
        return columnVisibility();
      },
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  const randomizeColumns = () => {
    table.setColumnOrder(
      faker.helpers.shuffle(table.getAllLeafColumns().map((d) => d.id))
    );
  };

  return (
    <div class="flex p-4 bg-amber-50">
      <div class="flex-col w-32">
        <div class="bg-amber-200 inline-block border border-black shadow rounded">
          <div class="px-1 border-b border-black">
            <label>
              <input
                checked={table.getIsAllColumnsVisible()}
                onChange={table.getToggleAllColumnsVisibilityHandler()}
                type="checkbox"
              />{" "}
              Toggle All
            </label>
          </div>
          <For each={table.getAllLeafColumns()}>
            {(column) => (
              <div class="px-1">
                <label>
                  <input
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    type="checkbox"
                  />{" "}
                  {column.id}
                </label>
              </div>
            )}
          </For>
        </div>
        <div class="h-4" />
        <div class="flex-col">
          <button
            onClick={() => rerender()}
            class="border p-2 bg-amber-300 rounded w-24 text-sm hover:bg-amber-500"
          >
            Regenerate
          </button>
          <button
            onClick={() => randomizeColumns()}
            class="border p-2 bg-amber-300 rounded w-24 text-sm hover:bg-amber-500"
          >
            Shuffle Columns
          </button>
        </div>
      </div>
      <div class="flex-auto">
        {/* <div class="h-4" /> */}
        <table>
          <thead class="bg-amber-200">
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th colSpan={header.colSpan}>
                        <Show when={!header.isPlaceholder}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Show>
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody class="bg-amber-100">
            <For each={table.getRowModel().rows}>
              {(row) => (
                <tr>
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td class="px-8">
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
          {/* <tfoot>
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
          </tfoot> */}
        </table>
      </div>

      <div class="h-4" />
      <pre>{JSON.stringify(table.getState().columnOrder, null, 2)}</pre>
    </div>
  );
}

export default App;
