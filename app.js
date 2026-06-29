const STORAGE_KEY = "magasin-clone-state-v4";
const USERS_STORAGE_KEY = "magasin-users-v1";
const AUTH_STORAGE_KEY = "magasin-auth-session";

// ======= DEVICE DETECTION SYSTEM =======
let deviceType = "desktop"; // "mobile", "tablet", "desktop"
let screenWidth = 0;
let screenHeight = 0;

function detectDevice() {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  
  // Détection basée sur la taille de l'écran
  if (screenWidth < 600) {
    deviceType = "mobile";
  } else if (screenWidth < 1024) {
    deviceType = "tablet";
  } else {
    deviceType = "desktop";
  }
  
  // Ajouter la classe au body pour le CSS
  document.body.className = document.body.className.replace(/device-\w+/g, '');
  document.body.classList.add(`device-${deviceType}`);
  
  // Optionnel: Détection aussi par user agent
  const ua = navigator.userAgent.toLowerCase();
  const isPhone = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTablet = /ipad|android/.test(ua) && !/mobile/.test(ua);
  
  if (isPhone && screenWidth < 600) {
    deviceType = "mobile";
  } else if (isTablet) {
    deviceType = "tablet";
  }
  
  return deviceType;
}

function isMobile() {
  return deviceType === "mobile";
}

function isTablet() {
  return deviceType === "tablet";
}

function isDesktop() {
  return deviceType === "desktop";
}

// ======= AUTHENTICATION SYSTEM =======
let currentUser = null;

function initializeUsers() {
  const existing = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existing) {
    const defaultUsers = {
      admin: { username: "admin", password: "1234", role: "admin", createdAt: new Date().toISOString() }
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  }
}

function getUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const auth = localStorage.getItem(AUTH_STORAGE_KEY);
  return auth ? JSON.parse(auth) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    currentUser = user;
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    currentUser = null;
  }
}

function login(username, password) {
  const users = getUsers();
  const user = Object.values(users).find(u => u.username === username);
  if (user && user.password === password) {
    setCurrentUser({ username: user.username, role: user.role });
    return true;
  }
  return false;
}

function logout() {
  setCurrentUser(null);
}

function createCaisseUser(username, password, isAdmin = false) {
  const users = getUsers();
  if (Object.values(users).find(u => u.username === username)) {
    return { success: false, message: "Utilisateur existe déjà" };
  }
  const newKey = Date.now().toString();
  users[newKey] = {
    username,
    password,
    role: isAdmin ? "admin" : "caisse",
    createdAt: new Date().toISOString()
  };
  saveUsers(users);
  return { success: true, message: "Utilisateur créé avec succès" };
}

function changePassword(username, currentPassword, newPassword) {
  const users = getUsers();
  const user = Object.values(users).find(u => u.username === username);
  if (!user || user.password !== currentPassword) {
    return { success: false, message: "Mot de passe actuel incorrect" };
  }
  user.password = newPassword;
  saveUsers(users);
  return { success: true, message: "Mot de passe changé avec succès" };
}

function deleteUser(username) {
  if (username === "admin") {
    return { success: false, message: "Impossible de supprimer l'admin" };
  }
  const users = getUsers();
  const key = Object.keys(users).find(k => users[k].username === username);
  if (key) {
    delete users[key];
    saveUsers(users);
    return { success: true, message: "Utilisateur supprimé" };
  }
  return { success: false, message: "Utilisateur non trouvé" };
}

function isAdmin() {
  return currentUser && currentUser.role === "admin";
}

const state = {
  module: "stock",
  search: "",
  approLines: [],
  approMode: "creation",
  approFilter: "",
  selectedId: "",
  onlyCommand: false,
  editMode: true,
  history: []
};

const modules = {
  stock: {
    title: "Stock",
    actions: ["Appro", "Modif", "Print", "Suppr", "Histo", "Transf", "Entree"],
    icons: ["⊕", "✎", "🖨", "✂", "☰", "⇄", "◔"],
    columns: [
      { key: "reference", label: "Reference" },
      { key: "designation", label: "Designation" },
      { key: "marque", label: "Marque" },
      { key: "magasin", label: "Magasin", numeric: true },
      { key: "depot", label: "Depot", numeric: true },
      { key: "achat", label: "Prix d'achat", currency: true },
      { key: "vente", label: "Prix de vente", currency: true },
      { key: "stock", label: "Stock total", numeric: true }
    ],
    rows: [
      { reference: "GJ", designation: "GRAISSE JAUNE", marque: "", magasin: 0, depot: 0, achat: 13000, vente: 16000, stock: 0 },
      { reference: "4KGF", designation: "LUCKY COLORS 4KG FONCE", marque: "", magasin: -6, depot: 0, achat: 16000, vente: 20000, stock: -6 },
      { reference: "63", designation: "TUBE ROND INOX 63", marque: "", magasin: -6, depot: 0, achat: 130000, vente: 160000, stock: -6 },
      { reference: "I20/20", designation: "INOX C 20/20", marque: "", magasin: 0, depot: 0, achat: 35000, vente: 40000, stock: 0 },
      { reference: "P660", designation: "POINTE BETON 60", marque: "", magasin: 410, depot: 0, achat: 62, vente: 150, stock: 410 },
      { reference: "LO", designation: "CIMENT LOVA", marque: "", magasin: -183.59, depot: 0, achat: 33800, vente: 34500, stock: -183.59 },
      { reference: "A0.142M", designation: "TOLES ALU 0.14 2M", marque: "", magasin: 23, depot: 0, achat: 14900, vente: 17000, stock: 23 },
      { reference: "R 5X20", designation: "RIVET 5X20", marque: "", magasin: 228.16, depot: 0, achat: 4200, vente: 6500, stock: 228.16 }
    ]
  },
  client: {
    title: "Client",
    actions: ["Nouveau", "Modif", "Print", "Suppr", "Encaisser", "Histo"],
    icons: ["⊕", "✎", "🖨", "✂", "🧾", "☰"],
    columns: [
      { key: "client", label: "Client" },
      { key: "compte", label: "Compte", currency: true },
      { key: "echeance", label: "Acheance" },
      { key: "adresse", label: "Adresse" },
      { key: "contact", label: "Contact" },
      { key: "courriel", label: "Couriel" }
    ],
    rows: [
      { client: "0040 RIVO", compte: 589300, echeance: "19/07/2026", adresse: "", contact: "", courriel: "" },
      { client: "1615 RAHERY", compte: 837000, echeance: "03/06/2026", adresse: "", contact: "", courriel: "" },
      { client: "2917TBP MR RICHARD", compte: 0, echeance: "28/01/2026", adresse: "", contact: "", courriel: "" },
      { client: "6927TBU", compte: 0, echeance: "16/04/2025", adresse: "", contact: "0339085055", courriel: "" },
      { client: "AXOR DADAN FENO", compte: 972300, echeance: "16/07/2026", adresse: "", contact: "", courriel: "" }
    ]
  },
  fournisseur: {
    title: "Fournisseur",
    actions: ["Nouveau", "Modif", "Print", "Suppr", "Payer", "Histo"],
    icons: ["⊕", "✎", "🖨", "✂", "🧾", "☰"],
    columns: [
      { key: "fournisseur", label: "Fournisseur" },
      { key: "compte", label: "Compte", currency: true },
      { key: "echeance", label: "Echeance" },
      { key: "adresse", label: "Adresse" },
      { key: "contact", label: "Contact" },
      { key: "courriel", label: "Couriel" }
    ],
    rows: [
      { fournisseur: "67HA", compte: 0, echeance: "", adresse: "", contact: "", courriel: "" },
      { fournisseur: "AS METAL", compte: 7040000, echeance: "17/07/2026", adresse: "", contact: "", courriel: "" },
      { fournisseur: "ATM", compte: 20045000, echeance: "18/07/2026", adresse: "", contact: "", courriel: "" },
      { fournisseur: "BRICOFER", compte: 18666474, echeance: "03/08/2026", adresse: "", contact: "", courriel: "" },
      { fournisseur: "JR METAUX", compte: 31257600, echeance: "07/06/2026", adresse: "", contact: "", courriel: "" },
      { fournisseur: "KAPCI", compte: 69437101, echeance: "19/07/2026", adresse: "", contact: "", courriel: "" }
    ]
  },
  decaissement: {
    title: "Decaissement",
    actions: ["Nouveau", "Modif", "Print", "Suppr", "Valider", "Histo"],
    icons: ["⊕", "✎", "🖨", "✂", "✔", "☰"],
    columns: [
      { key: "date", label: "Date" },
      { key: "piece", label: "Piece" },
      { key: "motif", label: "Motif" },
      { key: "montant", label: "Montant", currency: true },
      { key: "statut", label: "Statut" }
    ],
    rows: [
      { date: "28/06/2026", piece: "DC-001", motif: "Achat urgence", montant: 450000, statut: "Valide" },
      { date: "27/06/2026", piece: "DC-002", motif: "Transport", montant: 80000, statut: "Valide" },
      { date: "27/06/2026", piece: "DC-003", motif: "Maintenance", montant: 120000, statut: "A suivre" }
    ]
  }
};

const tabs = document.querySelectorAll(".tab");
const toolbar = document.getElementById("toolbar");
const table = document.getElementById("data-table");
const title = document.getElementById("module-title");
const footer = document.getElementById("table-footer");
const quickSearch = document.getElementById("quick-search");
const approModal = document.getElementById("appro-modal");
const approBody = document.querySelector("#appro-table tbody");
const approTotal = document.getElementById("appro-total");
const modeCreationBtn = document.getElementById("mode-creation");
const modeReapproBtn = document.getElementById("mode-reappro");
const approStockFilter = document.getElementById("appro-stock-filter");
const approCatalogBody = document.querySelector("#appro-catalog-table tbody");
const creationArea = document.getElementById("creation-area");
const reapproArea = document.getElementById("reappro-area");
const approMontant = document.getElementById("appro-montant");
const approFamily = document.getElementById("appro-family");
const approSeuil = document.getElementById("appro-seuil");
const menuButtons = document.querySelectorAll(".menu-lite button");
const railButtons = document.querySelectorAll(".icon-rail .rail-btn");

