import "./setup.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getPopularPackageNames,
  mergePackageSelection,
  popularPackageCategories,
} from "../../www/js/packages.js";

describe("popularPackageCategories", () => {
  it("groups common packages by category", () => {
    assert.ok(popularPackageCategories.length >= 5);
    assert.ok(
      popularPackageCategories.every((category) => category.packages.length > 0)
    );
  });

  it("replaces the network category with proxy tools", () => {
    const categoryIds = popularPackageCategories.map((category) => category.id);
    const proxyCategory = popularPackageCategories.find(
      (category) => category.id === "proxy"
    );

    assert.ok(!categoryIds.includes("network"));
    assert.ok(proxyCategory);
    assert.ok(
      proxyCategory.packages.some(
        (pkg) => pkg.name === "luci-app-openclash"
      )
    );
    assert.ok(
      proxyCategory.packages.some((pkg) => pkg.name === "luci-app-passwall")
    );
  });

  it("exposes a flattened package name list", () => {
    const names = getPopularPackageNames([
      { packages: [{ name: "a" }, { name: "b" }] },
      { packages: [{ name: "c" }] },
    ]);
    assert.deepEqual(names, ["a", "b", "c"]);
  });
});

describe("mergePackageSelection", () => {
  it("adds checked packages and removes unchecked known packages", () => {
    const text = "base luci-app-aria2 custom";
    const merged = mergePackageSelection(text, ["luci-app-ddns"], [
      "luci-app-aria2",
      "luci-app-ddns",
    ]);
    assert.equal(merged, "base custom luci-app-ddns");
  });

  it("keeps manually entered packages and package removals", () => {
    const merged = mergePackageSelection("base -ppp", ["luci-app-aria2"], [
      "luci-app-aria2",
    ]);
    assert.equal(merged, "base -ppp luci-app-aria2");
  });

  it("deduplicates package tokens", () => {
    const merged = mergePackageSelection(
      "base base custom custom",
      ["luci-app-aria2", "luci-app-aria2"],
      ["luci-app-aria2"]
    );
    assert.equal(merged, "base custom luci-app-aria2");
  });

  it("keeps selected popular packages in catalog order", () => {
    const merged = mergePackageSelection(
      "",
      ["luci-app-ddns", "luci-app-aria2"],
      ["luci-app-aria2", "luci-app-ddns"]
    );
    assert.equal(merged, "luci-app-aria2 luci-app-ddns");
  });
});
