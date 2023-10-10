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
    <div class="text-lg m-8">
      <div class="text-xs bg-stone-100 p-2 m-2">
        Note: basic signal | /trial/signal01 | Signal01
      </div>
      <div class="m-4  p-4 bg-stone-200">
        <button onClick={decrement}>-</button>
        <span class="m-2">{count()}</span>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}