const actionModal = document.getElementById("action-modal");
const actionForm = document.getElementById("action-form");
const actionTitle = document.getElementById("action-modal-title");
const actionFields = document.getElementById("action-fields");
const actionCancel = document.getElementById("action-cancel");

// ---- VENTE / CAISSE ----
const venteModal = document.getElementById("vente-modal");
const venteTicketBody = document.getElementById("vente-ticket-body");
const venteCodeInput = document.getElementById("vente-code-input");
const venteSuggestList = document.getElementById("vente-suggest-list");
const venteInfoStock = document.getElementById("vente-info-stock");
const venteInfoPrix = document.getElementById("vente-info-prix");
const vdTotal = document.getElementById("vd-total");
const vdRemise = document.getElementById("vd-remise");
const vdApayer = document.getElementById("vd-apayer");
const vdMonnaie = document.getElementById("vd-monnaie");
const vdArendre = document.getElementById("vd-arendre");
const vdClient = document.getElementById("vd-client");
const venteTicketNoEl = document.getElementById("vente-ticket-no");
const listeVenteModal = document.getElementById("liste-vente-modal");
let lvCurrentDate = new Date().toLocaleDateString("fr-FR");

const listeClientModal = document.getElementById("liste-client-modal");
let lcliCurrentClient = null;

const listeAttenteModal = document.getElementById("liste-attente-modal");
let laCurrentTicket = null;

const qtyPadModal = document.getElementById("qty-pad-modal");
let qtyPadRow = null;
let qtyPadValue = "0";

// ---- LOGIN & ADMIN ----
const loginModal = document.getElementById("login-modal");
const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

const adminPanelModal = document.getElementById("admin-panel-modal");
const adminCloseBtn = document.getElementById("admin-close-btn");
const createUserForm = document.getElementById("create-user-form");
const changePasswordForm = document.getElementById("change-password-form");
const adminTabs = document.querySelectorAll(".admin-tab");
const adminTabContents = document.querySelectorAll(".admin-tab-content");
const usersList = document.getElementById("users-list");
const passwordError = document.getElementById("password-error");
const userRoleBadge = document.getElementById("user-role-badge");

const venteState = {
  lines: [],
  ticketNum: 63130,
  activeTab: "menu",
  holdTickets: [],
  paymentMethod: "ESPECES",
  venteDate: new Date().toLocaleDateString("fr-FR"),
  ventes: []
};

// ======= INITIALIZE DEVICE DETECTION =======
detectDevice();
window.addEventListener("resize", () => {
  detectDevice();
});

// Initialize authentication and startup
initializeUsers();
currentUser = getCurrentUser();

// Always bind login events
bindLoginEvents();

if (currentUser) {
  // User already logged in
  initializeApp();
} else {
  // Show login modal
  loginModal.showModal();
}

function initializeApp() {
  // Hide login modal and show main app
  loginModal.close();
  document.querySelector(".shell").style.display = "";
  
  // Display user info badge
  if (currentUser) {
    const roleLabel = currentUser.role === "admin" ? "Admin" : "Caissier";
    userRoleBadge.textContent = `${currentUser.username} (${roleLabel})`;
    userRoleBadge.className = `user-badge ${currentUser.role}`;
  }
  
  loadState();
  bindBaseEvents();
  bindAdminEvents();
  
  // Restrict caissier access to caisse/vente only
  if (!isAdmin()) {
    // Hide tabs for caissier
    tabs.forEach(tab => tab.style.display = "none");
    
    // Hide stock-related buttons in toolbar
    const toolbarButtons = document.querySelectorAll(".actions button");
    toolbarButtons.forEach(btn => btn.style.display = "none");
    
    // Keep stock module as default but hide it
    state.module = "stock";
    
    // Hide quick action buttons except caisse
    railButtons.forEach((btn, idx) => {
      if (idx === 6) { // Caisse button (last one)
        btn.style.display = "";
      } else {
        btn.style.display = "none";
      }
    });
  }
  
  render();
  
  // For caissier, auto-open vente modal
  if (!isAdmin()) {
    openVenteModal();
  }
}

function bindLoginEvents() {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    
    if (!username || !password) {
      loginError.textContent = "Tous les champs sont requis";
      return;
    }
    
    if (login(username, password)) {
      loginError.textContent = "";
      loginForm.reset();
      loginModal.close();
      initializeApp();
    } else {
      loginError.textContent = "Identifiants incorrects";
      loginPassword.value = "";
      loginPassword.focus();
    }
  });
}

function bindAdminEvents() {
  if (!isAdmin()) {
    // Caissier ne peut pas ouvrir le panneau admin - option non visible
    return;
  }

  // Admin tabs
  adminTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      adminTabs.forEach(t => t.classList.remove("is-active"));
      adminTabContents.forEach(c => c.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector(`.admin-tab-content[data-tab="${tabName}"]`).classList.add("is-active");
    });
  });

  adminCloseBtn.addEventListener("click", () => {
    adminPanelModal.close();
    renderUsersList();
  });

  createUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("new-user-name").value.trim();
    const password = document.getElementById("new-user-password").value.trim();
    const isAdmin = document.getElementById("new-user-role").checked;

    if (!username || !password) {
      alert("Tous les champs sont requis");
      return;
    }

    const result = createCaisseUser(username, password, isAdmin);
    alert(result.message);
    if (result.success) {
      createUserForm.reset();
      renderUsersList();
    }
  });

  changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentPass = document.getElementById("current-password").value;
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    if (!currentPass || !newPass || !confirmPass) {
      passwordError.textContent = "Tous les champs sont requis";
      return;
    }

    if (newPass !== confirmPass) {
      passwordError.textContent = "Les nouveaux mots de passe ne correspondent pas";
      return;
    }

    if (newPass.length < 4) {
      passwordError.textContent = "Le mot de passe doit contenir au moins 4 caractères";
      return;
    }

    const result = changePassword(currentUser.username, currentPass, newPass);
    passwordError.textContent = result.message;
    
    if (result.success) {
      changePasswordForm.reset();
      setTimeout(() => {
        adminPanelModal.close();
      }, 1500);
    }
  });
}

function renderUsersList() {
  const users = getUsers();
  usersList.innerHTML = "";

  Object.values(users).forEach(user => {
    const div = document.createElement("div");
    div.className = "user-item";
    div.innerHTML = `
      <div class="user-info">
        <strong>${user.username}</strong>
        <span class="user-role">${user.role}</span>
      </div>
      <div class="user-actions">
        ${user.username !== "admin" ? `<button class="user-delete-btn" data-user="${user.username}">Supprimer</button>` : ""}
      </div>
    `;
    usersList.appendChild(div);
  });

  // Add delete handlers
  document.querySelectorAll(".user-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const username = btn.dataset.user;
      if (confirm(`Supprimer l'utilisateur ${username}?`)) {
        const result = deleteUser(username);
        alert(result.message);
        renderUsersList();
      }
    });
  });
}

function bindBaseEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Prevent caissier from switching modules
      if (!isAdmin()) {
        showMessage("Accès réservé à l'administrateur");
        return;
      }
      state.module = tab.dataset.module;
      state.selectedId = "";
      state.onlyCommand = false;
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      render();
    });
  });

  quickSearch.addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById("appro-add-line").addEventListener("click", addApproLine);
  document.getElementById("appro-clear").addEventListener("click", () => {
    state.approLines = [];
    renderApproLines();
  });
  document.getElementById("appro-validate").addEventListener("click", validateApproLines);
  document.getElementById("appro-follow").addEventListener("click", markApproAsFollow);

  modeCreationBtn.addEventListener("click", () => setApproMode("creation"));
  modeReapproBtn.addEventListener("click", () => setApproMode("reappro"));
  approStockFilter.addEventListener("input", (e) => {
    state.approFilter = String(e.target.value || "").trim().toLowerCase();
    renderApproCatalog();
  });

  document.getElementById("appro-qte").addEventListener("input", refreshApproMontant);
  document.getElementById("appro-prix").addEventListener("input", refreshApproMontant);
  document.getElementById("appro-family-pick").addEventListener("click", () => {
    approFamily.focus();
  });

  menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => handleTopMenu(btn.textContent.trim()));
  });

  // Show/hide Admin button based on user role
  const adminBtn = document.getElementById("menu-admin");
  if (isAdmin()) {
    adminBtn.style.display = "";
  } else {
    adminBtn.style.display = "none";
  }

  railButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => handleRailAction(idx));
  });

  bindVenteEvents();
  bindListeVenteEvents();
  bindListeClientEvents();
  bindListeAttenteEvents();
  bindQtyPadEvents();
}

async function askFields(titleText, fields) {
  actionTitle.textContent = titleText;
  actionFields.innerHTML = "";

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;

    const input = document.createElement("input");
    input.name = field.name;
    input.type = field.type || "text";
    input.value = field.value ?? "";
    if (field.step) input.step = field.step;
    if (field.min !== undefined) input.min = String(field.min);
    if (field.required) input.required = true;

    label.appendChild(input);
    actionFields.appendChild(label);
  });

  return new Promise((resolve) => {
    const onSubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(actionForm);
      const values = {};
      fields.forEach((field) => {
        const raw = formData.get(field.name);
        if (field.type === "number") {
          values[field.name] = Number(raw || 0);
        } else {
          values[field.name] = String(raw || "").trim();
        }
      });
      cleanup();
      actionModal.close();
      resolve(values);
    };

    const onCancel = () => {
      cleanup();
      actionModal.close();
      resolve(null);
    };

    const cleanup = () => {
      actionForm.removeEventListener("submit", onSubmit);
      actionCancel.removeEventListener("click", onCancel);
    };

    actionForm.addEventListener("submit", onSubmit);
    actionCancel.addEventListener("click", onCancel);
    actionModal.showModal();
  });
}

