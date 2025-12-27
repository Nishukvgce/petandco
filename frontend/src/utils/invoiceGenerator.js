// Invoice generator utility
export const generateInvoice = (order, user, settings = {}) => {
  const siteName = settings.siteName || "PET&CO";
  const currentDate = new Date().toLocaleDateString('en-IN');
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A';
  
  const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderNumber || order.orderId}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e67e22;
            padding-bottom: 20px;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .company-logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .company-info h1 {
            color: #e67e22;
            margin: 0;
            font-size: 28px;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            color: #333;
            margin: 0;
            font-size: 24px;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        .bill-to, .ship-to {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
        }
        .bill-to h3, .ship-to h3 {
            margin-top: 0;
            color: #e67e22;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
        }
        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .order-table th {
            background: #e67e22;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .order-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .order-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .totals-row.total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #e67e22;
            border-bottom: 2px solid #e67e22;
            color: #e67e22;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
        .payment-info {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        @media (max-width: 768px) {
            body {
                padding: 10px;
                font-size: 14px;
            }
            .invoice-container {
                padding: 20px;
            }
            .header {
                flex-direction: column;
                text-align: center;
                gap: 20px;
            }
            .logo-section {
                justify-content: center;
            }
            .company-logo {
                width: 50px;
                height: 50px;
            }
            .company-info h1 {
                font-size: 24px;
            }
            .invoice-info {
                text-align: center;
            }
            .invoice-info h2 {
                font-size: 20px;
            }
            .invoice-details {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .order-table {
                font-size: 12px;
            }
            .order-table th,
            .order-table td {
                padding: 8px 4px;
            }
            .totals {
                width: 100%;
                margin-left: 0;
            }
        }
        @media (max-width: 480px) {
            .invoice-container {
                padding: 15px;
            }
            .company-info h1 {
                font-size: 20px;
            }
            .logo-section {
                flex-direction: column;
                gap: 10px;
            }
            .order-table {
                font-size: 11px;
            }
            .order-table th,
            .order-table td {
                padding: 6px 2px;
            }
        }
        @media print {
            body { background: white; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <div class="logo-section">
                    <img src="/assets/images/logo.png" alt="${siteName} Logo" class="company-logo">
                    <h1>${siteName}</h1>
                </div>
                <p>Natural & Organic Products</p>
                <p>Email: info@petco.com</p>
                <p>Phone: +91 9845651468</p>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${order.orderNumber || order.orderId}</p>
                <p><strong>Date:</strong> ${currentDate}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
            </div>
        </div>

        <div class="invoice-details">
            <div class="bill-to">
                <h3>Bill To:</h3>
                <p><strong>${order.customerName || user.name}</strong></p>
                <p>${order.customerEmail || user.email}</p>
                <p>${order.customerPhone || user.phone}</p>
            </div>
            <div class="ship-to">
                <h3>Ship To:</h3>
                <p><strong>${order.shipping?.name || order.customerName || user.name || 'N/A'}</strong></p>
                <p>${order.shipping?.street || 'Address not available'}</p>
                ${order.shipping?.landmark ? `<p>Landmark: ${order.shipping.landmark}</p>` : ''}
                <p>${order.shipping?.city || 'N/A'}, ${order.shipping?.state || 'N/A'} - ${order.shipping?.pincode || 'N/A'}</p>
                <p>Phone: ${order.shipping?.phone || order.customerPhone || user.phone || 'N/A'}</p>
                ${order.shipping?.addressType ? `<p>Address Type: ${order.shipping.addressType}</p>` : ''}
            </div>
        </div>

        <table class="order-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${(order.items || order.orderItems || []).map(item => {
                  const itemName = item.product?.name || item.name || item.productName || item.title || 'Unknown Item';
                  const itemPrice = parseFloat(item.price || item.unitPrice || 0);
                  const itemQuantity = parseInt(item.quantity || 1);
                  const itemTotal = itemPrice * itemQuantity;
                  
                  return `
                    <tr>
                        <td>
                            <strong>${itemName}</strong>
                            ${item.product?.category ? `<br><small>Category: ${item.product.category}</small>` : ''}
                            ${item.product?.sku ? `<br><small>SKU: ${item.product.sku}</small>` : ''}
                        </td>
                        <td>${itemQuantity}</td>
                        <td>₹${itemPrice.toFixed(2)}</td>
                        <td>₹${itemTotal.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="4" style="text-align: center; color: #666;">No items found</td></tr>'}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>₹${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>Shipping:</span>
                <span>${parseFloat(order.shippingFee || 0) === 0 ? 'Free' : `₹${parseFloat(order.shippingFee || 0).toFixed(2)}`}</span>
            </div>
            ${parseFloat(order.discount || 0) > 0 ? `
                <div class="totals-row">
                    <span>Discount:</span>
                    <span>-₹${parseFloat(order.discount || 0).toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="totals-row total">
                <span>Total:</span>
                <span>₹${parseFloat(order.total || 0).toFixed(2)}</span>
            </div>
        </div>

        <div class="payment-info">
            <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod || 'Not specified'}</p>
            <p><strong>Order Status:</strong> ${order.status || 'Pending'}</p>
        </div>

        <div class="footer">
            <p>Thank you for shopping with ${siteName}!</p>
            <p>For any queries, contact us at info@petco.com or +91 9845651468</p>
            <p><em>This is a computer-generated invoice and does not require a signature.</em></p>
        </div>
    </div>
</body>
</html>`;

  return invoiceHTML;
};

export const downloadInvoice = (order, user, settings = {}) => {
  const invoiceHTML = generateInvoice(order, user, settings);
  
  // Create a more professional filename
  const orderNumber = order.orderNumber || `NN-${new Date().getFullYear()}-${String(order.id || order.orderId).padStart(3, '0')}`;
  const customerName = (order.customerName || user.name || 'Customer').replace(/[^a-z0-9]/gi, '_');
  const filename = `Invoice_${orderNumber}_${customerName}.html`;
  
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const printInvoice = (order, user, settings = {}) => {
  const invoiceHTML = generateInvoice(order, user, settings);
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after printing (optional)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  } else {
    alert('Please allow pop-ups to print the invoice.');
  }
};