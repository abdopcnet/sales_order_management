// Copyright (c) 2025, future_support and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sales Order Shift", {
  refresh(frm) {
    try {
      // Set default values for new documents
      if (frm.doc.__islocal) {
        if (!frm.doc.user) {
          frm.set_value("user", frappe.session.user);
        }
        if (!frm.doc.posting_date) {
          frm.set_value("posting_date", frappe.datetime.get_today());
        }
      }

      // Add refresh button for saved documents
      if (!frm.doc.__islocal && frm.doc.name) {
        frm.add_custom_button(__("إعادة فحص المدفوعات"), () => {
          frappe.call({
            method:
              "sales_order_management.sales_order_management.doctype.sales_order_shift.sales_order_shift.refresh_payments",
            args: {
              docname: frm.doc.name,
            },
            freeze: true,
            freeze_message: __("جاري إعادة فحص المدفوعات..."),
            callback: function (r) {
              if (r.message && r.message.status === "success") {
                frappe.show_alert({
                  message: __("تم تحديث المدفوعات بنجاح"),
                  indicator: "green",
                });
                frm.reload_doc();
              } else {
                console.log("[sales_order_shift.js] refresh callback: No success status");
              }
            },
            error: function (err) {
              console.log("[sales_order_shift.js] refresh error:", err);
            },
          });
        });
      }
    } catch (err) {
      console.log("[sales_order_shift.js] refresh handler error:", err);
    }
  },
});
