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
                  <A href="/tables/basic/App">TableBasic 02</A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tables/basic/tableBasicRoot"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tables/basic/tableBasicRoot">TableBasic 03</A>
                </li>
                <li
                  class={`border-b-2 ${active(
                    "/tableBasicRoot"
                  )} mx-1.5 sm:mx-6`}
                >
                  <A href="/tableBasicRoot">TableBasic 04</A>
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
