import { $, $$, split } from "./utils.js";

export const popularPackageCategories = [
  {
    id: "network",
    title: "Network",
    titleKey: "tr-plugin-category-network",
    packages: [
      { name: "luci-app-turboacc", label: "Turbo ACC" },
      { name: "luci-app-mwan3", label: "MWAN3" },
      { name: "luci-app-qosmate", label: "QoSmate" },
      { name: "luci-app-sqm-autorate", label: "SQM Autorate" },
      { name: "luci-app-nlbwmon", label: "Bandwidth Monitor" },
      { name: "luci-app-easymesh", label: "EasyMesh" },
    ],
  },
  {
    id: "remote",
    title: "Remote Access",
    titleKey: "tr-plugin-category-remote",
    packages: [
      { name: "luci-app-wireguard", label: "WireGuard" },
      { name: "luci-app-openvpn-server-client", label: "OpenVPN" },
      { name: "luci-app-zerotier", label: "ZeroTier" },
      { name: "luci-app-tailscale-community", label: "Tailscale" },
      { name: "luci-app-frpc", label: "FRP Client" },
      { name: "luci-app-natmap", label: "NATMap" },
    ],
  },
  {
    id: "dns",
    title: "DNS & Security",
    titleKey: "tr-plugin-category-dns",
    packages: [
      { name: "luci-app-adguardhome", label: "AdGuard Home" },
      { name: "luci-app-smartdns", label: "SmartDNS" },
      { name: "luci-app-mosdns", label: "MosDNS" },
      { name: "luci-app-ddns", label: "DDNS" },
      { name: "luci-app-acme", label: "ACME" },
      { name: "luci-app-arpbind", label: "ARP Bind" },
    ],
  },
  {
    id: "storage",
    title: "Storage & NAS",
    titleKey: "tr-plugin-category-storage",
    packages: [
      { name: "luci-app-samba4", label: "Samba4" },
      { name: "luci-app-ksmbd", label: "Ksmbd" },
      { name: "luci-app-diskman", label: "DiskMan" },
      { name: "luci-app-filebrowser", label: "File Browser" },
      { name: "luci-app-openlist2", label: "OpenList" },
      { name: "luci-app-rclone", label: "Rclone" },
    ],
  },
  {
    id: "downloads",
    title: "Downloads & Media",
    titleKey: "tr-plugin-category-downloads",
    packages: [
      { name: "luci-app-aria2", label: "Aria2" },
      { name: "luci-app-qbittorrent", label: "qBittorrent" },
      { name: "luci-app-transmission", label: "Transmission" },
      { name: "luci-app-minidlna", label: "MiniDLNA" },
      { name: "luci-app-p910nd", label: "USB Printer" },
      { name: "luci-app-aliyundrive-webdav", label: "Aliyun WebDAV" },
    ],
  },
  {
    id: "system",
    title: "System & UI",
    titleKey: "tr-plugin-category-system",
    packages: [
      { name: "luci-app-ttyd", label: "TTYD" },
      { name: "luci-app-dockerman", label: "DockerMan" },
      { name: "luci-app-statistics", label: "Statistics" },
      { name: "luci-app-watchcat", label: "Watchcat" },
      { name: "luci-app-timedreboot", label: "Timed Reboot" },
      { name: "luci-theme-argon", label: "Argon Theme" },
    ],
  },
];

function packageInputId(packageName) {
  return `package-${packageName.replace(/[^a-z0-9]+/gi, "-")}`;
}

export function getPopularPackageNames(
  categories = popularPackageCategories
) {
  return categories.flatMap((category) =>
    category.packages.map((pkg) => pkg.name)
  );
}

export function mergePackageSelection(
  packageText,
  selectedPackages,
  knownPackages = getPopularPackageNames()
) {
  const selected = new Set(selectedPackages);
  const known = new Set(knownPackages);
  const seen = new Set();
  const result = [];

  for (const pkg of split(packageText)) {
    if (known.has(pkg) || seen.has(pkg)) {
      continue;
    }
    seen.add(pkg);
    result.push(pkg);
  }

  for (const pkg of knownPackages) {
    if (!selected.has(pkg) || seen.has(pkg)) {
      continue;
    }
    seen.add(pkg);
    result.push(pkg);
  }

  return result.join(" ");
}

