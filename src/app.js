const STORAGE_KEY = "sdiDashboardProjects";

const seedProjects = [
  {
    name: "Zero Trust Segmentation",
    site: "Burns Harbor",
    owner: "A. Patel",
    status: "On Track",
    priority: "P1",
    risk: "Medium",
    startDate: "2024-10-01",
    endDate: "2025-03-15",
    budget: 1850000,
    lastUpdate: "2025-01-05",
  },
  {
    name: "SOC Modernization",
    site: "Sinton",
    owner: "M. Rivera",
    status: "At Risk",
    priority: "P1",
    risk: "High",
    startDate: "2024-09-20",
    endDate: "2025-02-28",
    budget: 2400000,
    lastUpdate: "2025-01-11",
  },
  {
    name: "Identity Lifecycle Refresh",
    site: "Columbus",
    owner: "L. Chang",
    status: "On Track",
    priority: "P2",
    risk: "Low",
    startDate: "2024-11-15",
    endDate: "2025-05-10",
    budget: 820000,
    lastUpdate: "2025-01-08",
  },
  {
    name: "OT Asset Discovery",
    site: "Roanoke",
    owner: "E. Wilson",
    status: "Delayed",
    priority: "P1",
    risk: "Critical",
    startDate: "2024-08-10",
    endDate: "2024-12-20",
    budget: 1260000,
    lastUpdate: "2025-01-02",
  },
  {
    name: "Cloud Access Posture",
    site: "Burns Harbor",
    owner: "R. Ahmed",
    status: "On Track",
    priority: "P2",
    risk: "Medium",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    budget: 640000,
    lastUpdate: "2025-01-12",
  },
  {
    name: "Email Threat Defense",
    site: "Sinton",
    owner: "S. Greene",
    status: "Complete",
    priority: "P3",
    risk: "Low",
    startDate: "2024-05-01",
    endDate: "2024-11-30",
    budget: 310000,
    lastUpdate: "2024-12-02",
  },
  {
    name: "HQ Governance Playbook",
    site: "Headquarters",
    owner: "T. Brooks",
    status: "On Track",
    priority: "P2",
    risk: "Low",
    startDate: "2024-11-05",
    endDate: "2025-02-20",
    budget: 220000,
    lastUpdate: "2025-01-09",
  },
  {
    name: "Network Segmentation Phase 2",
    site: "Columbus",
    owner: "D. Lewis",
    status: "At Risk",
    priority: "P1",
    risk: "High",
    startDate: "2024-07-15",
    endDate: "2025-01-25",
    budget: 1980000,
    lastUpdate: "2025-01-10",
  },
  {
    name: "Physical Access Hardening",
    site: "Roanoke",
    owner: "G. Torres",
    status: "On Track",
    priority: "P3",
    risk: "Medium",
    startDate: "2024-10-20",
    endDate: "2025-04-05",
    budget: 410000,
    lastUpdate: "2025-01-04",
  },
  {
    name: "Vendor Risk Remediation",
    site: "Headquarters",
    owner: "K. Singh",
    status: "On Track",
    priority: "P2",
    risk: "Medium",
    startDate: "2024-09-12",
    endDate: "2025-03-08",
    budget: 560000,
    lastUpdate: "2025-01-06",
  },
  {
    name: "Data Loss Prevention",
    site: "Sinton",
    owner: "J. Howard",
    status: "Delayed",
    priority: "P1",
    risk: "High",
    startDate: "2024-06-10",
    endDate: "2024-12-10",
    budget: 1440000,
    lastUpdate: "2025-01-03",
  },
  {
    name: "BCP Tabletop Exercise",
    site: "Columbus",
    owner: "N. Carter",
    status: "Complete",
    priority: "P3",
    risk: "Low",
    startDate: "2024-08-01",
    endDate: "2024-10-15",
    budget: 95000,
    lastUpdate: "2024-10-20",
  },
];

let projects = loadProjects();

