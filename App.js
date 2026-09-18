import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  ink: "#20301F",
  paper: "#E9EFDF",
  rule: "#C7D3B8",
  surface: "#F5F8EF",
  muted: "#6B7A63",
  green: "#1E7145",
  red: "#B23A2E",
};

function fmt(n) {
  return "Rs " + Math.abs(n).toLocaleString();
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function balanceOf(c) {
  return c.txns.reduce((s, t) => s + (t.type === "gave" ? t.amount : -t.amount), 0);
}

const SEED = [
  {
    id: "c1",
    name: "Karim Traders",
    phone: "070 111 2233",
    txns: [
      { id: "t1", type: "gave", amount: 4500, note: "Rice bags", date: "12 Sep" },
      { id: "t2", type: "got", amount: 2000, note: "Partial payment", date: "14 Sep" },
    ],
  },
  {
    id: "c2",
    name: "Rahim Hardware",
    phone: "079 555 6677",
    txns: [{ id: "t3", type: "got", amount: 1500, note: "Advance", date: "10 Sep" }],
  },
  {
    id: "c3",
    name: "Bashir Store",
    phone: "077 222 9988",
    txns: [
      { id: "t4", type: "gave", amount: 8000, note: "Flour, oil", date: "5 Sep" },
      { id: "t5", type: "gave", amount: 1200, note: "Sugar", date: "9 Sep" },
      { id: "t6", type: "got", amount: 5000, note: "Cash payment", date: "13 Sep" },
    ],
  },
];

const SEED_PRODUCTS = [
  { id: "p1", name: "Rice (50kg bag)", price: 4500, stock: 12 },
  { id: "p2", name: "Cooking oil (5L)", price: 1200, stock: 3 },
  { id: "p3", name: "Sugar (bag)", price: 900, stock: 20 },
  { id: "p4", name: "Flour (bag)", price: 1600, stock: 4 },
];

const LOW_STOCK = 5;
const LANGUAGES = ["English", "پښتو", "دری", "اردو"];
const LANG_CODE = { English: "en", "پښتو": "ps", "دری": "fa", "اردو": "ur" };

const STRINGS = {
  en: {
    appTitle: "Khata",
    appSubtitle: "Your customer ledger, digitized.",
    youllGive: "You'll give",
    youllGet: "You'll get",
    searchCustomers: "Search customers",
    noCustomers: "No customers found.",
    noTxnsYet: "No transactions yet",
    addCustomer: "New customer",
    name: "Name",
    phone: "Phone (optional)",
    save: "Save",
    saveCustomer: "Save customer",
    saveChanges: "Save changes",
    saveEntry: "Save entry",
    saveExpense: "Save expense",
    saveProduct: "Save product",
    createStaff: "Create staff account",
    createAdmin: "Create admin account",
    logIn: "Log in",
    logOut: "Log out",
    cancel: "Cancel",
    remind: "Remind",
    invoice: "Invoice",
    receive: "Receive",
    shareLink: "Share link",
    youWillGet: "You will get",
    youWillGive: "You will give",
    all: "All",
    youGave: "You gave",
    youGot: "You got",
    noEntriesFilter: "No entries match this filter.",
    inventory: "Inventory",
    inventorySubtitle: "Products and stock levels.",
    lowStock: "Low stock",
    inStock: "in stock",
    expenses: "Expenses",
    expensesSubtitle: "Rent, salary, purchases, and other costs.",
    totalThisMonth: "Total this month",
    noExpenses: "No expenses recorded yet.",
    reports: "Reports",
    export: "Export",
    expensesThisMonth: "Expenses this month",
    byCustomer: "By customer",
    settings: "Settings",
    storage: "Storage",
    storageDesc: "Saved on this device automatically. Cloud sync isn't set up yet.",
    businessProfile: "Business profile",
    reminderSettings: "Reminder settings",
    language: "Language",
    helpSupport: "Help & support (24/7)",
    resetData: "Reset to sample data",
    team: "Team",
    addStaff: "+ Add staff account",
    noStaff: "No staff accounts yet.",
    staffLimited: "Staff (limited access)",
    admin: "Admin — full access",
    staff: "Staff — limited access",
    ledgers: "Ledgers",
    createAccountTitle: "Create your business account",
    createAccountSubtitle: "This account becomes the Admin — full access to everything. You can add staff accounts with limited access later.",
    yourName: "Your name",
    email: "Email",
    password: "Password (at least 4 characters)",
    loginTitle: "Log in to Khata",
    loginSubtitle: "Use the email or phone number your account was created with.",
    emailOrPhone: "Email or phone",
    loading: "Loading your ledger…",
  },
  ps: {
    appTitle: "خاته",
    appSubtitle: "ستاسو د پیرودونکو کتاب، ډیجیټل شکل کې.",
    youllGive: "ورکړل به شي",
    youllGet: "ترلاسه به شي",
    searchCustomers: "پیرودونکي لټول",
    noCustomers: "هیڅ پیرودونکی ونه موندل شو.",
    noTxnsYet: "لا تر اوسه ننوتنه نشته",
    addCustomer: "نوی پیرودونکی",
    name: "نوم",
    phone: "شمېره (اختیاري)",
    save: "خوندي کړه",
    saveCustomer: "پیرودونکی خوندي کړه",
    saveChanges: "بدلونونه خوندي کړه",
    saveEntry: "ننوتنه خوندي کړه",
    saveExpense: "لګښت خوندي کړه",
    saveProduct: "محصول خوندي کړه",
    createStaff: "همکار حساب جوړ کړه",
    createAdmin: "مدیر حساب جوړ کړه",
    logIn: "ننوتل",
    logOut: "وتل",
    cancel: "کینسل",
    remind: "یادونه",
    invoice: "رسید",
    receive: "ترلاسه کول",
    shareLink: "لینک شریکول",
    youWillGet: "تاسو به ترلاسه کړئ",
    youWillGive: "تاسو به ورکړئ",
    all: "ټول",
    youGave: "تاسو ورکړل",
    youGot: "تاسو ترلاسه کړل",
    noEntriesFilter: "هیڅ ننوتنه سره دې فلټر سره سمون نلري.",
    inventory: "موجوده توکي",
    inventorySubtitle: "محصولات او د ذخیرې اندازه.",
    lowStock: "لږ ذخیره",
    inStock: "ذخیره کې",
    expenses: "لګښتونه",
    expensesSubtitle: "کرایه، معاش، پیرود، او نور لګښتونه.",
    totalThisMonth: "د دې میاشتې ټول لګښت",
    noExpenses: "لا تر اوسه لګښت نه دی ثبت شوی.",
    reports: "راپورونه",
    export: "صادرول",
    expensesThisMonth: "د دې میاشتې لګښتونه",
    byCustomer: "د پیرودونکي په اساس",
    settings: "ترتیبات",
    storage: "ذخیره",
    storageDesc: "پخپله په دې موبایل کې خوندي کیږي. کلاوډ لاهم نه دی وصل.",
    businessProfile: "د سوداګرۍ پروفایل",
    reminderSettings: "د یادونې ترتیبات",
    language: "ژبه",
    helpSupport: "مرسته او ملاتړ (۲۴/۷)",
    resetData: "بیرته نمونې ډیټا ته راستنیدل",
    team: "ټیم",
    addStaff: "+ همکار حساب زیات کړه",
    noStaff: "لا تر اوسه همکار نشته.",
    staffLimited: "همکار (محدود لاسرسی)",
    admin: "مدیر — بشپړ لاسرسی",
    staff: "همکار — محدود لاسرسی",
    ledgers: "حسابونه",
    createAccountTitle: "خپل سوداګریز حساب جوړ کړئ",
    createAccountSubtitle: "دا حساب به مدیر شي — بشپړ لاسرسی به ولري. تاسو کولی شئ وروسته د محدود لاسرسي همکاران هم زیات کړئ.",
    yourName: "ستاسو نوم",
    email: "بریښنالیک",
    password: "پاسورډ (لږ تر لږه ۴ توري)",
    loginTitle: "خاته ته ننوتل",
    loginSubtitle: "هغه بریښنالیک یا شمېره وکاروئ چې حساب مو ورسره جوړ شوی و.",
    emailOrPhone: "بریښنالیک یا شمېره",
    loading: "ستاسو کتاب بارېږي…",
  },
};

function t(lang, key) {
  const code = LANG_CODE[lang] || "en";
  return (STRINGS[code] && STRINGS[code][key]) || STRINGS.en[key] || key;
}

const EXPENSE_CATEGORIES = ["Rent", "Salary", "Utilities", "Purchase", "Transport", "Other"];

const SEED_EXPENSES = [
  { id: "e1", category: "Rent", amount: 6000, note: "Shop rent — September", date: "1 Sep" },
  { id: "e2", category: "Utilities", amount: 850, note: "Electricity bill", date: "6 Sep" },
  { id: "e3", category: "Purchase", amount: 3200, note: "Restock from supplier", date: "11 Sep" },
];

function Avatar({ name }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials(name)}</Text>
    </View>
  );
}

