 FinançasBot is an simple and agile, serverless WhatsApp chatbot built with Node.js to help users overcome the friction of tracking daily personal expenses. Instead of opening a slow app or spreadsheet, users can log an expense in seconds using natural, short text inputs directly inside a dedicated WhatsApp group.

 🛠️ Core Architecture & Features
· Real-time Event Hooking: Uses whatsapp-web.js to initialize a headless browser (Puppeteer) instance, authenticating via QR Code and listening to both incoming and outgoing messages seamlessly using the message_create event hook.

· Robust String Parsing (Regex): Sanitizes and tokens multi-line or multi-space inputs using Regular Expressions (/\s+/) to isolate the product description from the numeric price value.

· Strict Input Validation: Implements backend validation checks to catch format errors, missing values, or invalid inputs, preventing data corruption.

· Dynamic Data Formatting: Uses the native JavaScript Intl.NumberFormat API to dynamically structure numeric outputs into Brazilian Real currency (pt-BR / BRL) formatting for end-user visibility.

· Flat-File Data Persistence: Manages local database state by reading and writing structured arrays asynchronously into a local flat-file transacoes.json database using Node's fs (File System) module.

<img width="612" height="438" alt="Recording 2026-06-03 122035" src="https://github.com/user-attachments/assets/134e9de1-3e59-4d9b-9a64-82ee34b7b03e" />


  FinançasBot - User Guide
Welcome to the FinançasBot setup and user manual. This guide will walk you through how to initialize the bot, configure your WhatsApp environment, and interact with the system commands.

 1. Installation & Setup
To get this bot running locally on your machine, follow these simple execution steps in your terminal:

Install dependencies:

Bash
npm install
Start the application:

Bash
node index.js

Authentication: A QR Code will render directly inside your terminal interface. Open WhatsApp on your mobile device, navigate to Linked Devices (Aparelhos Conectados), scan the code, and wait for the confirmation message:
💰 FINANÇAS BOT IS ONLINE AND READY!

 2. WhatsApp Group Configuration
Because the backend features a strict security boundary filter, it will ignore all random personal messages and external chats. To use the bot, you must set up a specific channel:

Create a new group chat on your WhatsApp.

Change the group name to exactly: gastos (Case-insensitive, meaning it can be gastos, Gastos, or GASTOS).

You can use your own personal phone number to type commands inside this group. The bot uses the message_create event listener, which allows it to intercept and process your own typed inputs seamlessly.

 3. Core Commands & Input Format
Once inside your GASTOS group, you can control your flat-file database using three main pathways:

A. Registering a New Expense (Multi-Word Description)
To save a new item, type the name of the expense followed by the numeric value separated by spaces.

The Syntax Rule: The price must always be the very last word of your text. You can use commas or dots for decimals.

Examples:

Água 2,50

Panela de pressão 129.90

Chuveiro elétrico lorenzetti 85,00

The Bot's Action: It will isolate the price from right to left, convert the human comma into a machine dot, save a structured object into your transacoes.json database, and reply with a localized BRL currency string (R$ 129,90).

B. Generating the Financial Report
To review your full historical log and check your mathematical wallet aggregation, send this exact command:

Command: !total

The Bot's Action: It parses your stored JSON data array, formats each row row-by-row into localized Brazilian Real symbols, calculates the total sum, and responds with a detailed dashboard:

 FINANCIAL REPORT: > • Água: R$ 2,50

• Panela de pressão: R$ 129,90

 Total Spent: R$ 132,40

C. Wiping Out the Database
If you want to flush your transactions and reset your tracking history back to zero:

Command: !clear

The Bot's Action: It safely overwrites your local storage file with a clean, empty array ([]) without crashing the script architecture, replying with: 🧹 History Cleared!.

 4. Production Security Warning
The application utilizes a local authentication strategy (LocalAuth) that stores your active login session configurations inside a hidden directory named .wwebjs_auth/.

Before pushing your code repository to GitHub, verify that your project includes a active .gitignore file containing the following code line boundaries to prevent exposing your personal network tokens online:

Plaintext
node_modules/
.wwebjs_auth/
.wwebjs_cache/
transacoes.json
