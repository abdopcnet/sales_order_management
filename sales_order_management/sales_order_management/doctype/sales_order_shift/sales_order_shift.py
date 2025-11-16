# Copyright (c) 2025, abdopcnet@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _


class SalesOrderShift(Document):
    def onload(self):
        """Initialize document with default values"""
        try:
            if not self.user:
                self.user = frappe.session.user
            if not self.posting_date:
                self.posting_date = frappe.utils.today()
        except Exception as e:
            frappe.logger().error(f"[[sales_order_shift.py]] onload: {str(e)}")
            frappe.throw(_("Error loading document"))

    def before_save(self):
        """Calculate totals before saving"""
        try:
            # Calculate document totals from child table
            self.paid_total = sum(
                row.paid_amount for row in self.sales_order_shift_payments)
        except Exception as e:
            frappe.logger().error(
                f"[[sales_order_shift.py]] before_save: {str(e)}")
            frappe.throw(_("Error saving document"))

    def populate_payments(self):
        """Fetch payments from Payment Entry only"""
        try:
            self.sales_order_shift_payments = []
            if not self.posting_date or not self.branch or not self.user:
                return

            # Query: Get payments grouped by mode_of_payment
            payments = frappe.db.sql("""
                SELECT
                    pe.mode_of_payment,
                    SUM(pe.paid_amount) AS paid_amount
                FROM
                    `tabPayment Entry` pe
                WHERE
                    pe.docstatus = 1
                    AND pe.posting_date = %(posting_date)s
                    AND pe.branch = %(branch)s
                    AND pe.modified_by = %(user)s
                GROUP BY
                    pe.mode_of_payment
                ORDER BY
                    pe.mode_of_payment
            """, {
                'posting_date': self.posting_date,
                'branch': self.branch,
                'user': self.user
            }, as_dict=1)

            # Append payments to child table
            for payment in payments:
                self.append('sales_order_shift_payments', {
                    'mode_of_payment': payment.get('mode_of_payment'),
                    'paid_amount': payment.get('paid_amount') or 0
                })

            # Calculate document totals
            self.paid_total = sum(
                row.paid_amount for row in self.sales_order_shift_payments)

        except Exception as e:
            frappe.logger().error(
                f"[[sales_order_shift.py]] populate_payments: {str(e)}")
            frappe.throw(_("Error fetching payments"))


@frappe.whitelist()
def refresh_payments(docname):
    """Refresh payments for Sales Order Shift (API endpoint)"""
    try:
        doc = frappe.get_doc("Sales Order Shift", docname)
        doc.populate_payments()
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        return {
            "status": "success",
            "paid_total": doc.paid_total
        }
    except Exception as e:
        frappe.logger().error(
            f"[[sales_order_shift.py]] refresh_payments: {str(e)}")
        frappe.throw(_("Error refreshing payments"))
