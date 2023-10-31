import { For, createSignal, onCleanup } from "solid-js";
// import { render } from "solid-js/web";
import { createVirtualizer } from "@tanstack/solid-virtual";

import "./index.css"; // Assuming this CSS file contains the necessary styles for the components

function App() {
  return (
    <div class="m-4 px-4">
      <p>
        These components are using <strong>fixed</strong> sizes. This means that
        every element's dimensions are hard-coded to the same value and never
        change.
      </p>

      <h3 class="py-4 font-semibold">Rows</h3>
      <RowVirtualizerFixed />

      <h3 class="py-4 font-semibold">Columns</h3>
      <ColumnVirtualizerFixed />

      <h3 class="py-4 font-semibold">Grid</h3>
      <GridVirtualizerFixed />

      {import.meta.env.MODE === "development" ? (
        <p>
          <strong>Notice:</strong> You are currently running Solid in
          development mode. Rendering performance will be slightly degraded
          until this application is build for production.
        </p>
      ) : null}
    </div>
  );
}

function RowVirtualizerFixed() {
  const [parentRef, setParentRef] = createSignal(null);

  const rowVirtualizer = createVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef(),
    estimateSize: () => 35,
    overscan: 5,
  });

  return (
    <div ref={setParentRef} class="List h-50 w-80 overflow-auto">
      <div
        class="relative w-full max-h-96"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        <For
          each={rowVirtualizer.getVirtualItems()}
          fallback={<div>Loading...</div>}
        >
          {(virtualRow) => (
            <div
              class={`absolute top-0 left-0 w-full h-${virtualRow.size} ${
                virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
              }`}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              Row {virtualRow.index}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function ColumnVirtualizerFixed() {
  const [parentRef, setParentRef] = createSignal(null);

  const columnVirtualizer = createVirtualizer({
    horizontal: true,
    count: 10000,
    getScrollElement: () => parentRef(),
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <>
      <div
        ref={setParentRef}
        class="List"
        style={{
          width: `400px`,
          height: `100px`,
          overflow: "auto",
        }}
      >
        <div
          style={{
            width: `${columnVirtualizer.getTotalSize()}px`,
            height: "100%",
            position: "relative",
          }}
        >
          <For each={columnVirtualizer.getVirtualItems()}>
            {(virtualColumn) => (
              <div
                class={virtualColumn.index % 2 ? "ListItemOdd" : "ListItemEven"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${virtualColumn.size}px`,
                  transform: `translateX(${virtualColumn.start}px)`,
                }}
              >
                Column {virtualColumn.index}
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  );
}

function GridVirtualizerFixed() {
  const [parentRef, setParentRef] = createSignal(null);

  const rowVirtualizer = createVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef(),
    estimateSize: () => 35,
    overscan: 5,
  });

  const columnVirtualizer = createVirtualizer({
    horizontal: true,
    count: 10000,
    getScrollElement: () => parentRef(),
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <>
      <div
        ref={setParentRef}
        class="List"
        style={{
          height: `500px`,
          width: `500px`,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          <For each={rowVirtualizer.getVirtualItems()}>
            {(virtualRow) => (
              <>
                <For each={columnVirtualizer.getVirtualItems()}>
                  {(virtualColumn) => (
                    <div
                      class={
                        virtualColumn.index % 2
                          ? virtualRow.index % 2 === 0
                            ? "ListItemOdd"
                            : "ListItemEven"
                          : virtualRow.index % 2
                          ? "ListItemOdd"
                          : "ListItemEven"
                      }
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${virtualColumn.size}px`,
                        height: `${virtualRow.size}px`,
                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                      }}
                    >
                      Cell {virtualRow.index}, {virtualColumn.index}
                    </div>
                  )}
                </For>
              </>
            )}
          </For>
        </div>
      </div>
    </>
  );
}

export default App;
