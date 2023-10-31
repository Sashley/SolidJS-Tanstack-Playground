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
import Layout from "./routes/layout/layout03";

export default function Root() {
  // const location = useLocation();
  // const active = (path: string) =>
  // path == location.pathname
  //   ? "border-stone-800"
  //   : "border-transparent hover:border-stone-800";
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart TanStack Tailwind</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="p-0">
        <Suspense>
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
