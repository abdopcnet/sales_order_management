// Sales Order form events
frappe.ui.form.on('Sales Order', {
    // On form refresh: fill branch and cost center in taxes table if missing
    refresh(frm) {
        if (frm.doc.docstatus === 0) { // Only run if draft
            set_branch_and_cost_center(frm);
        }
    },
    
    // When branch is changed: update all tax rows with new branch
    branch(frm) {
        if (frm.doc.docstatus === 0) { // Only run if draft
            (frm.doc.taxes || []).forEach(d => {
                frappe.model.set_value(d.doctype, d.name, "branch", frm.doc.branch);
            });
        }
    },
    
    // When cost center is changed: update all tax rows with new cost center
    cost_center(frm) {
        if (frm.doc.docstatus === 0) { // Only run if draft
            (frm.doc.taxes || []).forEach(d => {
                frappe.model.set_value(d.doctype, d.name, "cost_center", frm.doc.cost_center);
            });
        }
    },
    
    // When taxes table is rendered: make sure fields are filled
    taxes_on_form_rendered(frm) {
        if (frm.doc.docstatus === 0) { // Only run if draft
            set_branch_and_cost_center(frm);
        }
    }
});

// Event for Sales Taxes and Charges child table
frappe.ui.form.on('Sales Taxes and Charges', {
    // When new tax row is added: set branch and cost center from main form
    taxes_add(frm, cdt, cdn) {
        if (frm.doc.docstatus === 0) { // Only run if draft
            let row = locals[cdt][cdn];
            frappe.model.set_value(cdt, cdn, "branch", frm.doc.branch);
            frappe.model.set_value(cdt, cdn, "cost_center", frm.doc.cost_center);
        }
    }
});

// Helper function to fill missing branch and cost center in taxes table
function set_branch_and_cost_center(frm) {
    if (frm.doc.docstatus === 0) { // Only run if draft
        (frm.doc.taxes || []).forEach(d => {
            if (!d.branch && frm.doc.branch) {
                frappe.model.set_value(d.doctype, d.name, "branch", frm.doc.branch);
            }
            if (!d.cost_center && frm.doc.cost_center) {
                frappe.model.set_value(d.doctype, d.name, "cost_center", frm.doc.cost_center);
            }
        });
    }
}
