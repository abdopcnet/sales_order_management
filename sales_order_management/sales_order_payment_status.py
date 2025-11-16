import frappe


def update_payment_status(doc, method=None):
    """
    Auto Update Payment Status in Sales Order
    Called on validate event
    """
    if doc.advance_paid == 0:
        doc.custom_payment_status = "not_paid"
    elif doc.advance_paid < doc.grand_total:
        doc.custom_payment_status = "partly_paid"
    else:
        doc.custom_payment_status = "full_paid"