const siteFilter = document.getElementById("siteFilter");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const riskFilter = document.getElementById("riskFilter");
const deadlineStart = document.getElementById("deadlineStart");
const deadlineEnd = document.getElementById("deadlineEnd");
const searchInput = document.getElementById("searchInput");
const resetFilters = document.getElementById("resetFilters");
const projectTable = document.getElementById("projectTable");
const summaryGrid = document.getElementById("summaryGrid");
const siteGrid = document.getElementById("siteGrid");
const tableMeta = document.getElementById("tableMeta");
const lastSync = document.getElementById("lastSync");
const addProjectButton = document.getElementById("addProject");
const exportDataButton = document.getElementById("exportData");
const importFileInput = document.getElementById("importFile");
const projectModal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalButton = document.getElementById("closeModal");
const cancelModalButton = document.getElementById("cancelModal");
const projectForm = document.getElementById("projectForm");
const projectIdInput = document.getElementById("projectId");
const projectNameInput = document.getElementById("projectName");
const projectSiteInput = document.getElementById("projectSite");
const projectOwnerInput = document.getElementById("projectOwner");
const projectStatusInput = document.getElementById("projectStatus");
const projectPriorityInput = document.getElementById("projectPriority");
const projectRiskInput = document.getElementById("projectRisk");
const projectStartInput = document.getElementById("projectStart");
const projectEndInput = document.getElementById("projectEnd");
const projectBudgetInput = document.getElementById("projectBudget");
const projectUpdateInput = document.getElementById("projectUpdate");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const statusClassMap = {
  "On Track": "status-on-track",
  "At Risk": "status-at-risk",
  Delayed: "status-delayed",
  Complete: "status-complete",
};

const riskClassMap = {
  Low: "risk-low",
  Medium: "risk-medium",
  High: "risk-high",
  Critical: "risk-critical",
};

function parseDate(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function formatDate(value) {
  if (!value) {
    return "--";
  }
  return dateFormatter.format(parseDate(value));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function generateId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeProject(project) {
  const safeProject = project || {};
  return {
    id: safeProject.id || generateId(),
    name: String(safeProject.name || "").trim(),
    site: String(safeProject.site || "").trim(),
    owner: String(safeProject.owner || "").trim(),
    status: safeProject.status || "On Track",
    priority: safeProject.priority || "P2",
    risk: safeProject.risk || "Medium",
    startDate: safeProject.startDate || todayISO(),
    endDate: safeProject.endDate || todayISO(),
    budget: Number(safeProject.budget) || 0,
    lastUpdate: safeProject.lastUpdate || todayISO(),
  };
}

function normalizeProjects(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((project) => normalizeProject(project));
}

function loadProjects() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return normalizeProjects(seedProjects);
  }

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return normalizeProjects(parsed);
    }
  } catch (error) {
    console.warn("Failed to parse stored projects.", error);
  }

  return normalizeProjects(seedProjects);
}

function saveProjects() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function setProjects(nextProjects) {
  projects = normalizeProjects(nextProjects);
  saveProjects();
  refreshFilters();
  updateLastSync();
  renderDashboard();
}

function getLatestSyncDate() {
  if (!projects.length) {
    return null;
  }

  return projects.reduce((max, project) => {
    const date = parseDate(project.lastUpdate);
    if (!date || Number.isNaN(date.getTime())) {
      return max;
    }
    return date > max ? date : max;
  }, new Date(0));
}

function updateLastSync() {
  const latestSync = getLatestSyncDate();
  if (!latestSync || Number.isNaN(latestSync.getTime())) {
    lastSync.textContent = "--";
    return;
  }

  lastSync.textContent = latestSync.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildSelectOptions(select, options, label, selectedValue) {
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = label;
  select.append(defaultOption);

  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    select.append(element);
  });

  if (selectedValue && options.includes(selectedValue)) {
    select.value = selectedValue;
  }
}

function uniqueValues(key) {
  return Array.from(new Set(projects.map((project) => project[key]))).sort();
}