function showMessage(message) {
  alert(message);
}

function handleTopMenu(action) {
  if (action === "Option") {
    state.module = "stock";
    state.search = "";
    state.onlyCommand = false;
    quickSearch.value = "";
    syncTabs();
    addHistory("System", "Retour a l'ecran stock");
    render();
    return;
  }

  if (action === "Edition") {
    state.editMode = !state.editMode;
    addHistory("System", `Mode edition: ${state.editMode ? "ON" : "OFF"}`);
    showMessage(`Mode edition: ${state.editMode ? "active" : "desactive"}`);
    return;
  }

  if (action === "Historique") {
    showHistory(true);
    return;
  }

  if (action === "Config") {
    askFields("Configuration", [{ name: "reset", label: "Ecrire RESET pour confirmer", value: "" }]).then((result) => {
      if (result && result.reset === "RESET") {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });
    return;
  }

  if (action === "Outils") {
    exportCurrentCsv();
    return;
  }

  if (action === "Admin") {
    renderUsersList();
    adminPanelModal.showModal();
    return;
  }

  if (action === "Déconnexion") {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter?")) {
      logout();
      window.location.reload();
    }
    return;
  }
}

function handleRailAction(index) {
  if (index === 0) {
    openApproModal();
    return;
  }

  if (index === 1) {
    const order = ["stock", "client", "fournisseur", "decaissement"];
    const i = order.indexOf(state.module);
    state.module = order[(i + 1) % order.length];
    syncTabs();
    render();
    return;
  }

  if (index === 2) {
    const total = modules.stock.rows.reduce((acc, row) => acc + Math.max(row.stock, 0) * row.achat, 0);
    showMessage(`Valeur de stock: ${formatMoney(total)}`);
    return;
  }

  if (index === 3) {
    state.module = "stock";
    syncTabs();
    state.onlyCommand = !state.onlyCommand;
    addHistory("Stock", `Filtre A commander: ${state.onlyCommand ? "ON" : "OFF"}`);
    render();
    return;
  }

  if (index === 4) {
    state.module = "stock";
    syncTabs();
    handleToolbarAction("Nouveau");
    return;
  }

  if (index === 5) {
    const recap = modules.stock.rows.filter((row) => row.stock < 0).reduce((acc, row) => acc + Math.abs(row.stock), 0);
    showMessage(`Recap qtt vendu (approx): ${formatNumber(recap)}`);
    return;
  }

  if (index === 6) {
    openVenteModal();
    return;
  }
}

function syncTabs() {
  tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.module === state.module));
}

function addApproLine() {
  const code = document.getElementById("appro-code").value.trim();
  const designation = document.getElementById("appro-designation").value.trim();
  const qte = Number(document.getElementById("appro-qte").value || 0);
  const prix = Number(document.getElementById("appro-prix").value || 0);
  const vente = Number(document.getElementById("appro-vente").value || 0);
  const famille = String(approFamily.value || "").trim();
  const seuil = Number(approSeuil.value || 0);
  const exists = modules.stock.rows.find((r) => r.reference === code);

  if (!code || !designation || qte <= 0 || prix < 0 || vente < 0) {
    showMessage("Verifier les champs de la ligne.");
    return;
  }

  if (state.approMode === "creation" && exists) {
    showMessage("Ce code existe deja. Utilise le mode REAPPRO.");
    return;
  }

  if (state.approMode === "reappro" && !exists) {
    showMessage("Code introuvable. Utilise le mode CREATION pour un nouvel article.");
    return;
  }

  state.approLines.push({
    code,
    designation,
    qte,
    prix,
    vente,
    famille,
    seuil,
    montant: qte * prix,
    mode: state.approMode
  });
  clearApproInputs();
  renderApproLines();
}

function validateApproLines() {
  if (state.approLines.length === 0) {
    showMessage("Aucune ligne a valider.");
    return;
  }

  state.approLines.forEach((line) => {
    const row = modules.stock.rows.find((r) => r.reference === line.code);
    if (row) {
      row.magasin += line.qte;
      row.stock += line.qte;
      row.achat = line.prix;
      row.vente = line.vente || row.vente || Math.ceil(line.prix * 1.2);
      row.marque = line.famille || row.marque || "";
      row.seuil = Number(line.seuil || row.seuil || 0);
    } else {
      modules.stock.rows.push({
        reference: line.code,
        designation: line.designation,
        marque: line.famille || "",
        magasin: line.qte,
        depot: 0,
        achat: line.prix,
        vente: line.vente || Math.ceil(line.prix * 1.2),
        stock: line.qte,
        seuil: Number(line.seuil || 0)
      });
    }
  });

  addHistory("Stock", `Appro validee: ${state.approLines.length} ligne(s)`);
  saveState();
  state.approLines = [];
  renderApproLines();
  approModal.close();
  state.module = "stock";
  syncTabs();
  render();
}

function markApproAsFollow() {
  const count = state.approLines.length;
  addHistory("Stock", `Appro en attente: ${count} ligne(s)`);
  showMessage(`Appro mis en attente (${count} ligne(s)).`);
}

function clearApproInputs() {
  if (state.approMode === "creation") {
    document.getElementById("appro-code").value = "";
    document.getElementById("appro-designation").value = "";
  }
  document.getElementById("appro-qte").value = "";
  document.getElementById("appro-prix").value = "";
  document.getElementById("appro-vente").value = "";
  approFamily.value = "";
  approSeuil.value = "0";
  approMontant.value = "0";
}

function openApproModal() {
  document.getElementById("appro-date").valueAsDate = new Date();
  state.approFilter = "";
  approStockFilter.value = "";
  setApproMode("creation");
  renderApproCatalog();
  approModal.showModal();
}

function setApproMode(mode) {
  state.approMode = mode;
  modeCreationBtn.classList.toggle("is-active", mode === "creation");
  modeReapproBtn.classList.toggle("is-active", mode === "reappro");

  const codeInput = document.getElementById("appro-code");
  const designationInput = document.getElementById("appro-designation");
  creationArea.hidden = false;
  reapproArea.hidden = mode !== "reappro";
  if (mode === "reappro") {
    codeInput.placeholder = "CODE EXISTANT";
    designationInput.placeholder = "DESIGNATION (auto)";
    designationInput.readOnly = true;
  } else {
    codeInput.placeholder = "CODE";
    designationInput.placeholder = "DESIGNATION";
    designationInput.readOnly = false;
  }
  clearApproInputs();
  renderApproCatalog();
}

function refreshApproMontant() {
  const qte = Number(document.getElementById("appro-qte").value || 0);
  const prix = Number(document.getElementById("appro-prix").value || 0);
  approMontant.value = String(qte * prix);
}

