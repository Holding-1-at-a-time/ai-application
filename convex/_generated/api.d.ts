/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as alert_detection from "../alert-detection.js";
import type * as alerts from "../alerts.js";
import type * as analytics from "../analytics.js";
import type * as assistant from "../assistant.js";
import type * as nlp from "../nlp.js";
import type * as reports from "../reports.js";
import type * as service_images from "../service-images.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "alert-detection": typeof alert_detection;
  alerts: typeof alerts;
  analytics: typeof analytics;
  assistant: typeof assistant;
  nlp: typeof nlp;
  reports: typeof reports;
  "service-images": typeof service_images;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