function refreshFilters() {
  const currentSelections = {
    site: siteFilter.value,
    status: statusFilter.value,
    priority: priorityFilter.value,
    risk: riskFilter.value,
  };

  buildSelectOptions(siteFilter, uniqueValues("site"), "All sites", currentSelections.site);
  buildSelectOptions(
    statusFilter,
    uniqueValues("status"),
    "All statuses",
    currentSelections.status
  );
  buildSelectOptions(
    priorityFilter,
    uniqueValues("priority"),
    "All priorities",
    currentSelections.priority
  );
  buildSelectOptions(riskFilter, uniqueValues("risk"), "All risks", currentSelections.risk);
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const start = parseDate(deadlineStart.value);
  const end = parseDate(deadlineEnd.value);

  return projects.filter((project) => {
    if (siteFilter.value && project.site !== siteFilter.value) {
      return false;
    }

    if (statusFilter.value && project.status !== statusFilter.value) {
      return false;
    }

    if (priorityFilter.value && project.priority !== priorityFilter.value) {
      return false;
    }

    if (riskFilter.value && project.risk !== riskFilter.value) {
      return false;
    }

    if (searchTerm) {
      const haystack = `${project.name} ${project.owner}`.toLowerCase();
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    const endDate = parseDate(project.endDate);
    if (start && endDate < start) {
      return false;
    }

    if (end && endDate > end) {
      return false;
    }

    return true;
  });
}

function renderSummary(filteredProjects) {
  const total = filteredProjects.length;
  const onTrack = filteredProjects.filter((project) => project.status === "On Track").length;
  const atRisk = filteredProjects.filter((project) =>
    ["At Risk", "Delayed"].includes(project.status)
  ).length;
  const today = new Date();
  const overdue = filteredProjects.filter((project) => {
    const endDate = parseDate(project.endDate);
    return endDate < today && project.status !== "Complete";
  }).length;
  const budgetAtRisk = filteredProjects
    .filter((project) => ["High", "Critical"].includes(project.risk))
    .reduce((sum, project) => sum + project.budget, 0);

  const summaryCards = [
    { label: "Total initiatives", value: total },
    { label: "On track", value: onTrack },
    { label: "At risk", value: atRisk },
    { label: "Overdue", value: overdue },
    { label: "Budget at risk", value: currencyFormatter.format(budgetAtRisk) },
  ];

  summaryGrid.innerHTML = "";
  summaryCards.forEach((card) => {
    const div = document.createElement("div");
    div.className = "summary-card";
    div.innerHTML = `<p>${card.label}</p><h3>${card.value}</h3>`;
    summaryGrid.append(div);
  });
}

function renderSites(filteredProjects) {
  const sites = filteredProjects.reduce((accumulator, project) => {
    if (!accumulator[project.site]) {
      accumulator[project.site] = { total: 0, atRisk: 0 };
    }
    accumulator[project.site].total += 1;
    if (["At Risk", "Delayed"].includes(project.status)) {
      accumulator[project.site].atRisk += 1;
    }
    return accumulator;
  }, {});

  siteGrid.innerHTML = "";
  const entries = Object.entries(sites);
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "site-empty";
    empty.textContent = "No sites match the current filters.";
    siteGrid.append(empty);
    return;
  }

  entries.forEach(([site, metrics]) => {
    const div = document.createElement("div");
    div.className = "site-card";
    const riskRatio = metrics.total ? (metrics.total - metrics.atRisk) / metrics.total : 0;
    div.innerHTML = `
      <h4>${site}</h4>
      <div class="site-metrics">
        <span>${metrics.total} active</span>
        <span>${metrics.atRisk} at risk</span>
      </div>
      <div class="site-bar">
        <span style="width: ${Math.max(10, riskRatio * 100)}%"></span>
      </div>
    `;
    siteGrid.append(div);
  });
}

function renderTable(filteredProjects) {
  projectTable.innerHTML = "";

  if (!filteredProjects.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="11">No projects match the current filters.</td>`;
    projectTable.append(row);
    tableMeta.textContent = "0 projects shown";
    return;
  }

  filteredProjects.forEach((project) => {
    const statusClass = statusClassMap[project.status] || "status-on-track";
    const riskClass = riskClassMap[project.risk] || "risk-low";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${project.name}</td>
      <td>${project.site}</td>
      <td>${project.owner}</td>
      <td><span class="badge ${statusClass}">${project.status}</span></td>
      <td>${project.priority}</td>
      <td><span class="badge ${riskClass}">${project.risk}</span></td>
      <td>${formatDate(project.startDate)}</td>
      <td>${formatDate(project.endDate)}</td>
      <td>${currencyFormatter.format(project.budget)}</td>
      <td>${formatDate(project.lastUpdate)}</td>
      <td>
        <div class="row-actions">
          <button class="text-button" data-action="edit" data-id="${project.id}">Edit</button>
          <button class="text-button danger" data-action="delete" data-id="${project.id}">
            Delete
          </button>
        </div>
      </td>
    `;
    projectTable.append(row);
  });

  tableMeta.textContent = `${filteredProjects.length} of ${projects.length} projects shown`;
}