function updatePackageOptionState(checkbox) {
  const option = checkbox.closest(".package-option");
  if (!option) {
    return;
  }
  option.classList.toggle("is-selected", checkbox.checked);
}

function createPackageOption(pkg) {
  const checkboxId = packageInputId(pkg.name);
  const option = document.createElement("label");
  option.className = "package-option";
  option.setAttribute("for", checkboxId);

  const checkbox = document.createElement("input");
  checkbox.id = checkboxId;
  checkbox.className = "package-checkbox";
  checkbox.type = "checkbox";
  checkbox.dataset.package = pkg.name;

  const body = document.createElement("span");
  body.className = "package-option__body";

  const label = document.createElement("span");
  label.className = "package-option__label";
  label.innerText = pkg.label;

  const name = document.createElement("code");
  name.innerText = pkg.name;

  body.appendChild(label);
  body.appendChild(name);
  option.appendChild(checkbox);
  option.appendChild(body);
  return option;
}

function createPackageCategory(category) {
  const section = document.createElement("section");
  section.className = "plugin-category";
  section.dataset.category = category.id;

  const header = document.createElement("div");
  header.className = "plugin-category__header";

  const title = document.createElement("h5");
  title.className = category.titleKey;
  title.innerText = category.title;

  const count = document.createElement("span");
  count.className = "plugin-category__count";
  count.innerText = category.packages.length;

  const grid = document.createElement("div");
  grid.className = "package-grid";

  for (const pkg of category.packages) {
    grid.appendChild(createPackageOption(pkg));
  }

  header.appendChild(title);
  header.appendChild(count);
  section.appendChild(header);
  section.appendChild(grid);
  return section;
}

export function renderPackageShortcuts(
  container = $("#package-shortcuts"),
  categories = popularPackageCategories
) {
  if (!container) {
    return;
  }

  container.textContent = "";
  for (const category of categories) {
    container.appendChild(createPackageCategory(category));
  }
}

function getPackageCheckboxes(container = $("#package-shortcuts")) {
  if (!container || typeof container.querySelectorAll !== "function") {
    return [];
  }
  return Array.from(container.querySelectorAll(".package-checkbox"));
}

function getSelectedPackages(container = $("#package-shortcuts")) {
  return getPackageCheckboxes(container)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.dataset.package);
}

export function syncPackageShortcutsFromTextarea(
  textarea = $("#asu-packages"),
  container = $("#package-shortcuts")
) {
  if (!textarea || !container) {
    return;
  }

  const packageSet = new Set(split(textarea.value));
  for (const checkbox of getPackageCheckboxes(container)) {
    checkbox.checked = packageSet.has(checkbox.dataset.package);
    updatePackageOptionState(checkbox);
  }
}

export function syncTextareaFromPackageShortcuts(
  textarea = $("#asu-packages"),
  container = $("#package-shortcuts")
) {
  if (!textarea || !container) {
    return;
  }

  textarea.value = mergePackageSelection(
    textarea.value,
    getSelectedPackages(container)
  );
  syncPackageShortcutsFromTextarea(textarea, container);
}

export function setupPackageShortcuts() {
  const container = $("#package-shortcuts");
  const textarea = $("#asu-packages");
  if (!container || !textarea) {
    return;
  }

  renderPackageShortcuts(container);
  container.addEventListener("change", (event) => {
    if (!event.target.classList.contains("package-checkbox")) {
      return;
    }
    syncTextareaFromPackageShortcuts(textarea, container);
  });
  textarea.addEventListener("input", () => {
    syncPackageShortcutsFromTextarea(textarea, container);
  });
  syncPackageShortcutsFromTextarea(textarea, container);
}
