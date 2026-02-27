import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { StudioLayout } from "@/components/layout/studio-layout";
import { ModelDataView } from "@/components/models/model-data-view";
import { ModelHome } from "@/components/models/model-home";
import { ModelVisualizeView } from "@/components/visualize/model-visualize-view";
import { StudioProvider } from "@/providers/studio-provider";

const rootRoute = createRootRoute({
  component: StudioLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ModelHome,
});

const modelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/models/$modelName",
  component: ModelDataView,
});

const visualizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/visualize",
  component: ModelVisualizeView,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  modelRoute,
  visualizeRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <StudioProvider>
      <RouterProvider router={router} />
    </StudioProvider>
  );
}

export default App;