function renderDashboard() {
  const filteredProjects = applyFilters();
  renderSummary(filteredProjects);
  renderSites(filteredProjects);
  renderTable(filteredProjects);
}

function resetAllFilters() {
  siteFilter.value = "";
  statusFilter.value = "";
  priorityFilter.value = "";
  riskFilter.value = "";
  deadlineStart.value = "";
  deadlineEnd.value = "";
  searchInput.value = "";
  renderDashboard();
}

function openModal(project) {
  projectForm.reset();
  const isEdit = Boolean(project);
  modalTitle.textContent = isEdit ? "Edit project" : "Add project";
  projectIdInput.value = project?.id || "";
  projectNameInput.value = project?.name || "";
  projectSiteInput.value = project?.site || "";
  projectOwnerInput.value = project?.owner || "";
  projectStatusInput.value = project?.status || "On Track";
  projectPriorityInput.value = project?.priority || "P2";
  projectRiskInput.value = project?.risk || "Medium";
  projectStartInput.value = project?.startDate || todayISO();
  projectEndInput.value = project?.endDate || todayISO();
  projectBudgetInput.value = project?.budget || 0;
  projectUpdateInput.value = project?.lastUpdate || todayISO();

  projectModal.classList.add("is-open");
  projectModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  projectModal.classList.remove("is-open");
  projectModal.setAttribute("aria-hidden", "true");
}

function handleSaveProject(event) {
  event.preventDefault();
  const id = projectIdInput.value;
  const payload = {
    id: id || generateId(),
    name: projectNameInput.value.trim(),
    site: projectSiteInput.value.trim(),
    owner: projectOwnerInput.value.trim(),
    status: projectStatusInput.value,
    priority: projectPriorityInput.value,
    risk: projectRiskInput.value,
    startDate: projectStartInput.value,
    endDate: projectEndInput.value,
    budget: Number(projectBudgetInput.value),
    lastUpdate: projectUpdateInput.value || todayISO(),
  };

  if (id) {
    const nextProjects = projects.map((project) =>
      project.id === id ? { ...project, ...payload } : project
    );
    setProjects(nextProjects);
  } else {
    setProjects([payload, ...projects]);
  }

  closeModal();
}

function findProjectById(id) {
  return projects.find((project) => project.id === id);
}

function handleRowActions(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (action === "edit") {
    openModal(findProjectById(id));
    return;
  }

  if (action === "delete") {
    const target = findProjectById(id);
    if (!target) {
      return;
    }

    const confirmed = window.confirm(`Delete project "${target.name}"?`);
    if (!confirmed) {
      return;
    }

    setProjects(projects.filter((project) => project.id !== id));
  }
}

function handleExport() {
  const payload = JSON.stringify(projects, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sdi-projects.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) {
        window.alert("Import failed: expected a JSON array of projects.");
        return;
      }
      setProjects(parsed);
    } catch (error) {
      window.alert("Import failed: invalid JSON.");
    } finally {
      importFileInput.value = "";
    }
  };
  reader.readAsText(file);
}

function initialize() {
  refreshFilters();
  updateLastSync();

  [
    siteFilter,
    statusFilter,
    priorityFilter,
    riskFilter,
    deadlineStart,
    deadlineEnd,
    searchInput,
  ].forEach((element) => {
    element.addEventListener("input", renderDashboard);
  });

  resetFilters.addEventListener("click", resetAllFilters);
  addProjectButton.addEventListener("click", () => openModal());
  closeModalButton.addEventListener("click", closeModal);
  cancelModalButton.addEventListener("click", closeModal);
  projectModal.addEventListener("click", (event) => {
    if (event.target === projectModal) {
      closeModal();
    }
  });
  projectForm.addEventListener("submit", handleSaveProject);
  projectTable.addEventListener("click", handleRowActions);
  exportDataButton.addEventListener("click", handleExport);
  importFileInput.addEventListener("change", handleImport);

  renderDashboard();
}

initialize();
