import { createSignal, createEffect, createResource, onCleanup, Accessor } from 'solid-js';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from 'solid-query';
import { useVirtual } from 'solid-virtual';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  Row,
  createSolidTable,
} from "@tanstack/solid-table";

import './index.css';
import { fetchData, Person, PersonApiResponse } from './makeData';

const fetchSize = 25;

function App() {
  const [tableContainerRef, setTableContainerRef] = createSignal();
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const rerender = () => setSorting([...sorting()]);

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

  const getSortingState = (accessor: Accessor<SortingState>): SortingState => {
    return accessor()
  }
  
  const sortingState = getSortingState(sorting)


  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery(
    ['table-data', sorting],
    async ({ pageParam = 0 }) => {
      const start = pageParam * fetchSize
      const fetchedData = fetchData(start, fetchSize, sortingState) //pretend api call
      return fetchedData
    },
    {
      getNextPageParam: (_lastGroup: any, groups: any) => groups.length,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const flatData = data?.pages?.flatMap(page => page.data) ?? [];
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  // ... (fetchMoreOnBottomReached would remain mostly the same)
    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = ()=> {
    containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
        if (
          scrollHeight - scrollTop - clientHeight < 300 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  )}

  createEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef());
  });

  const table = createSolidTable({
    data: flatData,
    columns,
    state: { sorting: sorting() },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef(),
    size: table.getRowModel().rows.length,
    overscan: 10,
  });

  // ... (rest remains mostly the same)
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const queryClient = new QueryClient();

createRoot(() => {
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>;
}).mount(rootElement);
