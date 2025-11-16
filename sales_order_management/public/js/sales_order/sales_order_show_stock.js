// =======================
// ✅ Sales Order - Show Stock on Actual Qty Click
// =======================
frappe.ui.form.on("Sales Order", {
  refresh(frm) {
    if (frm.doc.docstatus === 0) {
      bind_actual_qty_click(frm);
    }
  },
});

function bind_actual_qty_click(frm) {
  (frm.fields_dict.items.grid.grid_rows || []).forEach((gr) => bind_click_on_actual_qty(frm, gr));

  frm.fields_dict.items.grid.wrapper.on("row_added", function (event, grid_row) {
    bind_click_on_actual_qty(frm, grid_row);
  });
}

function bind_click_on_actual_qty(frm, grid_row) {
  const $row = $(grid_row.row);
  const $cell = $row.find('[data-fieldname="actual_qty"]');

  if (!$cell.length) return; // تم إزالة التحقق من 'data-bound'

  $cell.css("cursor", "pointer");

  // إزالة أي حدث 'click' سابق قبل ربط حدث جديد
  $cell.off("click").on("click", function () {
    open_stock_dialog(frm, grid_row);
  });
}

function open_stock_dialog(frm, grid_row) {
  if (frm.doc.docstatus !== 0) return;

  const row = grid_row.doc;

  if (!row.item_code) {
    frappe.msgprint(__("الرجاء اختيار الصنف أولاً"));
    return;
  }

  frappe.call({
    method: "frappe.client.get_list",
    args: {
      doctype: "Bin",
      filters: { item_code: row.item_code },
      fields: ["warehouse", "actual_qty"],
      order_by: "warehouse",
    },
    callback: function (r) {
      const list = r.message || [];
      if (!list.length) {
        frappe.msgprint(__("لا يوجد رصيد مسجل لهذا الصنف في أي مخزن"));
        return;
      }

      let total = 0;
      let counter = 1;

      let rows_html = list
        .map((d) => {
          const wh = frappe.utils.escape_html(d.warehouse || "");
          const qty = d.actual_qty || 0;
          total += qty;
          const qty_style = qty <= 0 ? ' style="color:red;"' : "";

          return `<tr data-warehouse="${wh}">
                            <td>${counter++}</td>
                            <td>${wh}</td>
                            <td${qty_style}>${qty}</td>
                        </tr>`;
        })
        .join("");

      const html = `
                <table class="table table-bordered custom-stock-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>المخزن</th>
                            <th>الرصيد الفعلي</th>
                        </tr>
                    </thead>
                    <tbody>${rows_html}</tbody>
                    <tfoot>
                        <tr>
                            <th colspan="2">الإجمالي</th>
                            <th>${total.toFixed(4)}</th>
                        </tr>
                    </tfoot>
                </table>
            `;

      const d = new frappe.ui.Dialog({
        title: "أرصدة المخازن للصنف: " + row.item_code,
        fields: [{ fieldtype: "HTML", fieldname: "stock_html" }],
        primary_action_label: "إغلاق",
        primary_action() {
          d.hide();
        },
        size: "large",
      });

      d.fields_dict.stock_html.$wrapper.html(html);

      $(`<style>
                .custom-stock-table thead { background-color: #f0f0f0; color: #000; font-weight: bold; }
                .custom-stock-table tfoot { background-color: #f0f0f0; color: #000; font-weight: bold; }
                .custom-stock-table td, .custom-stock-table th { padding: 6px 8px; vertical-align: middle; }
            </style>`).appendTo(d.$wrapper);

      d.show();
    },
  });
}
