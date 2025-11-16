frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        // Only Administrator is excluded from this script
        if (frappe.session.user === "Administrator") {
            return; // Exit early if user is Administrator
        }
        
        setTimeout(() => {
            [
                "Pick List",
                "Delivery Note",
                "Work Order",
                "Material Request",
                "Request for Raw Materials",
                "Purchase Order",
                "Project",
                "Payment Request"
            ].forEach(btn => frm.remove_custom_button(btn, "Create"));

            // Hide "Payment" if grand_total == advance_paid
            if (flt(frm.doc.grand_total) === flt(frm.doc.advance_paid)) {
                frm.remove_custom_button("Payment", "Create");
            }

            // Hide "Sales Invoice" if grand_total != advance_paid
            if (flt(frm.doc.grand_total) !== flt(frm.doc.advance_paid)) {
                frm.remove_custom_button("Sales Invoice", "Create");
            }
        }, 500);
    },
    grand_total: function(frm) {
        frm.events.refresh(frm);
    },
    advance_paid: function(frm) {
        frm.events.refresh(frm);
    }
});
