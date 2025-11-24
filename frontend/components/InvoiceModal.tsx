import React from 'react';
import { X, Printer, Download } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
  paidMonths?: any[];
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  invoiceData, 
  paidMonths = [] 
}) => {
  if (!isOpen || !invoiceData) return null;

  // Normalize invoice data structure for consistent display
  const normalizedData = {
    invoiceNumber: invoiceData.invoiceNumber || 'N/A',
    createdAt: invoiceData.createdAt || invoiceData.timestamp || new Date().toISOString(),
    studentId: invoiceData.studentId || invoiceData.studentInfo,
    studentName: invoiceData.studentName || invoiceData.studentInfo?.name,
    paidAmount: invoiceData.paidAmount,
    discountAmount: invoiceData.discountAmount || invoiceData.totalCalculation?.discountAmount || 0,
    totalAmount: invoiceData.totalCalculation?.totalAmount || invoiceData.paidAmount,
    months: invoiceData.months || paidMonths || [],
    reference: invoiceData.reference || invoiceData.paymentDetails?.reference,
    receivedBy: invoiceData.receivedBy || invoiceData.paymentDetails?.receivedBy || 'N/A'
  };

  const handlePrint = () => {
    const invoiceElement = document.getElementById('pos-invoice');
    if (invoiceElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Payment Invoice - ${normalizedData.invoiceNumber}</title>
              <style>
                @media print {
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: 'Courier New', monospace; 
                    background: white;
                    color: #000000 !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                  .no-print { display: none !important; }
                  .pos-invoice { 
                    width: 80mm; 
                    margin: 0 auto; 
                    background: white;
                    border: none;
                    color: #000000 !important;
                  }
                  * {
                    color: #000000 !important;
                    text-shadow: none !important;
                  }
                }
                @page {
                  size: 80mm auto;
                  margin: 10mm;
                }
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 14px; 
                  font-weight: 600;
                  line-height: 1.4; 
                  margin: 0; 
                  padding: 15px;
                  background: white;
                  color: #000000 !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                .pos-invoice { 
                  width: 80mm; 
                  margin: 0 auto; 
                  padding: 15px;
                  background: white;
                  color: #000000 !important;
                  font-weight: 600;
                }
                /* Enhanced text visibility for thermal printing */
                * {
                  color: #000000 !important;
                  font-weight: inherit;
                }
                /* Header styling */
                .text-center { text-align: center; }
                .font-bold { 
                  font-weight: 900 !important; 
                  color: #000000 !important;
                  text-shadow: 0.5px 0 0 #000000, 0 0.5px 0 #000000;
                }
                .text-lg { 
                  font-size: 20px; 
                  font-weight: 900 !important;
                  color: #000000 !important;
                }
                .text-sm { 
                  font-size: 15px;
                  font-weight: 700 !important;
                  color: #000000 !important;
                }
                .font-semibold { 
                  font-weight: 800 !important; 
                  color: #000000 !important;
                }
                
                /* Border styling - Thicker and darker for thermal printers */
                .border-b-2 { border-bottom: 3px solid #000000 !important; }
                .border-t-2 { border-top: 3px solid #000000 !important; }
                .border-b { border-bottom: 2px solid #000000 !important; }
                .border-t { border-top: 2px solid #000000 !important; }
                .border-dashed { border-style: solid !important; }
                .border-solid { border-style: solid !important; }
                .border-gray-400 { border-color: #000000 !important; }
                
                /* Spacing */
                .pb-3 { padding-bottom: 12px; }
                .pt-3 { padding-top: 12px; }
                .mb-3 { margin-bottom: 12px; }
                .mt-2 { margin-top: 8px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-1 { margin-bottom: 4px; }
                .pt-1 { padding-top: 4px; }
                .mt-1 { margin-top: 4px; }
                .pr-2 { padding-right: 8px; }
                
                /* Layout */
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .flex-1 { flex: 1; }
                
                /* Enhanced colors for thermal printing */
                .text-green-600 { 
                  color: #000000 !important; 
                  font-weight: 800 !important;
                }
                
                /* Dark text for all elements */
                span, div, p, h1, h2, h3, h4, h5, h6 {
                  color: #000000 !important;
                  font-weight: 600 !important;
                }
                
                /* Extra bold for important text */
                .invoice-header {
                  font-weight: 900 !important;
                  font-size: 18px !important;
                  color: #000000 !important;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                
                .invoice-amount {
                  font-weight: 900 !important;
                  color: #000000 !important;
                  font-size: 15px !important;
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${invoiceElement.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const formatPaymentDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Invoice</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Invoice Content - POS Receipt Style */}
        <div id="pos-invoice" className="p-6 bg-white text-black font-mono leading-relaxed print:p-4" style={{width: '80mm', fontSize: '14px', fontWeight: '700', margin: '0 auto', backgroundColor: 'white', color: '#000000'}}>
          {/* Header */}
          <div className="text-center border-b-2 border-solid border-gray-400 pb-3 mb-3 invoice-header" style={{textAlign: 'center', borderBottom: '3px solid #000000', paddingBottom: '12px', marginBottom: '12px', fontWeight: '900', fontSize: '18px', color: '#000000'}}>
            <div className="font-bold text-lg" style={{fontWeight: '900', fontSize: '20px', color: '#000000', letterSpacing: '1px'}}>BREAK THE FEAR</div>
            <div className="text-sm" style={{fontSize: '16px', fontWeight: '800', color: '#000000'}}>Fee Management System</div>
            <div className="text-sm font-semibold" style={{fontSize: '16px', fontWeight: '800', color: '#000000'}}>Payment Receipt</div>
          </div>
          
          {/* Invoice Details */}
          <div className="mb-3 text-sm" style={{marginBottom: '12px', fontSize: '14px', fontWeight: '700', color: '#000000'}}>
            <div className="flex justify-between" style={{display: 'flex', justifyContent: 'space-between', color: '#000000'}}>
              <span style={{fontWeight: '700', color: '#000000'}}>Invoice:</span>
              <span className="font-semibold invoice-amount" style={{fontWeight: '900', color: '#000000', fontSize: '15px'}}>{normalizedData.invoiceNumber}</span>
            </div>
            <div className="flex justify-between" style={{display: 'flex', justifyContent: 'space-between', color: '#000000'}}>
              <span style={{fontWeight: '700', color: '#000000'}}>Date:</span>
              <span style={{fontWeight: '700', color: '#000000'}}>{formatPaymentDate(normalizedData.createdAt)}</span>
            </div>
          </div>
          
          <div className="border-b border-solid border-gray-400 pb-3 mb-3" style={{borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '12px'}}>
            <div className="text-sm" style={{fontSize: '14px', fontWeight: '700', color: '#000000'}}>
              <div className="font-bold mb-1" style={{fontWeight: '900', marginBottom: '4px', color: '#000000'}}>Student Info:</div>
              <div style={{fontWeight: '700', color: '#000000'}}>ID: {normalizedData.studentId?.studentId || 'N/A'}</div>
              <div style={{fontWeight: '700', color: '#000000'}}>Name: {normalizedData.studentId?.name || normalizedData.studentName || 'N/A'}</div>
              <div style={{fontWeight: '700', color: '#000000'}}>Phone: {normalizedData.studentId?.phone || 'N/A'}</div>
              <div style={{fontWeight: '700', color: '#000000'}}>Guardian: {normalizedData.studentId?.guardianName || 'N/A'}</div>
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="mb-3" style={{marginBottom: '12px'}}>
            <div className="text-sm font-bold mb-2" style={{fontSize: '15px', fontWeight: '900', marginBottom: '8px', color: '#000000'}}>PAYMENT DETAILS</div>
            {normalizedData.months && normalizedData.months.length > 0 ? (
              normalizedData.months.map((month: any, index: number) => {
                // Extract course name from various possible sources
                const courseName = month.courseName || 
                                 month.courseId?.name || 
                                 month.course?.name || 
                                 (month.courseId && typeof month.courseId === 'string' ? 'Course' : '') ||
                                 '';
                
                const monthName = month.name || `Month ${index + 1}`;
                const displayText = courseName ? `${monthName} - ${courseName}` : monthName;
                
                return (
                  <div key={month._id || index} className="flex justify-between text-sm mb-1" style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px', fontWeight: '700', color: '#000000'}}>
                    <span className="flex-1 pr-2" style={{flex: '1', paddingRight: '8px', fontWeight: '700', color: '#000000'}}>{displayText}</span>
                    <span className="font-semibold invoice-amount" style={{fontWeight: '900', color: '#000000', fontSize: '15px'}}>৳{month.payment || (normalizedData.paidAmount / normalizedData.months.length).toFixed(0)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between text-sm" style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#000000'}}>
                <span className="flex-1 pr-2" style={{flex: '1', paddingRight: '8px', fontWeight: '700', color: '#000000'}}>Payment for selected months</span>
                <span className="font-semibold invoice-amount" style={{fontWeight: '900', color: '#000000', fontSize: '15px'}}>৳{normalizedData.paidAmount}</span>
              </div>
            )}
            <div className="border-t border-solid border-gray-400 mt-2 pt-2" style={{borderTop: '2px solid #000000', marginTop: '8px', paddingTop: '8px'}}>
              <div className="flex justify-between text-sm" style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#000000'}}>
                <span style={{fontWeight: '700', color: '#000000'}}>Total Amount:</span>
                <span style={{fontWeight: '700', color: '#000000'}}>৳{normalizedData.totalAmount}</span>
              </div>
              {normalizedData.discountAmount && parseFloat(normalizedData.discountAmount.toString()) > 0 && (
                <div className="flex justify-between text-sm" style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#000000'}}>
                  <span style={{fontWeight: '700', color: '#000000'}}>Discount:</span>
                  <span className="text-green-600" style={{color: '#000000', fontWeight: '900'}}>-৳{normalizedData.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-solid border-gray-400 pt-1 mt-1" style={{display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', borderTop: '2px solid #000000', paddingTop: '4px', marginTop: '4px', color: '#000000'}}>
                <span style={{fontWeight: '900', color: '#000000'}}>Paid Amount:</span>
                <span className="invoice-amount" style={{fontWeight: '900', color: '#000000', fontSize: '16px'}}>৳{normalizedData.paidAmount}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="border-t border-solid border-gray-400 pt-3 mb-3 text-sm" style={{borderTop: '2px solid #000000', paddingTop: '12px', marginBottom: '12px', fontSize: '14px', fontWeight: '700', color: '#000000'}}>
            {normalizedData.reference && (
              <div style={{fontWeight: '700', color: '#000000'}}>Reference: {normalizedData.reference}</div>
            )}
            <div style={{fontWeight: '700', color: '#000000'}}>Received By: {normalizedData.receivedBy}</div>
            <div style={{fontWeight: '700', color: '#000000'}}>Method: Cash/Online</div>
          </div>
          
          {/* Footer */}
          <div className="text-center border-t-2 border-solid border-gray-400 pt-3 text-sm" style={{textAlign: 'center', borderTop: '3px solid #000000', paddingTop: '12px', fontSize: '15px', fontWeight: '900', color: '#000000'}}>
            <div className="font-semibold" style={{fontWeight: '900', color: '#000000'}}>Thank you!</div>
            <div style={{fontWeight: '800', color: '#000000'}}>Keep this receipt safe</div>
            <div className="mt-2 text-xs" style={{marginTop: '8px', fontSize: '12px', fontWeight: '700', color: '#000000'}}>System Generated Receipt</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Printer className="w-5 h-5" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;