function EntrySheet({ visible, type, onCancel, onSave }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const color = type === "gave" ? COLORS.red : COLORS.green;
  const label = type === "gave" ? "You gave" : "You got";
  const valid = amount && Number(amount) > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color }]}>{label}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            autoFocus
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={COLORS.muted}
            style={styles.amountInput}
          />
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Rice bags"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
          <TouchableOpacity
            disabled={!valid}
            onPress={() => {
              onSave({ amount: Number(amount), note: note.trim() || "No note" });
              setAmount("");
              setNote("");
            }}
            style={[styles.saveBtn, { backgroundColor: valid ? color : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Save entry</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddProductSheet({ visible, onCancel, onSave }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const valid = name.trim() && price && stock;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: COLORS.ink }]}>New product</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Product name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Rice (50kg bag)" placeholderTextColor={COLORS.muted} style={styles.input} />
          <Text style={styles.label}>Price per unit</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.muted} style={styles.input} />
          <Text style={styles.label}>Stock quantity</Text>
          <TextInput value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.muted} style={styles.input} />
          <TouchableOpacity
            disabled={!valid}
            onPress={() => {
              onSave({ name: name.trim(), price: Number(price), stock: Number(stock) });
              setName(""); setPrice(""); setStock("");
            }}
            style={[styles.saveBtn, { backgroundColor: valid ? COLORS.ink : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Save product</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddExpenseSheet({ visible, onCancel, onSave }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const valid = amount && Number(amount) > 0;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>New expense</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {EXPENSE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.filterChip, category === c && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, category === c && styles.filterChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={COLORS.muted}
            style={styles.amountInput}
          />
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Shop rent — September"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
          <TouchableOpacity
            disabled={!valid}
            onPress={() => {
              onSave({ category, amount: Number(amount), note: note.trim() || category });
              setAmount(""); setNote("");
            }}
            style={[styles.saveBtn, { backgroundColor: valid ? COLORS.red : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Save expense</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function InvoiceSheet({ visible, products, customerName, onCancel, onCreate }) {
  const [qtys, setQtys] = useState({});
  const setQty = (id, delta) =>
    setQtys((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  const items = products
    .map((p) => ({ ...p, qty: qtys[p.id] || 0 }))
    .filter((p) => p.qty > 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight: "80%" }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Invoice — {customerName}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 260 }}>
            {products.map((p) => (
              <View key={p.id} style={styles.invoiceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: COLORS.ink }}>{p.name}</Text>
                  <Text style={{ fontSize: 10.5, color: COLORS.muted }}>{fmt(p.price)} / unit</Text>
                </View>
                <TouchableOpacity onPress={() => setQty(p.id, -1)} style={styles.qtyBtn}>
                  <Feather name="minus" size={12} color={COLORS.ink} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qtys[p.id] || 0}</Text>
                <TouchableOpacity onPress={() => setQty(p.id, 1)} style={styles.qtyBtn}>
                  <Feather name="plus" size={12} color={COLORS.ink} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.invoiceTotalRow}>
            <Text style={{ fontSize: 13, color: COLORS.muted }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>{fmt(total)}</Text>
          </View>
          <TouchableOpacity
            disabled={items.length === 0}
            onPress={() => {
              onCreate(items, total);
              setQtys({});
            }}
            style={[styles.saveBtn, { backgroundColor: items.length ? COLORS.ink : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Create & share invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ReceiveQRSheet({ visible, customerName, onCancel, onShare }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Receive payment</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <View style={styles.qrBox}>
            <Feather name="grid" size={90} color={COLORS.ink} />
          </View>
          <Text style={{ textAlign: "center", fontSize: 11.5, color: COLORS.muted, marginBottom: 16 }}>
            Ask {customerName} to scan this code, or share the payment link.
          </Text>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.ink }]} onPress={onShare}>
            <Text style={styles.saveBtnText}>Share payment link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function LedgerLinkSheet({ visible, customer, onCancel, onCopy, onShare }) {
  const bal = balanceOf(customer);
  const link = `khata.app/view/${customer.id}`;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Share ledger link</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14, lineHeight: 18 }}>
            {customer.name} can open this link on any phone to see their own balance and
            transaction history — no app install needed.
          </Text>
          <View style={styles.linkBox}>
            <Feather name="link" size={13} color={COLORS.muted} />
            <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
          </View>
          <View style={styles.linkPreview}>
            <Text style={{ fontSize: 10.5, color: COLORS.muted }}>What they will see</Text>
            <Text style={{ fontSize: 11.5, color: COLORS.ink, marginTop: 4 }}>{customer.name}'s balance</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: bal >= 0 ? COLORS.green : COLORS.red, marginTop: 2 }}>
              {fmt(bal)} {bal >= 0 ? "(they owe you)" : "(you owe them)"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.rule }]} onPress={onCopy}>
              <Text style={[styles.saveBtnText, { color: COLORS.ink }]}>Copy link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.ink }]} onPress={onShare}>
              <Text style={styles.saveBtnText}>Share via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EditCustomerSheet({ visible, customer, onCancel, onSave, onDelete }) {
  const [name, setName] = useState(customer ? customer.name : "");
  const [phone, setPhone] = useState(customer ? customer.phone : "");

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || "");
    }
  }, [customer && customer.id]);

  const valid = name.trim().length > 0;
  if (!customer) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Edit customer</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Customer name" placeholderTextColor={COLORS.muted} style={styles.input} />
          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="070 000 0000" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" style={styles.input} />
          <TouchableOpacity
            disabled={!valid}
            onPress={() => onSave({ name: name.trim(), phone: phone.trim() })}
            style={[styles.saveBtn, { backgroundColor: valid ? COLORS.ink : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 14, alignItems: "center" }} onPress={onDelete}>
            <Text style={{ color: COLORS.red, fontSize: 12.5, fontWeight: "600" }}>Delete this customer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditTxnSheet({ visible, txn, onCancel, onSave, onDelete }) {
  const [amount, setAmount] = useState(txn ? String(txn.amount) : "");
  const [note, setNote] = useState(txn ? txn.note : "");

  useEffect(() => {
    if (txn) {
      setAmount(String(txn.amount));
      setNote(txn.note || "");
    }
  }, [txn && txn.id]);

  if (!txn) return null;
  const color = txn.type === "gave" ? COLORS.red : COLORS.green;
  const label = txn.type === "gave" ? "Edit — You gave" : "Edit — You got";
  const valid = amount && Number(amount) > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color }]}>{label}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Amount</Text>
          <TextInput keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0" placeholderTextColor={COLORS.muted} style={styles.amountInput} />
          <Text style={styles.label}>Note</Text>
          <TextInput value={note} onChangeText={setNote} placeholder="Note" placeholderTextColor={COLORS.muted} style={styles.input} />
          <TouchableOpacity
            disabled={!valid}
            onPress={() => onSave({ amount: Number(amount), note: note.trim() || "No note" })}
            style={[styles.saveBtn, { backgroundColor: valid ? color : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 14, alignItems: "center" }} onPress={onDelete}>
            <Text style={{ color: COLORS.red, fontSize: 12.5, fontWeight: "600" }}>Delete this entry</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function HomeScreen({ customers, onOpen, onAdd, lang }) {
  const [query, setQuery] = useState("");
  const totalGet = customers.reduce((s, c) => s + Math.max(balanceOf(c), 0), 0);
  const totalGive = customers.reduce((s, c) => s + Math.max(-balanceOf(c), 0), 0);
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBlock}>
        <Text style={styles.appTitle}>{t(lang, "appTitle")}</Text>
        <Text style={styles.appSubtitle}>{t(lang, "appSubtitle")}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t(lang, "youllGive")}</Text>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>{fmt(totalGive)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t(lang, "youllGet")}</Text>
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>{fmt(totalGet)}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={15} color={COLORS.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t(lang, "searchCustomers")}
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        ListEmptyComponent={<Text style={styles.empty}>{t(lang, "noCustomers")}</Text>}
        renderItem={({ item }) => {
          const bal = balanceOf(item);
          const last = item.txns[item.txns.length - 1];
          return (
            <TouchableOpacity style={styles.custRow} onPress={() => onOpen(item.id)}>
              <Avatar name={item.name} />
              <View style={{ flex: 1 }}>
                <Text style={styles.custName}>{item.name}</Text>
                <Text style={styles.custSub}>
                  {last ? `${last.note} · ${last.date}` : t(lang, "noTxnsYet")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.custBal, { color: bal >= 0 ? COLORS.green : COLORS.red }]}>
                  {fmt(bal)}
                </Text>
                <Text style={styles.custTag}>{bal >= 0 ? t(lang, "youllGet") : t(lang, "youllGive")}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Feather name="plus" size={20} color={COLORS.paper} />
      </TouchableOpacity>
    </View>
  );
}

function InventoryScreen({ products, onAdd, role, lang }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBlock}>
        <Text style={styles.appTitle}>{t(lang, "inventory")}</Text>
        <Text style={styles.appSubtitle}>{t(lang, "inventorySubtitle")}</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        renderItem={({ item }) => {
          const low = item.stock <= LOW_STOCK;
          return (
            <View style={styles.productRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.custName}>{item.name}</Text>
                <Text style={styles.custSub}>{fmt(item.price)} / unit</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.custBal, { color: low ? COLORS.red : COLORS.ink }]}>
                  {item.stock} {t(lang, "inStock")}
                </Text>
                {low && (
                  <View style={styles.lowStockTag}>
                    <Feather name="alert-triangle" size={9} color={COLORS.red} />
                    <Text style={styles.lowStockText}> {t(lang, "lowStock")}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
      {role === "admin" && (
        <TouchableOpacity style={styles.fab} onPress={onAdd}>
          <Feather name="plus" size={20} color={COLORS.paper} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function ExpensesScreen({ expenses, onAdd, lang }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBlock}>
        <Text style={styles.appTitle}>{t(lang, "expenses")}</Text>
        <Text style={styles.appSubtitle}>{t(lang, "expensesSubtitle")}</Text>
      </View>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={styles.summaryLabel}>{t(lang, "totalThisMonth")}</Text>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>{fmt(total)}</Text>
        </View>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        ListEmptyComponent={<Text style={styles.empty}>{t(lang, "noExpenses")}</Text>}
        renderItem={({ item }) => (
          <View style={styles.expenseRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.custName}>{item.note}</Text>
              <Text style={styles.custSub}>{item.category} · {item.date}</Text>
            </View>
            <Text style={[styles.custBal, { color: COLORS.red }]}>{fmt(item.amount)}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Feather name="plus" size={20} color={COLORS.paper} />
      </TouchableOpacity>
    </View>
  );
}

function AddCustomerScreen({ onCancel, onSave, lang }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const valid = name.trim().length > 0;
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onCancel} style={{ padding: 4 }}>
          <Feather name="chevron-left" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t(lang, "addCustomer")}</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={styles.label}>{t(lang, "name")}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Karim Traders"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        <Text style={styles.label}>{t(lang, "phone")}</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="070 000 0000"
          placeholderTextColor={COLORS.muted}
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>
      <View style={{ marginTop: "auto", padding: 16 }}>
        <TouchableOpacity
          disabled={!valid}
          onPress={() => onSave({ name: name.trim(), phone: phone.trim() })}
          style={[styles.saveBtn, { backgroundColor: valid ? COLORS.ink : COLORS.rule }]}
        >
          <Text style={styles.saveBtnText}>{t(lang, "saveCustomer")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LedgerScreen({ customer, products, role, lang, onBack, onAddTxn, onEditTxn, onDeleteTxn, onEditCustomer, onDeleteCustomer, onRemind, onInvoice, onReceiveShare, onLinkCopy, onLinkShare }) {
  const [sheet, setSheet] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editingTxn, setEditingTxn] = useState(null);
  const bal = balanceOf(customer);
  const visibleTxns = customer.txns.filter((t) => filter === "all" || t.type === filter);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Feather name="chevron-left" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Avatar name={customer.name} />
        <View style={{ flex: 1 }}>
          <Text style={styles.custName}>{customer.name}</Text>
          {!!customer.phone && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="phone" size={9} color={COLORS.muted} />
              <Text style={styles.custSub}> {customer.phone}</Text>
            </View>
          )}
        </View>
        {role === "admin" && (
          <TouchableOpacity onPress={() => setSheet("editCustomer")} style={{ padding: 4 }}>
            <Feather name="edit-2" size={17} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickActionsRow}>
        {bal > 0 && (
          <TouchableOpacity style={styles.remindBtn} onPress={() => onRemind(customer)}>
            <Feather name="bell" size={12} color={COLORS.ink} />
            <Text style={styles.remindText}>{t(lang, "remind")}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.remindBtn} onPress={() => setSheet("invoice")}>
          <Feather name="file-text" size={12} color={COLORS.ink} />
          <Text style={styles.remindText}>{t(lang, "invoice")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.remindBtn} onPress={() => setSheet("qr")}>
          <Feather name="grid" size={12} color={COLORS.ink} />
          <Text style={styles.remindText}>{t(lang, "receive")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.remindBtn} onPress={() => setSheet("link")}>
          <Feather name="link" size={12} color={COLORS.ink} />
          <Text style={styles.remindText}>{t(lang, "shareLink")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>{bal >= 0 ? t(lang, "youWillGet") : t(lang, "youWillGive")}</Text>
        <Text style={[styles.balanceValue, { color: bal >= 0 ? COLORS.green : COLORS.red }]}>{fmt(bal)}</Text>
      </View>

      <View style={styles.filterRow}>
        {[
          { key: "all", labelKey: "all" },
          { key: "gave", labelKey: "youGave" },
          { key: "got", labelKey: "youGot" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {t(lang, f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visibleTxns}
        keyExtractor={(t) => t.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>{t(lang, "noEntriesFilter")}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.txnRow}
            activeOpacity={role === "admin" ? 0.6 : 1}
            onPress={() => role === "admin" && setEditingTxn(item)}
          >
            <View style={{ flex: 1 }}>
              {item.type === "gave" && (
                <>
                  <Text style={[styles.txnAmount, { color: COLORS.red }]}>{fmt(item.amount)}</Text>
                  <Text style={styles.txnNote}>{item.note} · {item.date}</Text>
                </>
              )}
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {item.type === "got" && (
                <>
                  <Text style={[styles.txnAmount, { color: COLORS.green }]}>{fmt(item.amount)}</Text>
                  <Text style={styles.txnNote}>{item.note} · {item.date}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.red }]} onPress={() => setSheet("gave")}>
          <Text style={styles.actionText}>{t(lang, "youGave")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.green }]} onPress={() => setSheet("got")}>
          <Text style={styles.actionText}>{t(lang, "youGot")}</Text>
        </TouchableOpacity>
      </View>

      <EntrySheet
        visible={sheet === "gave" || sheet === "got"}
        type={sheet === "gave" || sheet === "got" ? sheet : "gave"}
        onCancel={() => setSheet(null)}
        onSave={(entry) => {
          onAddTxn(customer.id, { ...entry, type: sheet });
          setSheet(null);
        }}
      />

      <InvoiceSheet
        visible={sheet === "invoice"}
        products={products}
        customerName={customer.name}
        onCancel={() => setSheet(null)}
        onCreate={(items, total) => {
          onInvoice(customer.id, items, total);
          setSheet(null);
        }}
      />

      <ReceiveQRSheet
        visible={sheet === "qr"}
        customerName={customer.name}
        onCancel={() => setSheet(null)}
        onShare={() => {
          onReceiveShare(customer);
          setSheet(null);
        }}
      />

      <LedgerLinkSheet
        visible={sheet === "link"}
        customer={customer}
        onCancel={() => setSheet(null)}
        onCopy={() => {
          onLinkCopy(customer);
          setSheet(null);
        }}
        onShare={() => {
          onLinkShare(customer);
          setSheet(null);
        }}
      />

      <EditCustomerSheet
        visible={sheet === "editCustomer"}
        customer={customer}
        onCancel={() => setSheet(null)}
        onSave={(updates) => {
          onEditCustomer(customer.id, updates);
          setSheet(null);
        }}
        onDelete={() => {
          onDeleteCustomer(customer.id);
          setSheet(null);
        }}
      />

      <EditTxnSheet
        visible={!!editingTxn}
        txn={editingTxn}
        onCancel={() => setEditingTxn(null)}
        onSave={(updates) => {
          onEditTxn(customer.id, editingTxn.id, updates);
          setEditingTxn(null);
        }}
        onDelete={() => {
          onDeleteTxn(customer.id, editingTxn.id);
          setEditingTxn(null);
        }}
      />
    </View>
  );
}

function ReportsScreen({ customers, expenses, onExport, role, lang }) {
  const totalGet = customers.reduce((s, c) => s + Math.max(balanceOf(c), 0), 0);
  const totalGive = customers.reduce((s, c) => s + Math.max(-balanceOf(c), 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const max = Math.max(totalGet, totalGive, 1);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }}>
      <View style={styles.reportsHeaderRow}>
        <Text style={styles.screenTitle}>{t(lang, "reports")}</Text>
        {role === "admin" && (
          <TouchableOpacity style={styles.exportBtn} onPress={onExport}>
            <Feather name="share-2" size={12} color={COLORS.ink} />
            <Text style={styles.exportText}>{t(lang, "export")}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ marginBottom: 20 }}>
        <View style={styles.barLabelRow}>
          <Text style={styles.barLabel}>{t(lang, "youllGive")}</Text>
          <Text style={[styles.barValue, { color: COLORS.red }]}>{fmt(totalGive)}</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${(totalGive / max) * 100}%`, backgroundColor: COLORS.red }]} />
        </View>
      </View>
      <View style={{ marginBottom: 24 }}>
        <View style={styles.barLabelRow}>
          <Text style={styles.barLabel}>{t(lang, "youllGet")}</Text>
          <Text style={[styles.barValue, { color: COLORS.green }]}>{fmt(totalGet)}</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${(totalGet / max) * 100}%`, backgroundColor: COLORS.green }]} />
        </View>
      </View>
      {role === "admin" && (
        <View style={{ marginBottom: 20, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.rule, paddingTop: 14 }}>
          <Text style={{ fontSize: 11.5, color: COLORS.muted }}>{t(lang, "expensesThisMonth")}</Text>
          <Text style={{ fontSize: 12.5, fontWeight: "700", color: COLORS.red }}>{fmt(totalExpenses)}</Text>
        </View>
      )}
      <View style={{ borderTopWidth: 1, borderTopColor: COLORS.rule, paddingTop: 14 }}>
        <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>{t(lang, "byCustomer")}</Text>
        {customers.map((c) => {
          const bal = balanceOf(c);
          return (
            <View key={c.id} style={styles.customerLine}>
              <Text style={{ fontSize: 12.5, color: COLORS.ink }}>{c.name}</Text>
              <Text style={{ fontSize: 12.5, fontWeight: "700", color: bal >= 0 ? COLORS.green : COLORS.red }}>
                {fmt(bal)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function SignupScreen({ onSignup, lang }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const valid = name.trim() && (email.trim() || phone.trim()) && password.length >= 4;

  return (
    <SafeAreaView style={[styles.appContainer, { justifyContent: "center", padding: 24 }]}>
      <Text style={styles.authTitle}>{t(lang, "createAccountTitle")}</Text>
      <Text style={styles.authSubtitle}>{t(lang, "createAccountSubtitle")}</Text>

      <Text style={styles.label}>{t(lang, "yourName")}</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Karim" placeholderTextColor={COLORS.muted} style={styles.input} />

      <Text style={styles.label}>{t(lang, "email")}</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={COLORS.muted} keyboardType="email-address" autoCapitalize="none" style={styles.input} />

      <Text style={styles.label}>{t(lang, "phone")}</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="070 000 0000" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" style={styles.input} />

      <Text style={styles.label}>{t(lang, "password")}</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor={COLORS.muted} secureTextEntry style={styles.input} />

      <TouchableOpacity
        disabled={!valid}
        onPress={() => onSignup({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })}
        style={[styles.saveBtn, { backgroundColor: valid ? COLORS.ink : COLORS.rule, marginTop: 8 }]}
      >
        <Text style={styles.saveBtnText}>{t(lang, "createAdmin")}</Text>
      </TouchableOpacity>

      <Text style={styles.authNote}>
        Note: this is a local prototype — accounts are saved only on this device, and
        there's no real email/SMS verification yet.
      </Text>
    </SafeAreaView>
  );
}

function LoginScreen({ onLogin, error, lang }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const valid = identifier.trim() && password;

  return (
    <SafeAreaView style={[styles.appContainer, { justifyContent: "center", padding: 24 }]}>
      <Text style={styles.authTitle}>{t(lang, "loginTitle")}</Text>
      <Text style={styles.authSubtitle}>{t(lang, "loginSubtitle")}</Text>

      <Text style={styles.label}>{t(lang, "emailOrPhone")}</Text>
      <TextInput value={identifier} onChangeText={setIdentifier} placeholder="you@example.com or 070..." placeholderTextColor={COLORS.muted} autoCapitalize="none" style={styles.input} />

      <Text style={styles.label}>{t(lang, "password")}</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor={COLORS.muted} secureTextEntry style={styles.input} />

      {!!error && <Text style={{ color: COLORS.red, fontSize: 12, marginBottom: 10 }}>{error}</Text>}

      <TouchableOpacity
        disabled={!valid}
        onPress={() => onLogin({ identifier: identifier.trim(), password })}
        style={[styles.saveBtn, { backgroundColor: valid ? COLORS.ink : COLORS.rule, marginTop: 4 }]}
      >
        <Text style={styles.saveBtnText}>{t(lang, "logIn")}</Text>
      </TouchableOpacity>

      <Text style={styles.authNote}>
        Staff accounts are created by the Admin from Settings → Team. If you're the
        business owner and don't have an account yet, reset the app data to start over.
      </Text>
    </SafeAreaView>
  );
}

function AddStaffSheet({ visible, onCancel, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const valid = name.trim() && (email.trim() || phone.trim()) && password.length >= 4;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add staff account</Text>
            <TouchableOpacity onPress={onCancel}>
              <Feather name="x" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Zahra" placeholderTextColor={COLORS.muted} style={styles.input} />
          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="staff@example.com" placeholderTextColor={COLORS.muted} autoCapitalize="none" style={styles.input} />
          <Text style={styles.label}>Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="070 000 0000" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" style={styles.input} />
          <Text style={styles.label}>Temporary password</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor={COLORS.muted} secureTextEntry style={styles.input} />
          <TouchableOpacity
            disabled={!valid}
            onPress={() => {
              onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
              setName(""); setEmail(""); setPhone(""); setPassword("");
            }}
            style={[styles.saveBtn, { backgroundColor: valid ? COLORS.ink : COLORS.rule }]}
          >
            <Text style={styles.saveBtnText}>Create staff account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TeamScreen({ staff, onBack, onAdd, onRemove, lang }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Feather name="chevron-left" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t(lang, "team")}</Text>
      </View>
      <FlatList
        data={staff}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>{t(lang, "noStaff")}</Text>}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Avatar name={item.name} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.custName}>{item.name}</Text>
              <Text style={styles.custSub}>{item.email || item.phone} · {t(lang, "staffLimited")}</Text>
            </View>
            <TouchableOpacity onPress={() => onRemove(item.id)}>
              <Feather name="trash-2" size={16} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.ink }]} onPress={onAdd}>
          <Text style={styles.saveBtnText}>{t(lang, "addStaff")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SettingsScreen({ onReset, role, currentUser, onOpenTeam, onLogout, lang, onChangeLang }) {
  const [showLangs, setShowLangs] = useState(false);
  return (
    <View style={{ flex: 1, padding: 18 }}>
      <Text style={styles.screenTitle}>{t(lang, "settings")}</Text>

      <View style={styles.backupRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{currentUser.name}</Text>
          <Text style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 2 }}>
            {role === "admin" ? t(lang, "admin") : t(lang, "staff")}
          </Text>
        </View>
      </View>

      <View style={styles.backupRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{t(lang, "storage")}</Text>
          <Text style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 2 }}>
            {t(lang, "storageDesc")}
          </Text>
        </View>
        <Feather name="check-circle" size={18} color={COLORS.green} />
      </View>

      {role === "admin" && (
        <TouchableOpacity style={styles.settingsRow} onPress={onOpenTeam}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{t(lang, "team")}</Text>
            <Feather name="chevron-right" size={16} color={COLORS.muted} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.settingsRow}>
        <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{t(lang, "businessProfile")}</Text>
      </View>
      <View style={styles.settingsRow}>
        <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{t(lang, "reminderSettings")}</Text>
      </View>

      <TouchableOpacity style={styles.settingsRow} onPress={() => setShowLangs((v) => !v)}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{t(lang, "language")}</Text>
          <Text style={{ fontSize: 12.5, color: COLORS.muted }}>{lang}</Text>
        </View>
      </TouchableOpacity>
      {showLangs && (
        <View style={styles.langList}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity key={l} style={styles.langRow} onPress={() => { onChangeLang(l); setShowLangs(false); }}>
              <Text style={{ fontSize: 13, color: COLORS.ink }}>{l}</Text>
              {lang === l && <Feather name="check" size={14} color={COLORS.green} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.settingsRow}>
        <Text style={{ fontSize: 13.5, color: COLORS.ink }}>{t(lang, "helpSupport")}</Text>
      </View>

      <TouchableOpacity style={{ marginTop: 20 }} onPress={onLogout}>
        <Text style={{ fontSize: 12.5, color: COLORS.ink, fontWeight: "600" }}>{t(lang, "logOut")}</Text>
      </TouchableOpacity>

      {role === "admin" && (
        <TouchableOpacity style={{ marginTop: 16 }} onPress={onReset}>
          <Text style={{ fontSize: 12.5, color: COLORS.red, fontWeight: "600" }}>{t(lang, "resetData")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TabBar({ tab, setTab, role, lang }) {
  const allTabs = [
    { key: "ledgers", labelKey: "ledgers", icon: "book-open" },
    { key: "inventory", labelKey: "inventory", icon: "box" },
    { key: "expenses", labelKey: "expenses", icon: "trending-down", adminOnly: true },
    { key: "reports", labelKey: "reports", icon: "bar-chart-2" },
    { key: "settings", labelKey: "settings", icon: "settings" },
  ];
  const tabs = allTabs.filter((tb) => !tb.adminOnly || role === "admin");
  return (
    <View style={styles.tabBar}>
      {tabs.map((tb) => (
        <TouchableOpacity key={tb.key} style={styles.tabItem} onPress={() => setTab(tb.key)}>
          <Feather name={tb.icon} size={16} color={tab === tb.key ? COLORS.ink : COLORS.muted} />
          <Text style={[styles.tabLabel, { color: tab === tb.key ? COLORS.ink : COLORS.muted }]}>
            {t(lang, tb.labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <View style={styles.toastBubble}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState("ledgers");
  const [customers, setCustomers] = useState(SEED);
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Auth state
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [lang, setLang] = useState("English");

  // Load everything once when the app starts
  useEffect(() => {
    (async () => {
      try {
        const savedCustomers = await AsyncStorage.getItem("daftar_customers");
        const savedProducts = await AsyncStorage.getItem("daftar_products");
        const savedExpenses = await AsyncStorage.getItem("daftar_expenses");
        const savedUsers = await AsyncStorage.getItem("daftar_users");
        const savedCurrentUserId = await AsyncStorage.getItem("daftar_current_user");
        const savedLang = await AsyncStorage.getItem("daftar_lang");
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedUsers) setUsers(JSON.parse(savedUsers));
        if (savedCurrentUserId) setCurrentUserId(savedCurrentUserId);
        if (savedLang) setLang(savedLang);
      } catch (e) {
        // ignore, fall back to defaults
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("daftar_customers", JSON.stringify(customers)).catch(() => {});
  }, [customers, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("daftar_products", JSON.stringify(products)).catch(() => {});
  }, [products, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("daftar_expenses", JSON.stringify(expenses)).catch(() => {});
  }, [expenses, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("daftar_users", JSON.stringify(users)).catch(() => {});
  }, [users, loaded]);

  useEffect(() => {
    if (!loaded) return;
    if (currentUserId) {
      AsyncStorage.setItem("daftar_current_user", currentUserId).catch(() => {});
    } else {
      AsyncStorage.removeItem("daftar_current_user").catch(() => {});
    }
  }, [currentUserId, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("daftar_lang", lang).catch(() => {});
  }, [lang, loaded]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const currentUser = users.find((u) => u.id === currentUserId);
  const role = currentUser ? currentUser.role : null;
  const staffUsers = users.filter((u) => u.role === "staff");

  const signUp = ({ name, email, phone, password }) => {
    const id = "u" + Date.now();
    const admin = { id, name, email, phone, password, role: "admin" };
    setUsers([admin]);
    setCurrentUserId(id);
    showToast(`Welcome, ${name}`);
  };

  const logIn = ({ identifier, password }) => {
    const match = users.find(
      (u) => (u.email === identifier || u.phone === identifier) && u.password === password
    );
    if (!match) {
      setLoginError("No account matches that email/phone and password.");
      return;
    }
    setLoginError("");
    setCurrentUserId(match.id);
  };

  const logOut = () => {
    setCurrentUserId(null);
    setTab("ledgers");
    setOpenId(null);
  };

  const addStaff = ({ name, email, phone, password }) => {
    const id = "u" + Date.now();
    setUsers((prev) => [...prev, { id, name, email, phone, password, role: "staff" }]);
    setAddingStaff(false);
    showToast(`${name} can now log in as staff`);
  };

  const removeStaff = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast("Staff account removed");
  };

  const openCustomer = customers.find((c) => c.id === openId);

  const addTxn = (customerId, entry) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, txns: [...c.txns, { id: "t" + Date.now(), ...entry, date: "Today" }] }
          : c
      )
    );
  };

  const addCustomer = ({ name, phone }) => {
    const id = "c" + Date.now();
    setCustomers((prev) => [...prev, { id, name, phone, txns: [] }]);
    setAdding(false);
    setOpenId(id);
  };

  const editCustomer = (customerId, updates) => {
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, ...updates } : c)));
    showToast("Customer updated");
  };

  const deleteCustomer = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setOpenId(null);
    showToast("Customer deleted");
  };

  const editTxn = (customerId, txnId, updates) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, txns: c.txns.map((t) => (t.id === txnId ? { ...t, ...updates } : t)) }
          : c
      )
    );
    showToast("Entry updated");
  };

  const deleteTxn = (customerId, txnId) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, txns: c.txns.filter((t) => t.id !== txnId) } : c
      )
    );
    showToast("Entry deleted");
  };

  const addProduct = (product) => {
    setProducts((prev) => [...prev, { id: "p" + Date.now(), ...product }]);
    setAddingProduct(false);
    showToast(`${product.name} added to inventory`);
  };

  const createInvoice = (customerId, items, total) => {
    const note = "Invoice: " + items.map((i) => `${i.name} x${i.qty}`).join(", ");
    addTxn(customerId, { type: "gave", amount: total, note });
    setProducts((prev) =>
      prev.map((p) => {
        const line = items.find((i) => i.id === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      })
    );
    showToast("Invoice created and shared");
  };

  const addExpense = (expense) => {
    setExpenses((prev) => [{ id: "e" + Date.now(), ...expense, date: "Today" }, ...prev]);
    setAddingExpense(false);
    showToast("Expense recorded");
  };

  const resetData = async () => {
    setCustomers(SEED);
    setProducts(SEED_PRODUCTS);
    setExpenses(SEED_EXPENSES);
    try {
      await AsyncStorage.multiRemove(["daftar_customers", "daftar_products", "daftar_expenses"]);
    } catch (e) {}
    showToast("Data reset to sample data");
  };

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.appContainer, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>{t(lang, "loading")}</Text>
      </SafeAreaView>
    );
  }

  // No account exists yet on this device — create the admin account first
  if (users.length === 0) {
    return <SignupScreen onSignup={signUp} lang={lang} />;
  }

  // Accounts exist, but nobody is logged in on this device right now
  if (!currentUser) {
    return <LoginScreen onLogin={logIn} error={loginError} lang={lang} />;
  }

  if (showTeam) {
    return (
      <SafeAreaView style={styles.appContainer}>
        <TeamScreen
          staff={staffUsers}
          onBack={() => setShowTeam(false)}
          onAdd={() => setAddingStaff(true)}
          onRemove={removeStaff}
          lang={lang}
        />
        <AddStaffSheet visible={addingStaff} onCancel={() => setAddingStaff(false)} onSave={addStaff} />
      </SafeAreaView>
    );
  }

  let screen;
  if (adding) {
    screen = <AddCustomerScreen onCancel={() => setAdding(false)} onSave={addCustomer} lang={lang} />;
  } else if (openCustomer) {
    screen = (
      <LedgerScreen
        customer={openCustomer}
        products={products}
        role={role}
        lang={lang}
        onBack={() => setOpenId(null)}
        onAddTxn={addTxn}
        onEditTxn={editTxn}
        onDeleteTxn={deleteTxn}
        onEditCustomer={editCustomer}
        onDeleteCustomer={deleteCustomer}
        onRemind={(c) => showToast(`Reminder sent to ${c.name}`)}
        onInvoice={createInvoice}
        onReceiveShare={(c) => showToast(`Payment link shared with ${c.name}`)}
        onLinkCopy={(c) => showToast("Ledger link copied")}
        onLinkShare={(c) => showToast(`Ledger link shared with ${c.name} on WhatsApp`)}
      />
    );
  } else if (tab === "ledgers") {
    screen = <HomeScreen customers={customers} onOpen={setOpenId} onAdd={() => setAdding(true)} lang={lang} />;
  } else if (tab === "inventory") {
    screen = <InventoryScreen products={products} onAdd={() => setAddingProduct(true)} role={role} lang={lang} />;
  } else if (tab === "expenses" && role === "admin") {
    screen = <ExpensesScreen expenses={expenses} onAdd={() => setAddingExpense(true)} lang={lang} />;
  } else if (tab === "reports") {
    screen = (
      <ReportsScreen
        customers={customers}
        expenses={expenses}
        onExport={() => showToast("Report exported as PDF")}
        role={role}
        lang={lang}
      />
    );
  } else {
    screen = (
      <SettingsScreen
        onReset={resetData}
        role={role}
        currentUser={currentUser}
        onOpenTeam={() => setShowTeam(true)}
        onLogout={logOut}
        lang={lang}
        onChangeLang={setLang}
      />
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={{ flex: 1 }}>{screen}</View>
      <Toast message={toast} />
      {!adding && !openCustomer && <TabBar tab={tab} setTab={setTab} role={role} lang={lang} />}
      <AddProductSheet visible={addingProduct} onCancel={() => setAddingProduct(false)} onSave={addProduct} />
      <AddExpenseSheet visible={addingExpense} onCancel={() => setAddingExpense(false)} onSave={addExpense} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: COLORS.paper },
  headerBlock: { padding: 18, paddingBottom: 12 },
  appTitle: { fontSize: 23, fontWeight: "700", color: COLORS.ink },
  appSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, padding: 12 },
  summaryLabel: { fontSize: 11, color: COLORS.muted },
  summaryValue: { fontSize: 16, fontWeight: "700", marginTop: 3 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.ink },
  empty: { textAlign: "center", marginTop: 40, color: COLORS.muted, fontSize: 13 },
  custRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  custName: { fontSize: 13.5, fontWeight: "600", color: COLORS.ink },
  custSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  custBal: { fontSize: 13.5, fontWeight: "700" },
  custTag: { fontSize: 9.5, color: COLORS.muted, marginTop: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.ink, alignItems: "center", justifyContent: "center" },
  avatarText: { color: COLORS.paper, fontSize: 13, fontWeight: "700" },
  fab: { position: "absolute", right: 20, bottom: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.ink, alignItems: "center", justifyContent: "center" },
  screenHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingBottom: 8 },
  screenTitle: { fontSize: 17, fontWeight: "700", color: COLORS.ink },
  label: { fontSize: 11.5, color: COLORS.muted, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, padding: 12, fontSize: 13.5, color: COLORS.ink, backgroundColor: COLORS.surface, marginBottom: 16 },
  saveBtn: { paddingVertical: 14, borderRadius: 4, alignItems: "center" },
  saveBtnText: { color: COLORS.paper, fontWeight: "700", fontSize: 14 },
  remindBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: COLORS.ink, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 7 },
  remindText: { fontSize: 11.5, fontWeight: "700", color: COLORS.ink },
  balanceBlock: { alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  balanceLabel: { fontSize: 11, color: COLORS.muted },
  balanceValue: { fontSize: 22, fontWeight: "700", marginTop: 2 },
  colHeaders: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  colHeaderText: { fontSize: 10.5, color: COLORS.muted },
  txnRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.rule, borderStyle: "dashed" },
  txnAmount: { fontSize: 13.5, fontWeight: "700" },
  txnNote: { fontSize: 10.5, color: COLORS.muted, marginTop: 1 },
  actionBtn: { flex: 1, paddingVertical: 14, alignItems: "center" },
  actionText: { color: COLORS.surface, fontWeight: "700", fontSize: 13.5 },
  reportsHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.surface },
  exportText: { fontSize: 11, fontWeight: "700", color: COLORS.ink },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  barLabel: { fontSize: 11.5, color: COLORS.muted },
  barValue: { fontSize: 12.5, fontWeight: "700" },
  barTrack: { height: 10, backgroundColor: COLORS.rule, borderRadius: 2, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  customerLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 },
  backupRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.rule, marginBottom: 4 },
  settingsRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  tabBar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.rule, backgroundColor: COLORS.surface, paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 8 },
  tabLabel: { fontSize: 8.5, fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(20,30,20,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, paddingBottom: 28 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 15, fontWeight: "700" },
  amountInput: { borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, padding: 12, fontSize: 18, color: COLORS.ink, backgroundColor: COLORS.paper, marginBottom: 14 },
  toastWrap: { position: "absolute", bottom: 90, left: 0, right: 0, alignItems: "center" },
  toastBubble: { backgroundColor: COLORS.ink, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 6 },
  toastText: { color: COLORS.paper, fontSize: 12, fontWeight: "500" },
  quickActionsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  productRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  expenseRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  lowStockTag: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  lowStockText: { fontSize: 9.5, color: COLORS.red },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: COLORS.rule },
  filterChipActive: { backgroundColor: COLORS.ink, borderColor: COLORS.ink },
  filterChipText: { fontSize: 11.5, color: COLORS.ink, fontWeight: "600" },
  filterChipTextActive: { color: COLORS.paper },
  invoiceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  qtyBtn: { width: 26, height: 26, borderRadius: 4, borderWidth: 1, borderColor: COLORS.rule, alignItems: "center", justifyContent: "center", marginHorizontal: 4 },
  qtyText: { fontSize: 13, fontWeight: "700", color: COLORS.ink, minWidth: 18, textAlign: "center" },
  invoiceTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.rule, marginTop: 6, marginBottom: 6 },
  qrBox: { alignItems: "center", justifyContent: "center", paddingVertical: 24, backgroundColor: COLORS.paper, borderRadius: 8, marginBottom: 14 },
  langList: { backgroundColor: COLORS.surface, borderRadius: 4, marginBottom: 4, borderWidth: 1, borderColor: COLORS.rule },
  langRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  linkBox: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: COLORS.paper, marginBottom: 14 },
  linkText: { fontSize: 12.5, color: COLORS.ink, flex: 1 },
  linkPreview: { borderWidth: 1, borderColor: COLORS.rule, borderRadius: 4, padding: 12, backgroundColor: COLORS.paper, marginBottom: 16 },
  authTitle: { fontSize: 21, fontWeight: "700", color: COLORS.ink, marginBottom: 6 },
  authSubtitle: { fontSize: 12, color: COLORS.muted, marginBottom: 20, lineHeight: 17 },
  authNote: { fontSize: 10.5, color: COLORS.muted, marginTop: 16, lineHeight: 15 },
});