function renderApproCatalog() {
  if (!approCatalogBody) return;

  const filtered = modules.stock.rows.filter((row) => {
    if (!state.approFilter) return true;
    const text = `${row.reference} ${row.designation} ${row.marque}`.toLowerCase();
    return text.includes(state.approFilter);
  });

  approCatalogBody.innerHTML = "";
  filtered.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.reference}</td>
      <td>${row.designation}</td>
      <td>${formatMoney(row.achat)}</td>
      <td>${formatMoney(row.vente)}</td>
      <td>${formatNumber(row.magasin)}</td>
      <td>${formatNumber(row.depot)}</td>
    `;

    tr.addEventListener("click", () => {
      document.getElementById("appro-code").value = row.reference;
      document.getElementById("appro-designation").value = row.designation;
      document.getElementById("appro-prix").value = Number(row.achat || 0);
      document.getElementById("appro-vente").value = Number(row.vente || 0);
      approFamily.value = row.marque || "";
      approSeuil.value = String(row.seuil || 0);
      refreshApproMontant();
      document.getElementById("appro-qte").focus();
      if (state.approMode !== "reappro") {
        setApproMode("reappro");
        document.getElementById("appro-code").value = row.reference;
        document.getElementById("appro-designation").value = row.designation;
        document.getElementById("appro-prix").value = Number(row.achat || 0);
        document.getElementById("appro-vente").value = Number(row.vente || 0);
        approFamily.value = row.marque || "";
        approSeuil.value = String(row.seuil || 0);
        refreshApproMontant();
      }
    });

    approCatalogBody.appendChild(tr);
  });
}

function getPrimaryKey(moduleName) {
  if (moduleName === "stock") return "reference";
  if (moduleName === "client") return "client";
  if (moduleName === "fournisseur") return "fournisseur";
  return "piece";
}

function getCurrentRows() {
  const current = modules[state.module];
  let rows = current.rows;

  if (state.onlyCommand && state.module === "stock") {
    rows = rows.filter((row) => Number(row.stock) < 0);
  }

  if (!state.search) {
    return rows;
  }

  return rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(state.search)));
}

function getSelectedRow() {
  const rows = modules[state.module].rows;
  const pk = getPrimaryKey(state.module);
  if (!rows.length) return null;
  if (!state.selectedId) return rows[0];
  return rows.find((row) => String(row[pk]) === String(state.selectedId)) || rows[0];
}

function formatMoney(value) {
  return `${Number(value).toLocaleString("fr-FR")} Ar`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function renderToolbar() {
  const current = modules[state.module];
  toolbar.innerHTML = "";

  current.actions.forEach((action, index) => {
    const btn = document.createElement("button");
    btn.className = "tool-btn";
    btn.textContent = action;
    btn.type = "button";
    btn.dataset.icon = current.icons[index] || "";
    btn.addEventListener("click", () => handleToolbarAction(action));
    toolbar.appendChild(btn);
  });
}

async function handleToolbarAction(action) {
  if (action === "Appro") {
    openApproModal();
    return;
  }

  if (action === "Print") {
    window.print();
    return;
  }

  if (!state.editMode && ["Nouveau", "Modif", "Suppr", "Encaisser", "Payer", "Transf", "Entree", "Valider"].includes(action)) {
    showMessage("Mode edition desactive.");
    return;
  }

  if (action === "Nouveau") {
    await createRow();
    return;
  }

  if (action === "Modif") {
    await editSelectedRow();
    return;
  }

  if (action === "Suppr") {
    await deleteSelectedRow();
    return;
  }

  if (action === "Histo") {
    showHistory(false);
    return;
  }

  if (action === "Encaisser") {
    await encaisserClient();
    return;
  }

  if (action === "Payer") {
    await payerFournisseur();
    return;
  }

  if (action === "Transf") {
    await transferStock();
    return;
  }

  if (action === "Entree") {
    await stockEntry();
    return;
  }

  if (action === "Valider") {
    validateDecaissement();
  }
}

async function createRow() {
  if (state.module === "client") {
    const data = await askFields("Nouveau client", [
      { name: "client", label: "Nom client", required: true },
      { name: "compte", label: "Compte initial", type: "number", value: 0 },
      { name: "echeance", label: "Echeance (JJ/MM/AAAA)", value: "" },
      { name: "adresse", label: "Adresse", value: "" },
      { name: "contact", label: "Contact", value: "" },
      { name: "courriel", label: "Courriel", value: "" }
    ]);
    if (!data || !data.client) return;
    modules.client.rows.push(data);
    addHistory("Client", `Nouveau client: ${data.client}`);
  }

  if (state.module === "fournisseur") {
    const data = await askFields("Nouveau fournisseur", [
      { name: "fournisseur", label: "Nom fournisseur", required: true },
      { name: "compte", label: "Compte initial", type: "number", value: 0 },
      { name: "echeance", label: "Echeance (JJ/MM/AAAA)", value: "" },
      { name: "adresse", label: "Adresse", value: "" },
      { name: "contact", label: "Contact", value: "" },
      { name: "courriel", label: "Courriel", value: "" }
    ]);
    if (!data || !data.fournisseur) return;
    modules.fournisseur.rows.push(data);
    addHistory("Fournisseur", `Nouveau fournisseur: ${data.fournisseur}`);
  }

  if (state.module === "decaissement") {
    const data = await askFields("Nouveau decaissement", [
      { name: "date", label: "Date (JJ/MM/AAAA)", value: "28/06/2026" },
      { name: "piece", label: "Piece", value: `DC-${String(modules.decaissement.rows.length + 1).padStart(3, "0")}` },
      { name: "motif", label: "Motif", value: "" },
      { name: "montant", label: "Montant", type: "number", value: 0 }
    ]);
    if (!data || !data.piece) return;
    modules.decaissement.rows.push({ ...data, statut: "A suivre" });
    addHistory("Decaissement", `Nouveau decaissement: ${data.piece}`);
  }

  if (state.module === "stock") {
    const data = await askFields("Nouveau article", [
      { name: "reference", label: "Reference", required: true },
      { name: "designation", label: "Designation", value: "" },
      { name: "marque", label: "Marque", value: "" },
      { name: "magasin", label: "Magasin", type: "number", value: 0 },
      { name: "depot", label: "Depot", type: "number", value: 0 },
      { name: "achat", label: "Prix d'achat", type: "number", value: 0 },
      { name: "vente", label: "Prix de vente", type: "number", value: 0 }
    ]);
    if (!data || !data.reference) return;
    modules.stock.rows.push({ ...data, stock: Number(data.magasin) + Number(data.depot) });
    addHistory("Stock", `Nouvel article: ${data.reference}`);
  }

  saveState();
  render();
}

async function editSelectedRow() {
  const row = getSelectedRow();
  if (!row) {
    showMessage("Aucune ligne a modifier.");
    return;
  }

  const fields = modules[state.module].columns.map((col) => ({
    name: col.key,
    label: col.label,
    value: row[col.key] ?? "",
    type: col.currency || col.numeric ? "number" : "text"
  }));

  const data = await askFields("Modifier ligne", fields);
  if (!data) return;

  Object.keys(data).forEach((key) => {
    row[key] = data[key];
  });

  if (state.module === "stock") {
    row.stock = Number(row.magasin || 0) + Number(row.depot || 0);
  }

  addHistory(modules[state.module].title, `Modification ligne ${String(row[getPrimaryKey(state.module)])}`);
  saveState();
  render();
}

async function deleteSelectedRow() {
  const rows = modules[state.module].rows;
  if (!rows.length) {
    showMessage("Aucune ligne a supprimer.");
    return;
  }

  const row = getSelectedRow();
  const pk = getPrimaryKey(state.module);
  const confirmData = await askFields("Confirmer suppression", [
    { name: "confirm", label: `Ecrire SUPPRIMER pour ${String(row[pk])}` }
  ]);
  if (!confirmData || confirmData.confirm !== "SUPPRIMER") {
    return;
  }

  const idx = rows.findIndex((item) => String(item[pk]) === String(row[pk]));
  if (idx >= 0) {
    rows.splice(idx, 1);
    state.selectedId = "";
    addHistory(modules[state.module].title, `Suppression ${String(row[pk])}`);
    saveState();
    render();
  }
}

async function encaisserClient() {
  if (state.module !== "client") return;
  const row = getSelectedRow();
  if (!row) return;

  const data = await askFields("Encaisser client", [
    { name: "montant", label: `Montant encaisse pour ${row.client}`, type: "number", value: 0, min: 0 }
  ]);
  if (!data || data.montant <= 0) return;

  row.compte = Math.max(0, Number(row.compte || 0) - Number(data.montant));
  addHistory("Client", `Encaissement ${formatMoney(data.montant)} sur ${row.client}`);
  saveState();
  render();
}

async function payerFournisseur() {
  if (state.module !== "fournisseur") return;
  const row = getSelectedRow();
  if (!row) return;

  const data = await askFields("Payer fournisseur", [
    { name: "montant", label: `Montant paye pour ${row.fournisseur}`, type: "number", value: 0, min: 0 }
  ]);
  if (!data || data.montant <= 0) return;

  row.compte = Math.max(0, Number(row.compte || 0) - Number(data.montant));
  addHistory("Fournisseur", `Paiement ${formatMoney(data.montant)} sur ${row.fournisseur}`);
  saveState();
  render();
}

async function transferStock() {
  if (state.module !== "stock") return;
  const row = getSelectedRow();
  if (!row) return;

  const data = await askFields("Transferer stock", [
    { name: "qte", label: `Qte Magasin -> Depot (${row.reference})`, type: "number", value: 0, min: 0 }
  ]);
  if (!data || data.qte <= 0) return;

  if (Number(data.qte) > Number(row.magasin || 0)) {
    showMessage("Quantite insuffisante en magasin.");
    return;
  }

  row.magasin = Number(row.magasin) - Number(data.qte);
  row.depot = Number(row.depot) + Number(data.qte);
  row.stock = Number(row.magasin) + Number(row.depot);

  addHistory("Stock", `Transfert ${formatNumber(data.qte)} sur ${row.reference}`);
  saveState();
  render();
}

async function stockEntry() {
  if (state.module !== "stock") return;
  const row = getSelectedRow();
  if (!row) return;

  const data = await askFields("Entree stock", [
    { name: "qte", label: `Qte entree pour ${row.reference}`, type: "number", value: 0, min: 0 }
  ]);
  if (!data || data.qte <= 0) return;

  row.magasin = Number(row.magasin) + Number(data.qte);
  row.stock = Number(row.magasin) + Number(row.depot);

  addHistory("Stock", `Entree ${formatNumber(data.qte)} sur ${row.reference}`);
  saveState();
  render();
}

function validateDecaissement() {
  if (state.module !== "decaissement") return;
  const row = getSelectedRow();
  if (!row) return;

  row.statut = "Valide";
  addHistory("Decaissement", `Validation ${row.piece}`);
  saveState();
  render();
}

function showHistory(showAll) {
  const filtered = showAll
    ? state.history
    : state.history.filter((h) => h.module === modules[state.module].title || h.module === "System");

  if (!filtered.length) {
    showMessage("Aucun historique.");
    return;
  }

  const text = filtered
    .slice(-20)
    .map((h) => `${h.time} | ${h.module} | ${h.message}`)
    .join("\n");

  showMessage(text);
}

function addHistory(moduleName, message) {
  state.history.push({
    time: new Date().toLocaleString("fr-FR"),
    module: moduleName,
    message
  });
  state.history = state.history.slice(-500);
  saveState();
}

function renderTable() {
  const current = modules[state.module];
  const rows = getCurrentRows();
  const pk = getPrimaryKey(state.module);

  const thead = document.createElement("thead");
  const htr = document.createElement("tr");
  current.columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col.label;
    htr.appendChild(th);
  });
  thead.appendChild(htr);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const rowId = String(row[pk]);
    if (!state.selectedId && rows.length) {
      state.selectedId = rowId;
    }
    tr.classList.toggle("selected-row", state.selectedId === rowId);

    tr.addEventListener("click", () => {
      state.selectedId = rowId;
      renderTable();
    });

    current.columns.forEach((col) => {
      const td = document.createElement("td");
      const value = row[col.key] ?? "";
      td.textContent = col.currency ? formatMoney(value) : col.numeric ? formatNumber(value) : value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.innerHTML = "";
  table.appendChild(thead);
  table.appendChild(tbody);
}

function renderFooter() {
  const rows = getCurrentRows();
  const current = modules[state.module];

  let sum = 0;
  const monetaryCol = current.columns.find((c) => c.key === "compte" || c.key === "montant");
  if (monetaryCol) {
    sum = rows.reduce((acc, row) => acc + Number(row[monetaryCol.key] || 0), 0);
  }

  if (state.module === "stock") {
    const flag = state.onlyCommand ? " (A commander)" : "";
    footer.innerHTML = `<span>Nombre total${flag}</span><span>${rows.length.toLocaleString("fr-FR")}</span>`;
    return;
  }

  footer.innerHTML = `<span>TOTAL</span><span>${formatMoney(sum)}</span>`;
}

function renderApproLines() {
  approBody.innerHTML = "";
  let total = 0;

  state.approLines.forEach((line) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${line.code}</td>
      <td>${line.designation}</td>
      <td>${formatMoney(line.prix)}</td>
      <td>${formatMoney(line.vente || 0)}</td>
      <td>${formatNumber(line.qte)}</td>
      <td>${formatMoney(line.montant)}</td>
    `;
    total += line.montant;
    approBody.appendChild(tr);
  });

  approTotal.textContent = formatMoney(total);
}

