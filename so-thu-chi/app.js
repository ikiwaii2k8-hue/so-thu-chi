/* =========================
FILE: app.js
========================= */

const STORAGE_KEY =
  "UTNHUNG_SYSTEM";

let hot;
let chart;

let sheets = {
  "Trang 1":[]
};

let currentSheet =
  "Trang 1";

let invoiceItems = [];

/* =========================
SHOW TAB
========================= */

function showTab(tab){

  document
    .querySelectorAll(".tab")
    .forEach(t=>{
      t.classList.add("hidden");
    });

  document
    .getElementById(tab + "Tab")
    .classList.remove("hidden");
}

/* =========================
FORMAT MONEY
========================= */

function formatMoney(number){

  return Number(number)
    .toLocaleString("vi-VN") + " đ";
}

/* =========================
LOAD DATA
========================= */

function loadData(){

  const saved =
    JSON.parse(
      localStorage.getItem(
        STORAGE_KEY
      )
    );

  if(saved){

    sheets = saved;
  }
}

/* =========================
INIT SPREADSHEET
========================= */

function initSpreadsheet(){

  const container =
    document.getElementById(
      "spreadsheet"
    );

  hot =
    new Handsontable(
      container,
      {

      data:
        sheets[currentSheet],

      rowHeaders:true,

      colHeaders:[

        "Ngày",
        "Diễn giải",
        "Số tiền",
        "Loại",
        "Người ghi",
        "Thời gian"

      ],

      columns:[

        {
          type:"date"
        },

        {
          type:"text"
        },

        {
          type:"numeric",

          numericFormat:{
            pattern:"0,0"
          }
        },

        {
          type:"text"
        },

        {
          type:"text"
        },

        {
          type:"text"
        }

      ],

      minRows:25,

      stretchH:"all",

      licenseKey:
      "non-commercial-and-evaluation"

    });

  hot.addHook(
    "afterChange",
    ()=>{
      calculateTotals();
    }
  );

  renderSheetTabs();

  calculateTotals();
}

/* =========================
SAVE
========================= */

function saveData(){

  sheets[currentSheet] =
    hot.getData();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(sheets)
  );

  alert("Đã lưu dữ liệu!");
}

/* =========================
SHEETS
========================= */

function addSheet(){

  const name =
    prompt("Tên trang:");

  if(!name) return;

  sheets[name] = [];

  currentSheet = name;

  renderSheetTabs();

  hot.loadData(
    sheets[currentSheet]
  );
}

function switchSheet(name){

  currentSheet = name;

  renderSheetTabs();

  hot.loadData(
    sheets[currentSheet]
  );

  calculateTotals();
}

function renderSheetTabs(){

  const container =
    document.getElementById(
      "sheetTabs"
    );

  container.innerHTML = "";

  Object.keys(sheets)
    .forEach(name=>{

      container.innerHTML += `
        <div
          class="
            sheet-tab
            ${
              name === currentSheet
              ? "active"
              : ""
            }
          "

          onclick="
            switchSheet('${name}')
          "
        >

          ${name}

        </div>
      `;
    });
}

/* =========================
TOTALS
========================= */

function calculateTotals(){

  const data =
    hot.getData();

  let total = 0;

  data.forEach(row=>{

    const amount =
      Number(row[2]) || 0;

    total += amount;
  });

  const vat =
    total * 0.01;

  const pit =
    total * 0.005;

  document.getElementById(
    "totalRevenue"
  ).innerText =
    formatMoney(total);

  document.getElementById(
    "vatTax"
  ).innerText =
    formatMoney(vat);

  document.getElementById(
    "pitTax"
  ).innerText =
    formatMoney(pit);

  document.getElementById(
    "dashboardRevenue"
  ).innerText =
    formatMoney(total);

  document.getElementById(
    "dashboardVAT"
  ).innerText =
    formatMoney(vat);

  document.getElementById(
    "dashboardPIT"
  ).innerText =
    formatMoney(pit);

  renderChart(total);

  calculateYearTax(total);
}

/* =========================
CHART
========================= */

function renderChart(total){

  const ctx =
    document.getElementById(
      "chart"
    );

  if(chart){
    chart.destroy();
  }

  chart =
    new Chart(ctx,{

      type:"bar",

      data:{

        labels:[
          "Doanh thu"
        ],

        datasets:[{

          label:"VNĐ",

          data:[total]

        }]
      }
    });
}

/* =========================
TAX
========================= */

function calculateYearTax(total){

  let licenseTax = 0;

  if(total > 1000000000){

    licenseTax = 3000000;
  }

  const totalTax =
    (
      total * 0.01
    ) +
    (
      total * 0.005
    ) +
    licenseTax;

  document.getElementById(
    "yearRevenue"
  ).innerText =
    formatMoney(total);

  document.getElementById(
    "licenseTax"
  ).innerText =
    formatMoney(licenseTax);

  document.getElementById(
    "totalTax"
  ).innerText =
    formatMoney(totalTax);
}

/* =========================
EXPORT EXCEL
========================= */

function exportExcel(){

  const workbook =
    XLSX.utils.book_new();

  Object.keys(sheets)
    .forEach(name=>{

      const worksheet =
        XLSX.utils.aoa_to_sheet(
          sheets[name]
        );

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        name
      );
    });

  XLSX.writeFile(
    workbook,
    "so-thu-chi.xlsx"
  );
}

/* =========================
PDF
========================= */

async function exportPDF(){

  const { jsPDF } =
    window.jspdf;

  const doc =
    new jsPDF();

  doc.text(
    "SO THU CHI",
    20,
    20
  );

  doc.save(
    "so-thu-chi.pdf"
  );
}

/* =========================
PRINT
========================= */

function printLedger(){

  window.print();
}

/* =========================
BACKUP
========================= */

function backupData(){

  const blob =
    new Blob(
      [
        JSON.stringify(sheets)
      ],
      {
        type:"application/json"
      }
    );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "backup.json";

  a.click();
}

/* =========================
CLEAR
========================= */

function clearAllData(){

  if(
    confirm(
      "Xóa toàn bộ dữ liệu?"
    )
  ){

    localStorage.clear();

    location.reload();
  }
}

/* =========================
INVOICE
========================= */

function addInvoiceItem(){

  const item =
    document.getElementById(
      "itemName"
    ).value;

  const qty =
    Number(
      document.getElementById(
        "qty"
      ).value
    );

  const price =
    Number(
      document.getElementById(
        "price"
      ).value
      .replace(/[^\d]/g,'')
    );

  invoiceItems.push({
    item,
    qty,
    price
  });

  renderInvoice();
}

function renderInvoice(){

  const body =
    document.getElementById(
      "invoiceBody"
    );

  body.innerHTML = "";

  let total = 0;

  invoiceItems.forEach(i=>{

    const amount =
      i.qty * i.price;

    total += amount;

    body.innerHTML += `
      <tr>

        <td>${i.item}</td>

        <td>${i.qty}</td>

        <td>
          ${formatMoney(i.price)}
        </td>

        <td>
          ${formatMoney(amount)}
        </td>

      </tr>
    `;
  });

  document.getElementById(
    "invoiceTotal"
  ).innerText =
    formatMoney(total);
}

function printInvoice(){

  window.print();
}

/* =========================
INIT
========================= */

loadData();

initSpreadsheet();