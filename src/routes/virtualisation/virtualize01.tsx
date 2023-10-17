// Import the necessary types and functions
import {
  createVirtualizer,
  VirtualizerOptions,
  Virtualizer,
  PartialKeys,
} from "@tanstack/solid-virtual"; // Replace './virtualizer' with the actual import path

// Define a type for the scrolling container element
type MyScrollElement = HTMLDivElement;

// Define a type for the individual items in the list
type MyItemElement = HTMLDivElement;

// Define configuration options for the virtualizer
// Simulate a list of items (in practice, you would fetch these from a data source)
const items: string[] = Array.from(
  { length: 100 },
  (_, index) => `Item ${index + 1}`
);

const virtualizerOptions: PartialKeys<
  VirtualizerOptions<MyScrollElement, MyItemElement>,
  "observeElementRect" | "observeElementOffset" | "scrollToFn"
> = {
  count: items.length,
  getScrollElement: () => document.querySelector(".scroll-container")!,
  estimateSize: () => 50,
  // Specify other configuration options here if needed
};

// Create the virtualizer with the specified options
const myVirtualizer: Virtualizer<MyScrollElement, MyItemElement> =
  createVirtualizer(virtualizerOptions);

// Render the virtualized list
items.forEach((itemText, index) => {
  // Create a DOM element for each item
  const itemElement: MyItemElement = document.createElement("div");
  itemElement.textContent = itemText;
  itemElement.classList.add("list-item");

  // Append the item to the virtualizer
  myVirtualizer.append(itemElement);
});

// Append the virtualized list to the document body
document.body.appendChild(myVirtualizer.container);

// Ensure that the virtualizer updates its layout
myVirtualizer.updateLayout();

// Simulate a list of items (in practice, you would fetch these from a data source)
// const items: string[] = Array.from({ length: 100 }, (_, index) => `Item ${index + 1}`);

// Render the virtualized list
items.forEach((itemText, index) => {
  // Create a DOM element for each item
  const itemElement: MyItemElement = document.createElement("div");
  itemElement.textContent = itemText;
  itemElement.classList.add("list-item");

  // Append the item to the virtualizer
  myVirtualizer.append(itemElement);
});

// Append the virtualized list to the document body
document.body.appendChild(myVirtualizer.container);

// Ensure that the virtualizer updates its layout
myVirtualizer.updateLayout();
