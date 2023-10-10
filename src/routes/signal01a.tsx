import { createSignal } from "solid-js";
const [count, setCount] = createSignal(0);
function increment() {
  setCount(count() + 1);
}
function decrement() {
  setCount(count() - 1);
}
export default function Counter() {
  return (
    <div class="text-lg m-4 bg-stone-100">
      <button onClick={decrement}>-</button>
      <span class="m-2">{count()}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