function render() {
  title.textContent = modules[state.module].title;
  renderToolbar();
  renderTable();
  renderFooter();
}

function exportCurrentCsv() {
  const current = modules[state.module];
  const rows = getCurrentRows();
  if (!rows.length) {
    showMessage("Aucune ligne a exporter.");
    return;
  }

  const header = current.columns.map((c) => c.label).join(",");
  const lines = rows.map((row) =>
    current.columns
      .map((col) => {
        const val = row[col.key] ?? "";
        const text = col.currency ? formatMoney(val) : col.numeric ? formatNumber(val) : String(val);
        return `"${String(text).replaceAll("\"", "'")}"`;
      })
      .join(",")
  );

  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.module}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  addHistory("System", `Export CSV ${state.module}`);
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      modules,
      history: state.history,
      editMode: state.editMode,
      venteTicketNum: venteState.ticketNum,
      venteHoldTickets: venteState.holdTickets,
      venteVentes: venteState.ventes
    })
  );
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    const loadedModules = parsed.modules || parsed;
    ["stock", "client", "fournisseur", "decaissement"].forEach((key) => {
      if (loadedModules[key] && Array.isArray(loadedModules[key].rows)) {
        modules[key].rows = loadedModules[key].rows;
      }
    });

    if (Array.isArray(parsed.history)) {
      state.history = parsed.history;
    }

    if (typeof parsed.editMode === "boolean") {
      state.editMode = parsed.editMode;
    }

    if (typeof parsed.venteTicketNum === "number") {
      venteState.ticketNum = parsed.venteTicketNum;
    }

    if (Array.isArray(parsed.venteHoldTickets)) {
      venteState.holdTickets = parsed.venteHoldTickets;
    }

    if (Array.isArray(parsed.venteVentes)) {
      venteState.ventes = parsed.venteVentes;
    }
  } catch {
    // Keep defaults when storage is invalid.
  }
}

// =================== VENTE / CAISSE FUNCTIONS ===================

function openVenteModal() {
  venteTicketNoEl.textContent = String(venteState.ticketNum).padStart(9, "0");
  vdClient.value = "CONSOMMATEUR";
  vdMonnaie.value = "0";
  venteCodeInput.value = "";
  venteSuggestList.innerHTML = "";
  venteInfoStock.textContent = "-";
  venteInfoPrix.textContent = "-";
  renderVenteTicket();
  calcVenteTotals();
  venteModal.showModal();
  venteCodeInput.focus();
}

