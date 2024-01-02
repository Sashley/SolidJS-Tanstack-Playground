import { createEffect, createMemo, createSignal } from "solid-js";
import { faker } from "@faker-js/faker";

function App() {
  const [filter, setFilter] = createSignal("");
  const data = Array.from({ length: 200 }).map(() => ({
    name: faker.name.firstName(),
  }));

  const filteredData = createMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(filter().toLowerCase())
    );
  });

  function DebouncedInput({
    value,
    onChange,
    debounce = 3000,
    placeholder,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
    debounce?: number;
    placeholder?: string;
  }) {
    // const [filterValue, setFilterValue] = createSignal(value);

    createEffect(() => {
      console.log("filter: ", filter());
      const timeout = setTimeout(() => {
        onChange(filter());
        console.log("filter 2: ", filter());
      }, debounce);
      return () => clearTimeout(timeout);
    }, [filter]);

    return (
      <>
        <input
          {...props}
          value={filter()}
          onInput={(e) => setFilter(e.currentTarget.value)}
          placeholder={placeholder}
        />
        <div class="font-semibold m-2 bg-stone-200">{filter()}</div>
      </>
    );
  }

  return (
    <div class="p-2 bg-stone-300 m-4 text-sm">
      <div class="text-xs bg-orange-100 p-2 m-2">
        Note: Second, filtering attempt, additional fields, string only, extra
        added it, own state managment was the original issue. |
        /tables/filter02/simpleFilter01 | simpleFilter01
      </div>
      <div class="m-2">
        <h2>Filter Names</h2>
        <DebouncedInput
          value={filter()}
          onChange={setFilter}
          placeholder="Filter by name..."
        />
      </div>
      <div>
        <table class="m-4 text-xs">
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody class="h-32 overflow-y-auto">
            {filteredData().map((item) => (
              <tr>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
