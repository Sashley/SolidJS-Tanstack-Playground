// @refresh reload
import { Suspense } from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";

export default function Root() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <nav class="bg-sky-800">
              <ul class="container flex items-center p-3 text-gray-200">
                <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
                  <A href="/">Home</A>
                </li>
                <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
                  <A href="/about">About</A>
                </li>
                <li
                  class={`border-b-2 ${active("/tableBasic")} mx-1.5 sm:mx-6`}
                >
                  <A href="/tableBasic">TableBasic</A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/basic/index"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/basic/App">TableBasic02</A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/basic/tableBasicRoot"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/basic/tableBasicRoot">TableBasic03</A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/column-groups/rootColumnGroup01"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/column-groups/rootColumnGroup01">
                    ColumnGroup01
                  </A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/column-groups/rootColumnGroup02"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/column-groups/rootColumnGroup02">
                    ColumnGroup02
                  </A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tableBasicRoot"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tableBasicRoot">TableBasic04</A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/column-ordering/columnOrdering01"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/column-ordering/columnOrdering01">
                    ColumnOrdering01
                  </A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/column-visibility/visibility01"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/column-visibility/visibility01">
                    Visbility01
                  </A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/sorting/sorting01"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/sorting/sorting01">Sorting01</A>
                </li>
              </ul>
            </nav>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
