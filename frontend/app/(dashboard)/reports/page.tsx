'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { paymentsApi, coursesApi, monthsApi, batchesApi } from '@/lib/api';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';

export default function Reports() {
  const [reportType, setReportType] = useState('date');
  const [reportDate, setReportDate] = useState('');
  const [reportCourse, setReportCourse] = useState('');
  const [selectedCourseMonth, setSelectedCourseMonth] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [filteredMonths, setFilteredMonths] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Queries
  const { data: payments = [], isLoading, error } = useQuery('payments', () => 
    paymentsApi.getAll().then(res => res.data)
  );
  const { data: courses = [] } = useQuery('courses', () => 
    coursesApi.getAll().then(res => res.data)
  );
  const { data: months = [] } = useQuery('months', () => 
    monthsApi.getAll().then(res => res.data)
  );
  const { data: batches = [] } = useQuery('batches', () => 
    batchesApi.getAll().then(res => res.data)
  );

  // Debug logging
  console.log('Payments data:', payments);
  console.log('Payments loading:', isLoading);
  console.log('Payments error:', error);
  console.log('Courses data:', courses);
  console.log('Batches data:', batches);
  console.log('Selected batch:', selectedBatch);

  // Get batch name by ID
  const getBatchNameById = (batchId: string) => {
    const batch = batches.find((b: any) => b._id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  // Filter courses based on selected batch
  const getFilteredCourses = () => {
    if (!selectedBatch || selectedBatch === 'all') {
      return courses; // Show all courses if no batch is selected or 'all' is selected
    }
    
    // Debug logging for course filtering
    console.log('Filtering courses for batch:', selectedBatch);
    console.log('All courses:', courses);
    
    // Try multiple possible field names for batch relationship
    const filtered = courses.filter((course: any) => {
      const batchMatch = 
        course.batchId === selectedBatch ||
        course.batchId?._id === selectedBatch ||
        course.batch === selectedBatch ||
        course.batch?._id === selectedBatch;
      
      console.log('Course:', course.name, 'BatchId:', course.batchId, 'Batch obj:', course.batch, 'Match:', batchMatch);
      return batchMatch;
    });
    
    console.log('Filtered courses:', filtered);
    return filtered;
  };

  // Reset course selection when batch changes
  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    // Reset course and month selection when batch changes
    setReportCourse('');
    setSelectedCourseMonth('');
  };

  const generateReport = () => {
    console.log('Generating report:', { 
      reportType, 
      reportDate, 
      reportCourse, 
      selectedCourseMonth, 
      selectedBatch 
    });
    
    let filtered: any[] = [];
    let filteredMonthsData: any[] = [];
    
    // Start with all payments
    filtered = [...payments];
    filteredMonthsData = [...months];
    
    // STEP 1: Apply date filtering based on report type
    if (reportType === 'date' && reportDate) {
      const targetDate = new Date(reportDate);
      filtered = filtered.filter((payment: any) => {
        const paymentDate = new Date(payment.createdAt);
        return (
          paymentDate.getFullYear() === targetDate.getFullYear() &&
          paymentDate.getMonth() === targetDate.getMonth() &&
          paymentDate.getDate() === targetDate.getDate()
        );
      });
    } else if (reportType === 'week' && reportDate) {
      const [year, week] = reportDate.split('-W');
      const startOfWeek = getDateOfISOWeek(parseInt(week), parseInt(year));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      filtered = filtered.filter((payment: any) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
      });
    } else if (reportType === 'month' && reportDate) {
      const [year, month] = reportDate.split('-');
      filtered = filtered.filter((payment: any) => {
        const paymentDate = new Date(payment.createdAt);
        return (
          paymentDate.getFullYear() === parseInt(year) &&
          paymentDate.getMonth() === parseInt(month) - 1
        );
      });
    }
    
    // STEP 2: Apply batch filtering (for all report types)
    if (selectedBatch) {
      console.log('Applying batch filter:', selectedBatch);
      console.log('Sample payment months data:', filtered[0]?.months);
      
      filtered = filtered.filter((payment: any) => {
        // Check if student belongs to the selected batch OR any of the payment months belong to a course in that batch
        const studentBatchMatch = payment.studentId?.batchId === selectedBatch;
        const monthsBatchMatch = payment.months?.some((month: any) => {
          const monthData = months.find(m => m._id === month._id || m._id === month);
          const batchMatch = monthData?.courseId?.batchId === selectedBatch;
          console.log('Checking month:', monthData?.name, 'Course:', monthData?.courseId?.name, 'Batch:', monthData?.courseId?.batchId, 'Match:', batchMatch);
          return batchMatch;
        });
        
        const finalMatch = studentBatchMatch || monthsBatchMatch;
        console.log('Payment filter result - Student batch match:', studentBatchMatch, 'Months batch match:', monthsBatchMatch, 'Final:', finalMatch);
        return finalMatch;
      });
      
      filteredMonthsData = filteredMonthsData.filter((month: any) => 
        month.courseId?.batchId === selectedBatch
      );
    }
    
    // STEP 3: Apply course filtering (for all report types)
    if (reportCourse) {
      console.log('Applying course filter:', reportCourse);
      
      filtered = filtered.filter((payment: any) => {
        const courseMatch = payment.months?.some((month: any) => {
          const monthData = months.find(m => m._id === month._id || m._id === month);
          const match = monthData?.courseId?._id === reportCourse || monthData?.courseId === reportCourse;
          console.log('Course filter - Month:', monthData?.name, 'Course ID:', monthData?.courseId?._id, 'Target:', reportCourse, 'Match:', match);
          return match;
        });
        return courseMatch;
      });
      
      filteredMonthsData = filteredMonthsData.filter((month: any) => 
        month.courseId?._id === reportCourse
      );
    }
    
    // STEP 4: Apply specific month filtering and calculate month-specific amounts
    if (selectedCourseMonth) {
      filtered = filtered.filter((payment: any) => {
        return payment.months?.some((month: any) => 
          month._id === selectedCourseMonth || month.monthId === selectedCourseMonth || month === selectedCourseMonth
        );
      });
      
      // Calculate month-specific amounts for each payment
      filtered = filtered.map((payment: any) => {
        let monthSpecificAmount = 0;
        let monthSpecificDiscount = 0;
        
        if (payment.monthPayments && payment.monthPayments.length > 0) {
          // Use new monthPayments structure
          const monthPayment = payment.monthPayments.find((mp: any) => 
            mp.monthId === selectedCourseMonth || 
            mp.monthId?._id === selectedCourseMonth ||
            (typeof mp.monthId === 'object' && mp.monthId?._id === selectedCourseMonth)
          );
          
          if (monthPayment) {
            monthSpecificAmount = monthPayment.paidAmount || 0;
            monthSpecificDiscount = monthPayment.discountAmount || 0;
          }
        } else {
          // Legacy calculation - distribute total amount across months
          const relevantMonths = payment.months?.filter((month: any) => 
            month._id === selectedCourseMonth || month.monthId === selectedCourseMonth || month === selectedCourseMonth
          ) || [];
          
          if (relevantMonths.length > 0) {
            const monthsInPayment = payment.months?.length || 1;
            monthSpecificAmount = (payment.paidAmount || 0) / monthsInPayment;
            monthSpecificDiscount = (payment.discountAmount || 0) / monthsInPayment;
          }
        }
        
        return {
          ...payment,
          filteredAmount: monthSpecificAmount,
          filteredDiscount: monthSpecificDiscount
        };
      });
      
      // Show only the selected month in months data
      filteredMonthsData = filteredMonthsData.filter((month: any) => 
        month._id === selectedCourseMonth
      );
    }
    
    console.log('Filter results:', {
      originalPaymentsCount: payments.length,
      afterDateFilter: filtered.length,
      selectedBatch,
      selectedCourse: reportCourse,
      selectedMonth: selectedCourseMonth,
      finalFilteredCount: filtered.length
    });
    
    setFilteredPayments(filtered);
    setFilteredMonths(filteredMonthsData);
    setShowResults(true);
  };
  
  // Helper function to get the date of ISO week
  const getDateOfISOWeek = (w: number, y: number) => {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };

  const exportReport = () => {
    const dataToExport = showResults ? filteredPayments : payments;
    const monthsToExport = showResults ? filteredMonths : [];
    
    // Prepare CSV data
    let csvContent = "Date,Invoice Number,Student Name,Student ID,Amount,Discount,Received By,Reference\n";
    
    dataToExport.forEach((payment: any) => {
      const amount = payment.filteredAmount !== undefined ? payment.filteredAmount : (payment.paidAmount || 0);
      const discount = payment.filteredDiscount !== undefined ? payment.filteredDiscount : (payment.discountAmount || 0);
      
      csvContent += `"${new Date(payment.createdAt).toLocaleDateString()}",`;
      csvContent += `"${payment.invoiceNumber || ''}",`;
      csvContent += `"${payment.studentId?.name || payment.studentName || ''}",`;
      csvContent += `"${payment.studentId?.studentId || ''}",`;
      csvContent += `"${amount}",`;
      csvContent += `"${discount}",`;
      csvContent += `"${payment.receivedBy || ''}",`;
      csvContent += `"${payment.reference || ''}"\n`;
    });
    
    // Add months data if available
    if (monthsToExport.length > 0) {
      csvContent += "\n\nMonth Data:\n";
      csvContent += "Month Name,Course,Payment Amount,Month Number\n";
      monthsToExport.forEach((month: any) => {
        csvContent += `"${month.name}",`;
        csvContent += `"${month.courseId?.name || ''}",`;
        csvContent += `"${month.payment || 0}",`;
        csvContent += `"${month.monthNumber || ''}"\n`;
      });
    }
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Report exported successfully');
  };

  const handleViewInvoice = (payment: any) => {
    setSelectedPayment(payment);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedPayment(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate and view payment reports</p>
      </div>

      {/* Report Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Reports</h3>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* First Row - Report Type and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  // Reset other filters when changing report type
                  setReportDate('');
                  setReportCourse('');
                  setSelectedCourseMonth('');
                  setSelectedBatch('');
                }}
                className="form-input"
              >
                <option value="date">By Date</option>
                <option value="week">By Week</option>
                <option value="month">By Month</option>
                <option value="course">By Course</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                {reportType === 'month' ? 'Date Range (Optional)' : 'Date'}
              </label>
              <input
                type={reportType === 'week' ? 'week' : reportType === 'month' ? 'month' : 'date'}
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          
          {/* Second Row - Batch and Course (Batch first, Course filtered by batch) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Batch/Class</label>
              <select
                value={selectedBatch}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="form-input"
              >
                <option value="all">All Batch</option>
                {batches.map((batch: any) => (
                  <option key={batch._id} value={batch._id}>{batch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Course</label>
              <select
                value={reportCourse}
                onChange={(e) => {
                  setReportCourse(e.target.value);
                  setSelectedCourseMonth(''); // Reset month selection when course changes
                }}
                className="form-input"
              >
                <option value="">
                  {selectedBatch === 'all' ? 
                    `All Courses (${getFilteredCourses().length} available)` : 
                    `All Courses in Selected Batch (${getFilteredCourses().length} available)`
                  }
                </option>
                {getFilteredCourses().map((course: any) => {
                  // Get the batch name for this course
                  const batchId = course.batchId?._id || course.batchId || course.batch?._id || course.batch;
                  const batchName = getBatchNameById(batchId);
                  
                  return (
                    <option key={course._id} value={course._id}>
                      {course.name} ({batchName})
                    </option>
                  );
                })}
              </select>
              {selectedBatch && selectedBatch !== 'all' && getFilteredCourses().length === 0 && (
                <p className="text-sm text-red-500 mt-1">No courses found for selected batch</p>
              )}
            </div>
          </div>
          
          {/* Third Row - Course Month Selection (only for 'By Month' report type) */}
          {reportType === 'month' && reportCourse && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Select Course Month</label>
                <select
                  value={selectedCourseMonth}
                  onChange={(e) => setSelectedCourseMonth(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Months for Course</option>
                  {months
                    .filter((month: any) => month.courseId._id === reportCourse)
                    .map((month: any) => (
                      <option key={month._id} value={month._id}>
                        {month.name} (Month #{month.monthNumber}) - ৳{month.payment}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <strong>By Month Mode:</strong> Filter by course months or date range
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button onClick={generateReport} className="btn btn-primary">
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </button>
            {showResults && (
              <button 
                onClick={() => {
                  setShowResults(false);
                  setFilteredPayments([]);
                  setFilteredMonths([]);
                  setReportDate('');
                  setReportCourse('');
                  setSelectedCourseMonth('');
                  setSelectedBatch('');
                }}
                className="btn btn-outline px-4"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Results */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Results</h3>
            {showResults && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Filtered by: {reportType} 
                {reportDate && ` | Date: ${reportDate}`}
                {reportCourse && ` | Course: ${courses.find((c: any) => c._id === reportCourse)?.name || reportCourse}`}
                {selectedCourseMonth && ` | Month: ${months.find((m: any) => m._id === selectedCourseMonth)?.name || 'Selected Month'}`}
                {selectedBatch && ` | Batch: ${batches.find((b: any) => b._id === selectedBatch)?.name || selectedBatch}`}
                {` | Showing ${filteredPayments.length} payments`}
              </p>
            )}
          </div>
          <button onClick={exportReport} className="btn btn-outline">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-primary-500">{showResults ? filteredPayments.length : payments.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{showResults ? 'Filtered' : 'Total'} Payments</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              ৳{(showResults ? filteredPayments : payments).reduce((sum: number, p: any) => {
                // Use month-specific amount if available, otherwise use total
                const amount = p.filteredAmount !== undefined ? p.filteredAmount : (p.paidAmount || 0);
                return sum + amount;
              }, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-orange-500">
              ৳{(showResults ? filteredPayments : payments).reduce((sum: number, p: any) => {
                // Use month-specific discount if available, otherwise use total
                const discount = p.filteredDiscount !== undefined ? p.filteredDiscount : (p.discountAmount || 0);
                return sum + discount;
              }, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Discounts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">
              {(() => {
                const dataToUse = showResults ? filteredPayments : payments;
                const avg = dataToUse.length > 0 ? (dataToUse.reduce((sum: number, p: any) => {
                  // Use month-specific amount if available, otherwise use total
                  const amount = p.filteredAmount !== undefined ? p.filteredAmount : (p.paidAmount || 0);
                  return sum + amount;
                }, 0) / dataToUse.length) : 0;
                return `৳${avg.toFixed(0)}`;
              })()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Payment</div>
          </div>
        </div>

        {/* Month Details Section for Month/Course Reports */}
        {showResults && filteredMonths.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              {reportType === 'month' ? 'Months for Selected Course' : 'Course Months'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMonths.map((month: any) => (
                <div key={month._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {month.name} - {month.courseId?.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Month #{month.monthNumber} | Fee: ৳{month.payment?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Created: {new Date(month.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm font-bold text-yellow-800">
            {showResults 
              ? `REPORT: Showing ${filteredPayments.length} payments | Click invoice numbers to view details` 
              : `DEBUG: Payments count: ${payments.length} | Click "Generate Report" to filter | Clickable invoice numbers to view invoices`
            }
          </p>
        </div>
        <div className="overflow-x-auto">"
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{minWidth: '800px'}}>
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Received By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading payments...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-500">
                    Error loading payments: {(error as Error)?.message}
                  </td>
                </tr>
              ) : (showResults ? filteredPayments : payments).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {showResults ? 'No payments found for selected criteria' : 'No payments found'}
                  </td>
                </tr>
              ) : (
                (showResults ? filteredPayments : payments).slice(0, 20).map((payment: any) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewInvoice(payment)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
                        title="Click to view invoice"
                      >
                        📄 {payment.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.studentId?.name || payment.studentName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ৳{(() => {
                        // Use month-specific amount if available, otherwise use total
                        const amount = payment.filteredAmount !== undefined ? payment.filteredAmount : (payment.paidAmount || 0);
                        return amount.toLocaleString();
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.receivedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoice}
        onClose={handleCloseInvoice}
        invoiceData={selectedPayment}
        paidMonths={selectedPayment?.months || []}
      />
    </div>
  );
}