function renderVenteTicket() {
  venteTicketBody.innerHTML = "";
  venteState.lines.forEach((line, idx) => {
    const net = line.pvente - (line.remise1 || 0);
    const montant = line.qte * net - (line.remiseTot || 0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <button class="vente-row-edit" data-idx="${idx}" title="Editer">&#9998;</button>
      </td>
      <td>${line.designation}</td>
      <td>${formatMoney(net)}</td>
      <td>${formatNumber(line.qte)}</td>
      <td>${line.unite || "U"}</td>
      <td>${formatMoney(line.pvente)}</td>
      <td>${formatMoney(line.remise1 || 0)}</td>
      <td>${formatMoney(line.remiseTot || 0)}</td>
      <td>${formatMoney(montant)}</td>
      <td>
        <button class="vente-row-del" data-idx="${idx}" title="Supprimer">&#128465;</button>
      </td>
    `;
    venteTicketBody.appendChild(tr);
  });

  venteTicketBody.querySelectorAll(".vente-row-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      venteState.lines.splice(Number(btn.dataset.idx), 1);
      renderVenteTicket();
      calcVenteTotals();
    });
  });

  venteTicketBody.querySelectorAll(".vente-row-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const i = Number(btn.dataset.idx);
      const line = venteState.lines[i];
      const data = await askFields("Modifier ligne", [
        { name: "qte", label: "Quantite", type: "number", value: line.qte, min: 0, step: 0.01 },
        { name: "pvente", label: "Prix de vente", type: "number", value: line.pvente, min: 0, step: 0.01 },
        { name: "remise1", label: "Remise unitaire (Ar)", type: "number", value: line.remise1 || 0, min: 0, step: 100 },
        { name: "remiseTot", label: "Remise totale ligne (Ar)", type: "number", value: line.remiseTot || 0, min: 0, step: 100 }
      ]);
      if (!data) return;
      venteState.lines[i] = { ...line, ...data };
      renderVenteTicket();
      calcVenteTotals();
    });
  });
}

function calcVenteTotals() {
  let total = 0;
  let remise = 0;
  venteState.lines.forEach((line) => {
    const pvente = Number(line.pvente || 0);
    const qte = Number(line.qte || 0);
    const net = pvente - (line.remise1 || 0);
    const montantBrut = qte * pvente;
    const montantNet = qte * net - (line.remiseTot || 0);
    total += montantNet;
    remise += montantBrut - montantNet;
  });
  const monnaie = Number(vdMonnaie.value || 0);
  const arendre = monnaie - total;

  vdTotal.textContent = formatMoney(total);
  vdRemise.textContent = formatMoney(remise);
  vdApayer.textContent = formatMoney(total);
  vdArendre.textContent = formatMoney(Math.max(0, arendre));
  vdArendre.style.color = arendre < 0 ? "#cc0000" : "#006600";
}

function venteSearchArticles(query) {
  venteSuggestList.innerHTML = "";
  venteInfoStock.textContent = "-";
  venteInfoPrix.textContent = "-";
  if (!query) return;

  const q = query.toLowerCase();
  const matches = modules.stock.rows
    .filter((r) => r.reference.toLowerCase().includes(q) || r.designation.toLowerCase().includes(q))
    .slice(0, 12);

  if (matches.length === 1) {
    venteInfoStock.textContent = formatNumber(matches[0].stock);
    venteInfoPrix.textContent = formatMoney(matches[0].vente);
  }

  matches.forEach((row) => {
    const div = document.createElement("div");
    div.className = "vente-suggest-item";
    div.innerHTML = `
      <span>${row.reference}</span>
      <span>${row.designation}</span>
      <span>${formatNumber(row.stock)}</span>
      <span>${formatMoney(row.vente)}</span>
    `;
    div.addEventListener("click", () => openQtyPad(row));
    venteSuggestList.appendChild(div);
  });

  // Un seul résultat : ouvrir automatiquement le pavé numérique
  if (matches.length === 1) {
    setTimeout(() => openQtyPad(matches[0]), 120);
  }
}

function venteAddArticle(row) {
  const existing = venteState.lines.find((l) => l.reference === row.reference);
  if (existing) {
    existing.qte += 1;
  } else {
    venteState.lines.push({
      reference: row.reference,
      designation: row.designation,
      pvente: Number(row.vente || 0),
      qte: 1,
      unite: "U",
      remise1: 0,
      remiseTot: 0
    });
  }
  venteCodeInput.value = "";
  venteSuggestList.innerHTML = "";
  venteInfoStock.textContent = "-";
  venteInfoPrix.textContent = "-";
  renderVenteTicket();
  calcVenteTotals();
  venteCodeInput.focus();
}

function venteConfirmSale() {
  if (!venteState.lines.length) {
    showMessage("Aucun article dans le ticket.");
    return;
  }
  const apayer = venteCalcApayer();
  const monnaie = Number(vdMonnaie.value || 0);

  // Decrement stock
  venteState.lines.forEach((line) => {
    const stockRow = modules.stock.rows.find((r) => r.reference === line.reference);
    if (stockRow) {
      stockRow.magasin = Number(stockRow.magasin) - Number(line.qte);
      stockRow.stock = Number(stockRow.magasin) + Number(stockRow.depot);
    }
  });

  const ticketNo = String(venteState.ticketNum).padStart(9, "0");
  const client = vdClient.value || "CONSOMMATEUR";
  const methode = venteState.paymentMethod || "ESPECES";
  const remise = venteCalcRemise();

  // Enregistrer la vente complete pour la Liste Vente
  venteState.ventes.push({
    ticketNo,
    heure: new Date().toLocaleTimeString("fr-FR"),
    date: venteState.venteDate || new Date().toLocaleDateString("fr-FR"),
    client,
    montant: apayer + remise,
    remise,
    apayer,
    rendu: Math.max(0, monnaie - apayer),
    vendeur: "CAISSE",
    mode: methode,
    pc: venteState.lines.length,
    lines: venteState.lines.map((line) => {
      const pvente = Number(line.pvente || 0);
      const qte = Number(line.qte || 0);
      const net = pvente - (line.remise1 || 0);
      const brutLigne = qte * pvente;
      const montantLigne = qte * net - (line.remiseTot || 0);
      return {
        reference: line.reference,
        designation: line.designation,
        qte,
        remise1: Number(line.remise1 || 0),
        pvente,
        prixRemise: net,
        totRemise: brutLigne - montantLigne,
        montant: montantLigne
      };
    })
  });

  addHistory("Vente", `TICKET N\xb0${ticketNo} \u2014 ${client} \u2014 ${formatMoney(apayer)} \u2014 ${methode} \u2014 Rendu: ${formatMoney(Math.max(0, monnaie - apayer))}`);
  venteState.ticketNum++;
  venteState.lines = [];
  venteState.paymentMethod = "ESPECES";
  saveState();
  venteTicketNoEl.textContent = String(venteState.ticketNum).padStart(9, "0");
  vdMonnaie.value = "0";
  vdClient.value = "CONSOMMATEUR";
  renderVenteTicket();
  calcVenteTotals();
  render();
  showMessage(`Vente N\xb0${ticketNo} enregistree.\nMontant : ${formatMoney(apayer)}\nMonnaie rendue : ${formatMoney(Math.max(0, monnaie - apayer))}`);
}

function bindVenteEvents() {
  // ---- Recherche article ----
  venteCodeInput.addEventListener("input", () => {
    venteSearchArticles(venteCodeInput.value.trim());
  });

  venteCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = venteSuggestList.querySelector(".vente-suggest-item");
      if (first) first.click();
    }
    if (e.key === "Escape") {
      venteCodeInput.value = "";
      venteSuggestList.innerHTML = "";
      venteInfoStock.textContent = "-";
      venteInfoPrix.textContent = "-";
    }
  });

  document.getElementById("vente-code-reset").addEventListener("click", () => {
    venteCodeInput.value = "";
    venteSuggestList.innerHTML = "";
    venteInfoStock.textContent = "-";
    venteInfoPrix.textContent = "-";
    venteCodeInput.focus();
  });

  // ---- Monnaie ----
  vdMonnaie.addEventListener("input", calcVenteTotals);

  // ---- Boutons raccourcis monnaie ----
  document.querySelectorAll(".vqm-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const add = Number(btn.dataset.val);
      vdMonnaie.value = String(Number(vdMonnaie.value || 0) + add);
      calcVenteTotals();
    });
  });

  // ---- Boutons strip supérieur ----
  document.getElementById("vente-btn-cal").addEventListener("click", async () => {
    const today = new Date().toISOString().split("T")[0];
    const data = await askFields("Date de la vente", [
      { name: "date", label: "Date (AAAA-MM-JJ)", type: "date", value: today }
    ]);
    if (!data) return;
    venteState.venteDate = new Date(data.date).toLocaleDateString("fr-FR");
    addHistory("Vente", `Date vente changee : ${venteState.venteDate}`);
    showMessage(`Date vente : ${venteState.venteDate}`);
  });

  document.getElementById("vente-btn-opt").addEventListener("click", async () => {
    const data = await askFields("Options vente", [
      { name: "remise", label: "Remise globale sur toutes les lignes (Ar)", type: "number", value: 0, min: 0, step: 100 },
      { name: "vendeur", label: "Vendeur (laisser vide = CAISSE)", value: "CAISSE" }
    ]);
    if (!data) return;
    if (Number(data.remise) > 0) {
      venteState.lines.forEach((l) => { l.remiseTot = Number(data.remise); });
      renderVenteTicket();
      calcVenteTotals();
      showMessage(`Remise globale de ${data.remise}% appliquee a toutes les lignes.`);
    }
    if (data.vendeur && data.vendeur !== "CAISSE") {
      addHistory("Vente", `Vendeur change : ${data.vendeur}`);
    }
  });

  document.getElementById("vente-btn-client").addEventListener("click", openListeClientModal);

  document.getElementById("vente-btn-sortie").addEventListener("click", () => {
    if (!venteState.lines.length) { showMessage("Aucun article dans le ticket."); return; }
    // Sortie directe : monnaie = apayer (pas de rendu)
    const apayer = venteCalcApayer();
    vdMonnaie.value = String(apayer);
    calcVenteTotals();
    venteConfirmSale();
  });

  document.getElementById("vente-btn-valider").addEventListener("click", venteConfirmSale);

  // ---- Boutons grille menu ----
  document.getElementById("vente-btn-mobile").addEventListener("click", async () => {
    if (!venteState.lines.length) { showMessage("Aucun article dans le ticket."); return; }
    const apayer = venteCalcApayer();
    const data = await askFields(`Paiement Mobile / Cheque — A payer : ${formatMoney(apayer)}`, [
      { name: "type", label: "Type de paiement (MOBILE ou CHEQUE)", value: "MOBILE" },
      { name: "ref", label: "Reference / N° cheque", value: "" }
    ]);
    if (!data) return;
    venteState.paymentMethod = (data.type || "MOBILE").toUpperCase();
    vdMonnaie.value = String(apayer);
    calcVenteTotals();
    venteConfirmSale();
    addHistory("Vente", `Paiement ${venteState.paymentMethod} ref:${data.ref || "-"}`);
  });

  document.getElementById("vente-btn-depense").addEventListener("click", async () => {
    const data = await askFields("Enregistrer une depense caisse", [
      { name: "motif", label: "Motif de la depense", required: true },
      { name: "montant", label: "Montant (Ar)", type: "number", value: 0, min: 0, step: 100 }
    ]);
    if (!data || !data.motif || Number(data.montant) <= 0) return;
    const piece = `DC-${String(modules.decaissement.rows.length + 1).padStart(3, "0")}`;
    modules.decaissement.rows.push({
      date: venteState.venteDate || new Date().toLocaleDateString("fr-FR"),
      piece,
      motif: data.motif,
      montant: Number(data.montant),
      statut: "Valide"
    });
    addHistory("Vente", `Depense ${piece} — ${formatMoney(data.montant)} — ${data.motif}`);
    saveState();
    render();
    showMessage(`Depense ${piece} enregistree : ${formatMoney(data.montant)}`);
  });

  document.getElementById("vente-btn-credit").addEventListener("click", async () => {
    if (!venteState.lines.length) { showMessage("Aucun article dans le ticket."); return; }
    const apayer = venteCalcApayer();
    const clientName = (vdClient.value || "CONSOMMATEUR").trim();
    if (clientName === "CONSOMMATEUR") {
      showMessage("Pour une vente a credit, selectionnez un client avec le bouton 👤");
      return;
    }
    const clientRow = modules.client.rows.find((r) => r.client.toLowerCase().includes(clientName.toLowerCase()));
    if (!clientRow) {
      showMessage(`Client "${clientName}" introuvable. Selectionnez un client avec le bouton 👤`);
      return;
    }
    // Afficher le solde actuel et demander confirmation
    const soldeActuel = Number(clientRow.compte || 0);
    const nouveauSolde = soldeActuel + apayer;
    const confirmData = await askFields(`VENTE A CREDIT - ${clientRow.client}`, [
      { name: "info", label: `Solde actuel`, value: formatMoney(soldeActuel), disabled: true },
      { name: "montant", label: `Montant vente`, value: formatMoney(apayer), disabled: true },
      { name: "nouveau", label: `Nouveau solde`, value: formatMoney(nouveauSolde), disabled: true },
      { name: "confirm", label: `Confirmer? (oui/non)`, value: "non" }
    ]);
    if (!confirmData || confirmData.confirm.toLowerCase() !== "oui") {
      showMessage("Vente a credit annulee.");
      return;
    }
    clientRow.compte = nouveauSolde;
    addHistory("Vente", `Credit ${formatMoney(apayer)} sur ${clientRow.client}`);
    venteState.lines.forEach((line) => {
      const row = modules.stock.rows.find((r) => r.reference === line.reference);
      if (row) { row.magasin -= Number(line.qte); row.stock = Number(row.magasin) + Number(row.depot); }
    });
    venteState.ticketNum++;
    venteState.lines = [];
    venteTicketNoEl.textContent = String(venteState.ticketNum).padStart(9, "0");
    vdMonnaie.value = "0";
    vdClient.value = "CONSOMMATEUR";
    renderVenteTicket();
    calcVenteTotals();
    saveState();
    render();
    showMessage(`Credit de ${formatMoney(apayer)} enregistre sur ${clientRow.client}.\nNouveau solde: ${formatMoney(nouveauSolde)}`);
  });

  document.getElementById("vente-btn-attente").addEventListener("click", () => {
    if (!venteState.lines.length) { showMessage("Aucun article dans le ticket."); return; }
    const hold = {
      id: venteState.ticketNum,
      lines: venteState.lines.map((l) => ({ ...l })),
      client: vdClient.value || "CONSOMMATEUR",
      date: new Date().toLocaleString("fr-FR")
    };
    venteState.holdTickets.push(hold);
    venteState.lines = [];
    venteState.ticketNum++;
    addHistory("Vente", `Ticket N°${String(hold.id).padStart(9, "0")} mis en attente (${hold.lines.length} art.)`);
    venteTicketNoEl.textContent = String(venteState.ticketNum).padStart(9, "0");
    vdMonnaie.value = "0";
    vdClient.value = "CONSOMMATEUR";
    renderVenteTicket();
    calcVenteTotals();
    saveState();
    showMessage(`Ticket N°${String(hold.id).padStart(9, "0")} mis en attente. ${venteState.holdTickets.length} ticket(s) en attente.`);
  });

  document.getElementById("vente-btn-vente").addEventListener("click", openListeVenteModal);

  document.getElementById("vente-btn-liste").addEventListener("click", openListeAttenteModal);

  document.getElementById("vente-btn-fermer").addEventListener("click", async () => {
    if (venteState.lines.length > 0) {
      const conf = await askFields("Fermer la caisse", [
        { name: "ok", label: `Le ticket en cours (${venteState.lines.length} art.) sera perdu. Ecrire OUI pour confirmer` }
      ]);
      if (!conf || conf.ok.toUpperCase() !== "OUI") return;
      venteState.lines = [];
    }
    venteModal.close();
  });

  // ---- Onglets ----
  document.querySelectorAll(".vente-ptab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const which = tab.dataset.vptab;
      venteState.activeTab = which;
      document.querySelectorAll(".vente-ptab").forEach((t) => t.classList.toggle("is-active", t === tab));
      document.getElementById("vpc-monnaie").hidden = which !== "monnaie";
      document.getElementById("vpc-menu").hidden = which !== "menu";
    });
  });

  // ---- Pave numerique (onglet Monnaie) ----
  document.querySelectorAll(".vnte-np").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ch = btn.textContent.trim();
      if (ch === "\u232B" || ch.codePointAt(0) === 0x232B) {
        const cur = String(vdMonnaie.value || "0");
        vdMonnaie.value = cur.length > 1 ? cur.slice(0, -1) : "0";
      } else {
        const cur = String(vdMonnaie.value || "0");
        vdMonnaie.value = cur === "0" ? ch : cur + ch;
      }
      calcVenteTotals();
    });
  });

  // ---- Client input direct ----
  vdClient.addEventListener("input", () => {
    venteState.clientInput = vdClient.value;
  });
}

// Calcule le montant a payer du ticket courant
function venteCalcApayer() {
  return venteState.lines.reduce((acc, line) => {
    const net = Number(line.pvente || 0) - (line.remise1 || 0);
    return acc + Number(line.qte || 0) * net - (line.remiseTot || 0);
  }, 0);
}

// Calcule la remise totale du ticket courant
function venteCalcRemise() {
  return venteState.lines.reduce((acc, line) => {
    const pvente = Number(line.pvente || 0);
    const qte = Number(line.qte || 0);
    const net = pvente - (line.remise1 || 0);
    return acc + (qte * pvente) - (qte * net - (line.remiseTot || 0));
  }, 0);
}

// =================== LISTE VENTE ===================

function openListeVenteModal() {
  lvCurrentDate = venteState.venteDate || new Date().toLocaleDateString("fr-FR");
  // Convert FR date (DD/MM/YYYY) to ISO for the date input
  const parts = lvCurrentDate.split("/");
  if (parts.length === 3) {
    document.getElementById("lv-date-input").value = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  renderListeVentes(lvCurrentDate);
  document.getElementById("lv-detail-body").innerHTML = "";
  document.getElementById("lv-detail-total").textContent = "0 Ar";
  listeVenteModal.showModal();
}

function renderListeVentes(dateStr) {
  const body = document.getElementById("lv-ventes-body");
  body.innerHTML = "";

  const filtered = venteState.ventes.filter((v) => v.date === dateStr);
  let totalCA = 0;
  let totalRemise = 0;

  filtered.forEach((vente, idx) => {
    totalCA += Number(vente.apayer || 0);
    totalRemise += Number(vente.remise || 0);

    const tr = document.createElement("tr");
    tr.dataset.idx = String(idx);
    tr.innerHTML = `
      <td>${vente.ticketNo}</td>
      <td>${vente.heure}</td>
      <td>${vente.client}</td>
      <td class="lv-num">${formatMoney(vente.montant)}</td>
      <td class="lv-num">${formatMoney(vente.remise)}</td>
      <td class="lv-num">${formatMoney(vente.apayer)}</td>
      <td>${vente.vendeur}</td>
      <td>${vente.mode}</td>
      <td class="lv-num">${vente.pc}</td>
      <td class="lv-td-suppr" style="text-align:center"><button class="lv-suppr-btn" data-vidx="${venteState.ventes.indexOf(vente)}">Supprimer</button></td>
    `;

    tr.addEventListener("click", (e) => {
      if (e.target.classList.contains("lv-suppr-btn")) return;
      document.querySelectorAll("#lv-ventes-body tr").forEach((r) => r.classList.remove("lv-selected"));
      tr.classList.add("lv-selected");
      renderVenteDetail(vente);
    });

    body.appendChild(tr);
  });

  // Wire delete buttons
  body.querySelectorAll(".lv-suppr-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const realIdx = Number(btn.dataset.vidx);
      const vente = venteState.ventes[realIdx];
      if (!vente) return;
      const conf = await askFields(`Annuler le ticket N\u00b0${vente.ticketNo}`, [
        { name: "ok", label: "Ecrire SUPPRIMER pour confirmer l'annulation" }
      ]);
      if (!conf || conf.ok.toUpperCase() !== "SUPPRIMER") return;
      addHistory("Vente", `Annulation ticket N\u00b0${vente.ticketNo}`);
      venteState.ventes.splice(realIdx, 1);
      saveState();
      renderListeVentes(dateStr);
      document.getElementById("lv-detail-body").innerHTML = "";
      document.getElementById("lv-detail-total").textContent = "0 Ar";
    });
  });

  document.getElementById("lv-remise-total").textContent = formatMoney(totalRemise);
  document.getElementById("lv-ca-total").textContent = formatMoney(totalCA);

  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="10" style="text-align:center;padding:18px;color:#666;font-size:1rem;">Aucune vente pour le ${dateStr}</td>`;
    body.appendChild(tr);
  }
}

function renderVenteDetail(vente) {
  const body = document.getElementById("lv-detail-body");
  body.innerHTML = "";
  let total = 0;

  (vente.lines || []).forEach((line, lineIdx) => {
    total += Number(line.montant || 0);
    const realVenteIdx = venteState.ventes.indexOf(vente);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${line.designation}</td>
      <td class="lv-num">${formatNumber(line.qte)}</td>
      <td class="lv-num">${formatMoney(line.remise1 || 0)}</td>
      <td class="lv-num">${formatMoney(line.pvente)}</td>
      <td class="lv-num">${formatMoney(line.prixRemise)}</td>
      <td class="lv-num">${formatMoney(line.totRemise)}</td>
      <td class="lv-num">${formatMoney(line.montant)}</td>
      <td style="text-align:center"><button class="lv-suppr-btn lv-suppr-line" data-vi="${realVenteIdx}" data-li="${lineIdx}">Supprimer</button></td>
    `;
    body.appendChild(tr);
  });

  document.getElementById("lv-detail-total").textContent = formatMoney(total);

  // Wire line delete buttons
  body.querySelectorAll(".lv-suppr-line").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const vi = Number(btn.dataset.vi);
      const li = Number(btn.dataset.li);
      const conf = await askFields("Supprimer cette ligne", [
        { name: "ok", label: "Ecrire SUPPRIMER pour confirmer" }
      ]);
      if (!conf || conf.ok.toUpperCase() !== "SUPPRIMER") return;
      venteState.ventes[vi].lines.splice(li, 1);
      // Recalculate vente totals after line removal
      const v = venteState.ventes[vi];
      v.apayer = v.lines.reduce((a, l) => a + Number(l.montant || 0), 0);
      v.remise = v.lines.reduce((a, l) => a + Number(l.totRemise || 0), 0);
      v.montant = v.apayer + v.remise;
      v.pc = v.lines.length;
      saveState();
      renderListeVentes(lvCurrentDate);
      if (venteState.ventes[vi]) {
        renderVenteDetail(venteState.ventes[vi]);
        // Re-select row
        const rows = document.querySelectorAll("#lv-ventes-body tr");
        const filteredIdx = venteState.ventes.filter(x => x.date === lvCurrentDate).indexOf(venteState.ventes[vi]);
        if (rows[filteredIdx]) rows[filteredIdx].classList.add("lv-selected");
      }
    });
  });
}

function bindListeVenteEvents() {
  document.getElementById("lv-date-input").addEventListener("change", (e) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split("-");
    lvCurrentDate = `${d}/${m}/${y}`;
    renderListeVentes(lvCurrentDate);
    document.getElementById("lv-detail-body").innerHTML = "";
    document.getElementById("lv-detail-total").textContent = "0 Ar";
  });

  document.getElementById("lv-btn-fermer").addEventListener("click", () => {
    listeVenteModal.close();
  });

  document.getElementById("lv-btn-close-h").addEventListener("click", () => {
    listeVenteModal.close();
  });

  document.getElementById("lv-btn-imprimer").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("lv-btn-print-h").addEventListener("click", () => {
    window.print();
  });
}

function bindListeClientEvents() {
  const searchInput = document.getElementById("lcli-search-input");
  const selectionnerlBtn = document.getElementById("lcli-btn-selectioner");
  const encaisserBtn = document.getElementById("lcli-btn-encaisser");
  const creerBtn = document.getElementById("lcli-btn-creer");
  const annulerBtn = document.getElementById("lcli-btn-annuler");

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    renderListeClients(q);
  });

  selectionnerlBtn.addEventListener("click", () => {
    if (!lcliCurrentClient) { showMessage("Selectionnez un client."); return; }
    vdClient.value = lcliCurrentClient.client;
    listeClientModal.close();
  });

  encaisserBtn.addEventListener("click", async () => {
    if (!lcliCurrentClient) { showMessage("Selectionnez un client."); return; }
    const data = await askFields(`Encaisser client ${lcliCurrentClient.client}`, [
      { name: "montant", label: "Montant a encaisser (Ar)", type: "number", value: 0, min: 0, step: 1000 }
    ]);
    if (!data || Number(data.montant) <= 0) return;
    lcliCurrentClient.compte = Math.max(0, Number(lcliCurrentClient.compte || 0) - Number(data.montant));
    addHistory("Encaissement", `${formatMoney(data.montant)} encaisse de ${lcliCurrentClient.client}`);
    saveState();
    vdClient.value = lcliCurrentClient.client;
    listeClientModal.close();
    showMessage(`Encaissement de ${formatMoney(data.montant)} enregistre pour ${lcliCurrentClient.client}.\nNouveau solde: ${formatMoney(lcliCurrentClient.compte)}`);
  });

  creerBtn.addEventListener("click", async () => {
    const newClientName = searchInput.value.trim();
    if (!newClientName) { showMessage("Entrez un nom de client."); return; }
    const newClient = {
      client: newClientName,
      compte: 0,
      echeance: "",
      adresse: "",
      contact: ""
    };
    modules.client.rows.push(newClient);
    addHistory("Client", `Nouveau client cree : ${newClientName}`);
    saveState();
    vdClient.value = newClientName;
    listeClientModal.close();
    showMessage(`Client "${newClientName}" cree et selectione.`);
  });

  annulerBtn.addEventListener("click", () => {
    listeClientModal.close();
  });
}

function renderListeClients(q) {
  const body = document.getElementById("lcli-body");
  const creerBtn = document.getElementById("lcli-btn-creer");
  body.innerHTML = "";
  lcliCurrentClient = null;

  const filtered = q
    ? modules.client.rows.filter((r) => r.client.toLowerCase().includes(q)).slice(0, 50)
    : modules.client.rows.slice(0, 50);

  filtered.forEach((client) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${client.client}</td>
      <td>${formatMoney(client.compte)}</td>
    `;
    tr.addEventListener("click", () => {
      document.querySelectorAll("#lcli-table tbody tr").forEach((r) => r.classList.remove("lcli-selected"));
      tr.classList.add("lcli-selected");
      lcliCurrentClient = client;
      creerBtn.style.display = "none";
    });
    body.appendChild(tr);
  });

  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2" style="text-align:center;padding:16px;color:#8a8a8a;font-size:0.95rem;">Aucun client trouve</td>`;
    body.appendChild(tr);
    // Afficher le bouton CREER si on a fait une recherche
    if (q) {
      creerBtn.style.display = "flex";
    } else {
      creerBtn.style.display = "none";
    }
  } else {
    creerBtn.style.display = "none";
  }
}

function openListeClientModal() {
  lcliCurrentClient = null;
  document.getElementById("lcli-search-input").value = "";
  document.getElementById("lcli-btn-creer").style.display = "none";
  renderListeClients("");
  listeClientModal.showModal();
  document.getElementById("lcli-search-input").focus();
}

function bindListeAttenteEvents() {
  const reprendreBtn = document.getElementById("la-btn-reprendre");
  const supprimerBtn = document.getElementById("la-btn-supprimer");
  const annulerBtn = document.getElementById("la-btn-annuler");

  reprendreBtn.addEventListener("click", async () => {
    if (!laCurrentTicket) { showMessage("Selectionnez un ticket."); return; }
    if (venteState.lines.length > 0) {
      const conf = await askFields("Ticket en cours non vide", [
        { name: "ok", label: "Ecrire OUI pour ecraser le ticket en cours et reprendre le ticket selectionne" }
      ]);
      if (!conf || conf.ok.toUpperCase() !== "OUI") return;
    }
    const idx = venteState.holdTickets.indexOf(laCurrentTicket);
    if (idx < 0) return;
    const hold = venteState.holdTickets.splice(idx, 1)[0];
    venteState.lines = hold.lines;
    vdClient.value = hold.client;
    venteTicketNoEl.textContent = String(hold.id).padStart(9, "0");
    venteState.ticketNum = hold.id;
    vdMonnaie.value = "0";
    renderVenteTicket();
    calcVenteTotals();
    saveState();
    listeAttenteModal.close();
    showMessage(`Ticket N°${String(hold.id).padStart(9, "0")} repris.`);
  });

  supprimerBtn.addEventListener("click", async () => {
    if (!laCurrentTicket) { showMessage("Selectionnez un ticket."); return; }
    const ticketId = laCurrentTicket.id;
    const conf = await askFields("Confirmation suppression", [
      { name: "ok", label: "Ecrire OUI pour supprimer le ticket en attente" }
    ]);
    if (!conf || conf.ok.toUpperCase() !== "OUI") return;
    const idx = venteState.holdTickets.indexOf(laCurrentTicket);
    if (idx >= 0) {
      venteState.holdTickets.splice(idx, 1);
      addHistory("Vente", `Ticket N°${String(ticketId).padStart(9, "0")} supprime de l'attente`);
      saveState();
      laCurrentTicket = null;
      renderListeAttente();
      if (venteState.holdTickets.length === 0) {
        showMessage("Ticket supprime. Aucun autre ticket en attente.");
      } else {
        showMessage("Ticket supprime.");
      }
    }
  });

  annulerBtn.addEventListener("click", () => {
    listeAttenteModal.close();
  });
}

function renderListeAttente() {
  const body = document.getElementById("la-body");
  body.innerHTML = "";
  laCurrentTicket = null;
  document.getElementById("la-articles-body").innerHTML = "";

  venteState.holdTickets.forEach((ticket) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${String(ticket.id).padStart(9, "0")}</td>
      <td>${ticket.client}</td>
    `;
    tr.addEventListener("click", () => {
      document.querySelectorAll("#la-table tbody tr").forEach((r) => r.classList.remove("la-selected"));
      tr.classList.add("la-selected");
      laCurrentTicket = ticket;
      renderListeAttenteArticles(ticket);
    });
    body.appendChild(tr);
  });

  if (!venteState.holdTickets.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2" style="text-align:center;padding:16px;color:#8a8a8a;font-size:0.95rem;">Aucun ticket en attente</td>`;
    body.appendChild(tr);
  }
}

function renderListeAttenteArticles(ticket) {
  const articlesBody = document.getElementById("la-articles-body");
  articlesBody.innerHTML = "";
  
  if (!ticket || !ticket.lines.length) {
    articlesBody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:12px;color:#8a8a8a;">Aucun article</td></tr>`;
    return;
  }

  ticket.lines.forEach((line) => {
    const tr = document.createElement("tr");
    const montant = (Number(line.qte) * (Number(line.pvente) - (line.remise1 || 0)) - (line.remiseTot || 0)).toFixed(0);
    tr.innerHTML = `
      <td>${line.designation}</td>
      <td>${line.qte}</td>
      <td>${formatMoney(montant)}</td>
    `;
    articlesBody.appendChild(tr);
  });
}

function openListeAttenteModal() {
  if (!venteState.holdTickets.length) {
    showMessage("Aucun ticket en attente.");
    return;
  }
  laCurrentTicket = null;
  renderListeAttente();
  listeAttenteModal.showModal();
}

function openQtyPad(row) {
  qtyPadRow = row;
  qtyPadValue = "0";
  document.getElementById("qpad-article-name").textContent = row.designation || row.reference;
  document.getElementById("qpad-stock-info").textContent = `Stock: ${formatNumber(row.stock)}  |  Prix: ${formatMoney(row.vente)}`;
  document.getElementById("qpad-display").textContent = "0";
  qtyPadModal.showModal();
}

function bindQtyPadEvents() {
  const display = document.getElementById("qpad-display");

  document.querySelectorAll(".qpad-btn[data-val]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.val;
      if (val === "C") {
        qtyPadValue = "0";
      } else if (val === "⌫") {
        qtyPadValue = qtyPadValue.length > 1 ? qtyPadValue.slice(0, -1) : "0";
      } else {
        if (qtyPadValue === "0") {
          qtyPadValue = val;
        } else {
          qtyPadValue += val;
        }
      }
      display.textContent = qtyPadValue;
    });
  });

  // Clavier physique
  qtyPadModal.addEventListener("keydown", (e) => {
    if (!qtyPadModal.open) return;
    e.preventDefault();
    e.stopPropagation();

    if ((e.key >= "0" && e.key <= "9") || (e.code >= "Numpad0" && e.code <= "Numpad9")) {
      const digit = e.key.replace("Numpad", "").slice(-1);
      if (/\d/.test(digit)) {
        qtyPadValue = qtyPadValue === "0" ? digit : qtyPadValue + digit;
        // Highlight le bouton correspondant
        const btn = qtyPadModal.querySelector(`.qpad-btn[data-val="${digit}"]`);
        if (btn) { btn.style.background = "#2a5a8a"; setTimeout(() => btn.style.background = "", 120); }
      }
    } else if (e.key === "." || e.key === ",") {
      if (!qtyPadValue.includes(".")) qtyPadValue += ".";
    } else if (e.key === "Backspace") {
      qtyPadValue = qtyPadValue.length > 1 ? qtyPadValue.slice(0, -1) : "0";
    } else if (e.key === "Delete" || e.key === "Escape") {
      if (e.key === "Escape") {
        qtyPadModal.close(); qtyPadRow = null; venteCodeInput.focus(); return;
      }
      qtyPadValue = "0";
    } else if (e.key === "Enter" || e.key === "NumpadEnter") {
      document.getElementById("qpad-btn-ok").click(); return;
    }
    display.textContent = qtyPadValue;
  });

  document.getElementById("qpad-btn-ok").addEventListener("click", () => {
    const qty = parseFloat(qtyPadValue) || 1;
    if (qtyPadRow) {
      const existing = venteState.lines.find((l) => l.reference === qtyPadRow.reference);
      if (existing) {
        existing.qte += qty;
      } else {
        venteState.lines.push({
          reference: qtyPadRow.reference,
          designation: qtyPadRow.designation,
          pvente: Number(qtyPadRow.vente || 0),
          qte: qty,
          unite: "U",
          remise1: 0,
          remiseTot: 0
        });
      }
      venteCodeInput.value = "";
      venteSuggestList.innerHTML = "";
      venteInfoStock.textContent = "-";
      venteInfoPrix.textContent = "-";
      renderVenteTicket();
      calcVenteTotals();
    }
    qtyPadModal.close();
    qtyPadRow = null;
    setTimeout(() => venteCodeInput.focus(), 50);
  });

  document.getElementById("qpad-btn-cancel").addEventListener("click", () => {
    qtyPadModal.close();
    qtyPadRow = null;
    setTimeout(() => venteCodeInput.focus(), 50);
  });
}
