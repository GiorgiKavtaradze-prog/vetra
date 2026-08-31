import { renderStudio } from "sanity";
import studioConfig from "../../sanity.config.ts";

renderStudio(document.getElementById("sanity"), studioConfig, {
  reactStrictMode: false,
  basePath: "/",
});
