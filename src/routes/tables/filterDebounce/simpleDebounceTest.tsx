import { createEffect, createSignal, onCleanup } from "solid-js";
const [showInput, setShowInput] = createSignal(true);

function App() {
  return (
    <div class="bg-stone-100 m-4 p-2 text-sm rounded-lg">
      <h1 class="font-semibold text-stone-800">Debounced Input Test</h1>
      <div class="m-2 bg-stone-50">
        {showInput() && (
          <DebouncedInput
            value=""
            onChange={(value) => {
              console.log("Debounced Input Value:", value);
            }}
          />
        )}
        <div class="m-2">
          <button
            class="bg-stone-500 text-stone-50 p-2 m-4 rounded-lg"
            onClick={() => setShowInput(!showInput())}
          >
            Toggle Input
          </button>
        </div>
      </div>
    </div>
  );
}

type DebouncedInputProps = {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
};

function DebouncedInput({
  value,
  onChange,
  debounce = 2000,
}: DebouncedInputProps) {
  const [immediateValue, setImmediateValue] = createSignal(value);
  const [debouncedValue, setDebouncedValue] = createSignal(value);

  console.log("initialised");

  createEffect(() => {
    console.log(
      "Effect started based on immediateValue change",
      immediateValue()
    );
    const currentImmediateValue = immediateValue();
    const timeout = setTimeout(() => {
      // const currentImmediateValue = immediateValue();
      if (currentImmediateValue !== debouncedValue()) {
        console.log("Detected a change after debounce!");
        setDebouncedValue(currentImmediateValue);
        onChange(currentImmediateValue);
      }
    }, debounce);

    return () => {
      console.log("Effect cleanup");
      clearTimeout(timeout);
    };
  });

  return (
    <input
      value={immediateValue()}
      onInput={(e) => {
        console.log("Input changed: ", e.currentTarget.value);
        setImmediateValue(e.currentTarget.value);
        console.log("immediateValue: ", immediateValue());
      }}
      class="bg-stone-300"
    />
  );
}

export default App;
