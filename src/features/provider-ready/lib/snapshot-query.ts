import { queryOptions } from "@tanstack/react-query";
import { getProviderSnapshot } from "./snapshot.functions";

export const providerSnapshotQueryOptions = queryOptions({
  queryKey: ["provider-snapshot"],
  queryFn: () => getProviderSnapshot(),
  staleTime: 30_000,
});
