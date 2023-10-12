import {
  useLocation,
  A,
} from "solid-start";
import "../../../root.css";

export default function menuItems() {
  const location = useLocation();
  const active = (path) =>
    path === location.pathname
      ? "border-stone-600"
      : "border-transparent hover:border-stone-600";

  const menuData = [
    { path: "/", title: "Home" },
    { path: "/about", title: "About" },
    { path: "/tables/basic/index", title: "TableBasic" },
    { path: "/tables/basic/index", title: "TableBasic02" },
    { path: "/tables/basic/tableBasicRoot", title: "TableBasic03" },
    { path: "/tables/column-groups/rootColumnGroup01", title: "ColumnGroup01" },
    { path: "/tables/column-groups/rootColumnGroup02", title: "ColumnGroup02" },
    { path: "/tableBasicRoot", title: "TableBasic04" },
    { path: "/tables/column-ordering/columnOrdering01", title: "ColumnOrdering01" },
    { path: "/tables/column-visibility/visibility01", title: "Visbility01" },
    { path: "/tables/sorting/App", title: "Layout Example 02" },
    { path: "/tables/sorting/sorting01", title: "Sorting01" },
    { path: "/tables/filter01/filter", title: "Filter01" },
    { path: "/tables/filter01/filter03a", title: "Filter03a" },
    { path: "/tables/filter01/filter03d", title: "Filter03d", hasSeparator: true },
    { path: "/trial/signal01", title: "Signal01" },
    // { path: "/tables/filter01/filter03d", title: "Signal01" },
    { path: "/tables/filter01/filter03d1", title: "Filter03d1" },
    { path: "/tables/filter01/filter03d2", title: "Filter03d2" },
    { path: "/tables/filterDebounce/filter03d2", title: "Filter03d2 debouncePlay" },
    { path: "/tables/filter01/filter03d", title: "Filter03d" },
    { path: "/tables/filter01/filter03d", title: "Filter03d" },
  ];

  return (
    <>
      {menuData.map(item => (
        <>
          {item.hasSeparator && (
            <div class="border-b border-gray-300 my-2"></div>
          )}
          <div class={`py-1 px-2 ${active(item.path)} hover:bg-stone-100 hover:text-stone-800 hover:p-2 hover:font-bold rounded-md`}>
            <A href={item.path}>{item.title}</A>
          </div>
        </>
      ))}
    </>
  );
}
