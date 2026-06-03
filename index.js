const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

// ─── CONFIGURATIONS ──────────────────────────────────────────────
const transactions = path.join(__dirname, "transacoes.json");

// Initialize the JSON file with an empty array if it doesn't exist
if (!fs.existsSync(transactions)) {
  fs.writeFileSync(transactions, "[]", "utf-8");
}

// ─── BRL CURRENCY FORMATTER ──────────────────────────────────────
const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// ─── DATABASE HELPERS (JSON File Management) ─────────────────────
function carregarGastos() {
  try {
    if (!fs.existsSync(transactions)) return [];
    const dados = fs.readFileSync(transactions, "utf-8");
    return JSON.parse(dados);
  } catch (error) {
    console.error(
      "Error reading JSON file, resetting to empty array:",
      error.message,
    );
    return [];
  }
}

function salvarGastos(lista) {
  try {
    fs.writeFileSync(transactions, JSON.stringify(lista, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to JSON file:", error.message);
  }
}

// ─── WHATSAPP CLIENT INITIALIZATION ──────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("💰 FINANÇAS BOT IS ONLINE AND READY!");
});

// ─── CORE LOGIC (Message Listener) ───────────────────────────────
client.on("message_create", async (msg) => {
  const chat = await msg.getChat();

  // 1. FILTER: Ignore everything outside the "GASTOS" group
  if (!chat.isGroup || chat.name.toUpperCase() !== "GASTOS") {
    return;
  }

  const texto = msg.body.trim();

  // 2. PATH A: Generate Financial Report (!total)
  if (texto.toLowerCase() === "!total") {
    const gastos = carregarGastos();

    if (gastos.length === 0) {
      return msg.reply("No expenses recorded yet! Your wallet is safe. 💸");
    }

    let resumo = "📊 *FINANCIAL REPORT:*\n\n";
    let somaTotal = 0;

    gastos.forEach((g) => {
      resumo += `• ${g.produto}: ${formatadorBRL.format(g.valor)}\n`;
      somaTotal += g.valor;
    });

    resumo += `\n📉 *Total Spent: ${formatadorBRL.format(somaTotal)}*`;
    return msg.reply(resumo);
  }

  // 3. PATH B: Clear History (!clear)
  else if (texto.toLowerCase() === "!clear") {
    // Overwrite database with a clean, empty array
    salvarGastos([]);
    return msg.reply(
      "🧹 *History Cleared!* All your expense records have been wiped out successfully.",
    );
  }

  // 4. PATH C: Register New Expense (Supports Multi-word products!)
  else {
    // Split string by spaces using Regex
    const partes = texto.split(/\s+/);

    // Safety check: Needs at least a product name and a price element (min 2 items)
    if (partes.length < 2) return;

    // MAGICAL PART: Pop the very last item out of the array (the price)
    let valorTexto = partes.pop();

    // Rejoin all remaining array elements back into a string with spaces (the product name)
    const produto = partes.join(" ");

    // Convert human-friendly comma (,) to machine-friendly dot (.)
    if (valorTexto) {
      valorTexto = valorTexto.replace(",", ".");
    }

    // Convert string value to a real floating-point number
    const valorNumerico = parseFloat(valorTexto);

    // Safety validation: verify if it's a real positive number
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return;
    }

    // Create the new transaction object
    const novoGasto = {
      produto: produto,
      valor: valorNumerico,
      data: new Date().toISOString(),
    };

    // Load old list, push the new item, and save back to the HD
    const listaAtual = carregarGastos();
    listaAtual.push(novoGasto);
    salvarGastos(listaAtual);

    // Send visual confirmation back to WhatsApp
    await msg.reply(
      `🤖 *Expense Recorded!*\n\n📝 *Item:* ${produto}\n💵 *Value:* ${formatadorBRL.format(valorNumerico)}\n\nSaved successfully to your database! ✅`,
    );

    console.log(
      `[SUCCESS] Saved: ${produto} - ${formatadorBRL.format(valorNumerico)}`,
    );
  }
});

client.initialize();
