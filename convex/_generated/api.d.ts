/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dashboard from "../dashboard.js";
import type * as datefix from "../datefix.js";
import type * as events from "../events.js";
import type * as explore from "../explore.js";
import type * as migrations from "../migrations.js";
import type * as registrations from "../registrations.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as users_bcp from "../users_bcp.js";
import type * as users_bcp2 from "../users_bcp2.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dashboard: typeof dashboard;
  datefix: typeof datefix;
  events: typeof events;
  explore: typeof explore;
  migrations: typeof migrations;
  registrations: typeof registrations;
  search: typeof search;
  seed: typeof seed;
  users: typeof users;
  users_bcp: typeof users_bcp;
  users_bcp2: typeof users_bcp2;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
