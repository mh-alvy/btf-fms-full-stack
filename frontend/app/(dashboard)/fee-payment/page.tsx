'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentsApi, paymentsApi, referenceOptionsApi, monthsApi, coursesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Search, CreditCard, User, Phone, Building } from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';

export default function FeePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState(''); // Add course filter
  const [paymentData, setPaymentData] = useState({
    selectedMonths: [] as string[],
    discountedMonths: [] as string[], // New: months that should receive discount
    paidAmount: '',
    discountAmount: '',
    discountType: 'fixed',
    reference: '',
    customReference: '',
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [paidMonths, setPaidMonths] = useState<string[]>([]);

  // Calculate totals
  const calculateTotals = () => {
    if (!selectedStudent?.enrolledCourses) return { totalAmount: '0.00', discountAmount: '0.00', dueAmount: '0.00' };
    
    const availableMonths: any[] = [];
    
    selectedStudent.enrolledCourses.forEach((enrollment: any) => {
      const course = enrollment.courseId;
      if (!course) return;
      
      // Find months for this course - handle both populated and non-populated courseId
      const courseMonths = months.filter((month: any) => {
        const monthCourseId = month.courseId?._id || month.courseId;
        const enrollmentCourseId = course._id || course;
        return monthCourseId === enrollmentCourseId;
      });
      
      // Filter months based on enrollment period
      const filteredMonths = courseMonths.filter((month: any) => {
        // Get starting month info
        const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
        const startingMonth = months.find(m => (m._id || m) === startingMonthId);
        const startingMonthNumber = startingMonth?.monthNumber || 0;
        
        // Get ending month info
        const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
        let endingMonthNumber = null;
        
        if (endingMonthId) {
          const endingMonth = months.find(m => (m._id || m) === endingMonthId);
          endingMonthNumber = endingMonth?.monthNumber || null;
        }
        
        // Check if month is within enrollment period
        const currentMonthNumber = month.monthNumber || 0;
        
        // Must be >= starting month
        if (currentMonthNumber < startingMonthNumber) {
          return false;
        }
        
        // If ending month is set, must be <= ending month
        if (endingMonthNumber !== null && currentMonthNumber > endingMonthNumber) {
          return false;
        }
        
        return true;
      });
      
      // Add course info to each month for better display
      const monthsWithCourse = filteredMonths.map((month: any) => ({
        ...month,
        courseName: course.name || 'Unknown Course',
        batchName: course.batchId?.name || 'Unknown Batch'
      }));
      
      availableMonths.push(...monthsWithCourse);
    });
    
    // Remove duplicates if any
    const uniqueMonths = availableMonths.filter((month, index, self) => 
      index === self.findIndex((m) => m._id === month._id)
    );
    
    // Only calculate for unpaid selected months
    const selectedMonthsData = uniqueMonths.filter(month => 
      paymentData.selectedMonths.includes(month._id) && !paidMonths.includes(month._id)
    );
    
    // Calculate total without discount first
    const totalAmount = selectedMonthsData.reduce((sum, month) => 
      sum + (parseFloat(month.payment) || 0), 0
    );
    
    // Calculate discount amount based on discounted months
    let discountAmount = 0;
    const discountValue = parseFloat(paymentData.discountAmount) || 0;
    
    if (discountValue > 0 && paymentData.discountedMonths.length > 0) {
      if (paymentData.discountType === 'percentage') {
        // Calculate discount only for selected discounted months
        const discountedMonthsData = selectedMonthsData.filter(month => 
          paymentData.discountedMonths.includes(month._id)
        );
        const discountableAmount = discountedMonthsData.reduce((sum, month) => 
          sum + (parseFloat(month.payment) || 0), 0
        );
        discountAmount = (discountableAmount * discountValue) / 100;
      } else {
        // Fixed amount discount applied to selected discounted months
        discountAmount = Math.min(discountValue, totalAmount);
      }
    } else if (discountValue > 0 && paymentData.discountedMonths.length === 0) {
      // If no specific months selected for discount, apply to all (backward compatibility)
      if (paymentData.discountType === 'percentage') {
        discountAmount = (totalAmount * discountValue) / 100;
      } else {
        discountAmount = Math.min(discountValue, totalAmount);
      }
    }
    
    const dueAmount = totalAmount - discountAmount;
    
    return {
      totalAmount: totalAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      dueAmount: Math.max(0, dueAmount).toFixed(2)
    };
  };

  // Auto-search if studentId is provided in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');
    if (studentId) {
      setSearchTerm(studentId);
      // Auto-trigger search
      handleSearchForStudentId(studentId);
    }
  }, []);

  // Auto-update paid amount when months selection or discount changes
  useEffect(() => {
    if (paymentData.selectedMonths.length > 0) {
      const totals = calculateTotals();
      setPaymentData(prev => ({
        ...prev,
        paidAmount: totals.dueAmount
      }));
    }
  }, [paymentData.selectedMonths, paymentData.discountAmount, paymentData.discountedMonths]);

  // Clear selected months when course changes
  useEffect(() => {
    setPaymentData(prev => ({
      ...prev,
      selectedMonths: [],
      discountedMonths: []
    }));
  }, [selectedCourse]);

  // Reset course filter when student changes
  useEffect(() => {
    setSelectedCourse('');
    setPaymentData(prev => ({
      ...prev,
      selectedMonths: [],
      discountedMonths: []
    }));
  }, [selectedStudent]);

  // Handle search specifically for student ID from URL
  const handleSearchForStudentId = async (studentId: string) => {
    try {
      const response = await studentsApi.searchByStudentId(studentId);
      if (response.data && response.data.length > 0) {
        setSelectedStudent(response.data[0]);
        toast.success('Student found');
      } else {
        toast.error('Student not found');
      }
    } catch (error) {
      toast.error('Error finding student');
    }
  };

  // Queries
  const { data: referenceOptions = [] } = useQuery('reference-options', () => 
    referenceOptionsApi.getAll().then(res => res.data)
  );
  const { data: months = [] } = useQuery('months', () => 
    monthsApi.getAll().then(res => res.data)
  );
  const { data: courses = [] } = useQuery('courses', () => 
    coursesApi.getAll().then(res => res.data)
  );

  // Fetch paid months when student is selected
  const { data: paidMonthsData } = useQuery(
    ['paid-months', selectedStudent?._id], 
    () => paymentsApi.getPaidMonths(selectedStudent._id).then(res => res.data),
    {
      enabled: !!selectedStudent?._id,
      onSuccess: (data) => {
        if (data && data.paidMonthIds) {
          setPaidMonths(data.paidMonthIds);
        }
      }
    }
  );

  // Mutations
  const createPaymentMutation = useMutation(paymentsApi.create, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['payments', 'students']);
      queryClient.invalidateQueries(['paid-months', selectedStudent?._id]);
      toast.success('Payment processed successfully');
      
      // Prepare detailed months data for invoice
      const selectedMonthsDetails = getAvailableMonths()
        .filter(month => paymentData.selectedMonths.includes(month._id))
        .map(month => ({
          _id: month._id,
          name: month.name,
          payment: month.payment,
          courseName: month.courseName,
          monthNumber: month.monthNumber
        }));

      // Prepare invoice data
      const invoice = {
        ...data,
        studentInfo: selectedStudent,
        studentId: selectedStudent,
        studentName: selectedStudent?.name,
        months: selectedMonthsDetails,
        paymentDetails: paymentData,
        totalCalculation: calculateTotals(),
        timestamp: new Date().toISOString(),
        reference: paymentData.reference === 'custom' ? paymentData.customReference : paymentData.reference,
        receivedBy: user?.name || user?.username || 'Unknown User'
      };
      
      setInvoiceData(invoice);
      setShowInvoice(true);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      // Try to find by student ID first
      let response;
      try {
        response = await studentsApi.searchByStudentId(searchTerm);
        if (response.data && response.data.length > 0) {
          const student = response.data[0];
          setSelectedStudent(student);
          toast.success('Student found');
          return;
        }
      } catch {
        // If not found by ID, search by name
        try {
          response = await studentsApi.searchByName(searchTerm);
          if (response.data && response.data.length > 0) {
            const student = response.data[0];
            setSelectedStudent(student);
            toast.success('Student found');
            return;
          }
        } catch {
          // Last resort - get all students and filter
          const allStudents = await studentsApi.getAll();
          const student = allStudents.data.find((s: any) => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentId === searchTerm
          );
          
          if (student) {
            setSelectedStudent(student);
            toast.success('Student found');
            return;
          }
        }
      }

      toast.error('Student not found');
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Error searching for student');
      setSelectedStudent(null);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    if (paymentData.selectedMonths.filter(monthId => !paidMonths.includes(monthId)).length === 0) {
      toast.error('Please select at least one unpaid month');
      return;
    }

    if (!paymentData.paidAmount || parseFloat(paymentData.paidAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    // Prepare payment data with proper month-specific calculations
    const unpaidSelectedMonths = paymentData.selectedMonths.filter(monthId => !paidMonths.includes(monthId));
    
    if (unpaidSelectedMonths.length === 0) {
      toast.error('Please select at least one unpaid month');
      return;
    }
    
    // Get month details for calculations
    const selectedMonthsData = getAvailableMonths()
      .filter(month => unpaidSelectedMonths.includes(month._id));
    
    const discountValue = parseFloat(paymentData.discountAmount) || 0;
    const discountedMonthIds = paymentData.discountedMonths.length > 0 ? paymentData.discountedMonths : unpaidSelectedMonths;
    
    // Calculate month-specific payments and discounts
    const monthPayments = selectedMonthsData.map(month => {
      const monthFee = parseFloat(month.payment) || 0;
      let monthDiscount = 0;
      
      // Calculate discount for this specific month
      if (discountValue > 0 && discountedMonthIds.includes(month._id)) {
        if (paymentData.discountType === 'percentage') {
          monthDiscount = (monthFee * discountValue) / 100;
        } else {
          // For fixed amount, distribute proportionally among discounted months
          const discountedMonthsData = selectedMonthsData.filter(m => discountedMonthIds.includes(m._id));
          const totalDiscountableAmount = discountedMonthsData.reduce((sum, m) => sum + (parseFloat(m.payment) || 0), 0);
          if (totalDiscountableAmount > 0) {
            monthDiscount = (monthFee / totalDiscountableAmount) * discountValue;
          }
        }
      }
      
      return {
        monthId: month._id,
        monthFee: monthFee,
        paidAmount: monthFee - monthDiscount,
        discountAmount: monthDiscount
      };
    });
    
    // Calculate total amounts
    const totalMonthFees = monthPayments.reduce((sum, mp) => sum + mp.monthFee, 0);
    const totalDiscounts = monthPayments.reduce((sum, mp) => sum + mp.discountAmount, 0);
    const totalPaid = monthPayments.reduce((sum, mp) => sum + mp.paidAmount, 0);
    
    const payment = {
      studentId: selectedStudent._id,
      studentName: selectedStudent.name,
      paidAmount: totalPaid,
      discountAmount: totalDiscounts,
      discountType: paymentData.discountType,
      discountApplicableMonths: discountedMonthIds,
      months: unpaidSelectedMonths,
      monthPayments: monthPayments,
        reference: paymentData.reference === 'custom' ? paymentData.customReference : paymentData.reference,
        receivedBy: user?.name || user?.username || 'System',
    };

    createPaymentMutation.mutate(payment);
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedStudent(null);
    setPaidMonths([]);
    setPaymentData({
      selectedMonths: [],
      discountedMonths: [],
      paidAmount: '',
      discountAmount: '',
      discountType: 'fixed',
      reference: '',
      customReference: '',
    });
  };

  // Get available courses for the selected student
  const getStudentCourses = () => {
    if (!selectedStudent?.enrolledCourses) return [];
    
    const studentCourses = selectedStudent.enrolledCourses
      .map((enrollment: any) => enrollment.courseId)
      .filter((course: any) => course && course._id)
      .map((course: any) => ({
        _id: course._id,
        name: course.name || 'Unknown Course',
        batchName: course.batchId?.name || 'Unknown Batch'
      }));
    
    // Remove duplicates
    return studentCourses.filter((course: any, index: number, self: any[]) => 
      index === self.findIndex((c) => c._id === course._id)
    );
  };

  const getAvailableMonths = () => {
    if (!selectedStudent?.enrolledCourses) return [];
    
    const availableMonths: any[] = [];
    
    selectedStudent.enrolledCourses.forEach((enrollment: any) => {
      const course = enrollment.courseId;
      if (!course) return;
      
      // If a course is selected, only show months for that course
      if (selectedCourse && (course._id || course) !== selectedCourse) {
        return;
      }
      
      // Find months for this course - handle both populated and non-populated courseId
      const courseMonths = months.filter((month: any) => {
        const monthCourseId = month.courseId?._id || month.courseId;
        const enrollmentCourseId = course._id || course;
        return monthCourseId === enrollmentCourseId;
      });
      
      // Filter months based on enrollment period
      const filteredMonths = courseMonths.filter((month: any) => {
        // Get starting month info
        const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
        const startingMonth = months.find(m => (m._id || m) === startingMonthId);
        const startingMonthNumber = startingMonth?.monthNumber || 0;
        
        // Get ending month info
        const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
        let endingMonthNumber = null;
        
        if (endingMonthId) {
          const endingMonth = months.find(m => (m._id || m) === endingMonthId);
          endingMonthNumber = endingMonth?.monthNumber || null;
        }
        
        // Check if month is within enrollment period
        const currentMonthNumber = month.monthNumber || 0;
        
        // Must be >= starting month
        if (currentMonthNumber < startingMonthNumber) {
          return false;
        }
        
        // If ending month is set, must be <= ending month
        if (endingMonthNumber !== null && currentMonthNumber > endingMonthNumber) {
          return false;
        }
        
        return true;
      });
      
      // Add course info to each month for better display
      const monthsWithCourse = filteredMonths.map((month: any) => ({
        ...month,
        courseName: course.name || 'Unknown Course',
        batchName: course.batchId?.name || 'Unknown Batch'
      }));
      
      availableMonths.push(...monthsWithCourse);
    });
    
    // Remove duplicates if any
    return availableMonths.filter((month, index, self) => 
      index === self.findIndex((m) => m._id === month._id)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pay Fee</h1>
        <p className="text-gray-600 dark:text-gray-400">Process student fee payments</p>
      </div>

      {/* Student Search */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find Student</h3>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input flex-1"
            placeholder="Enter Student ID or Student Name"
            required
          />
          <button type="submit" className="btn btn-primary">
            <Search className="w-4 h-4" />
            Find Student
          </button>
        </form>
      </div>

      {/* Student Information & Payment Form */}
      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Information */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Information</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Student ID:</span>
                <span className="font-medium">{selectedStudent.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="font-medium">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Guardian:</span>
                <span className="font-medium">{selectedStudent.guardianName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Institution:</span>
                <span className="font-medium">{selectedStudent.institutionId?.name || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                <span className="font-medium">{selectedStudent.batchId?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Payment</h3>
            </div>
            
            <form onSubmit={handleProcessPayment} className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="form-label">Filter by Course/Subject</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Courses</option>
                  {getStudentCourses().map((course: any) => (
                    <option key={course._id} value={course._id}>
                      {course.name} {course.batchName && `- ${course.batchName}`}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select a course to view only its months, or leave as "All Courses" to see all available months
                </p>
              </div>

              {/* Month Selection */}
              <div>
                <label className="form-label">Select Months</label>
                {getAvailableMonths().length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {getAvailableMonths().map((month: any) => {
                      const isPaid = paidMonths.includes(month._id);
                      const isSelected = paymentData.selectedMonths.includes(month._id);
                      
                      return (
                        <label key={month._id} className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                          isPaid 
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                            : isSelected 
                              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isPaid || isSelected}
                            disabled={isPaid}
                            onChange={(e) => {
                              if (isPaid) return; // Prevent unchecking paid months
                              
                              if (e.target.checked) {
                                setPaymentData(prev => ({
                                  ...prev,
                                  selectedMonths: [...prev.selectedMonths, month._id]
                                }));
                              } else {
                                setPaymentData(prev => ({
                                  ...prev,
                                  selectedMonths: prev.selectedMonths.filter(id => id !== month._id)
                                }));
                              }
                            }}
                            className={`rounded border-gray-300 focus:ring-primary-500 ${
                              isPaid 
                                ? 'text-green-600 bg-green-100 border-green-300' 
                                : 'text-primary-600'
                            }`}
                          />
                          <div className="flex-1">
                            <div className={`text-sm font-medium flex items-center gap-2 ${
                              isPaid ? 'text-green-700 dark:text-green-300' : ''
                            }`}>
                              {month.name}
                              {isPaid && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                  ✓ Paid
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-primary-600 dark:text-primary-400">{month.courseName || 'Unknown Course'}</div>
                            <div className={`text-xs ${
                              isPaid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>৳{month.payment}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    No months available. Please ensure the student is enrolled in courses with defined months.
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              {paymentData.selectedMonths.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="font-medium">৳{calculateTotals().totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                      <span className="font-medium">৳{calculateTotals().discountAmount}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex justify-between text-base font-semibold">
                        <span className="text-gray-900 dark:text-white">Due Amount:</span>
                        <span className="text-primary-600 dark:text-primary-400">৳{calculateTotals().dueAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Paid Amount (৳)</label>
                  <input
                    type="number"
                    value={paymentData.paidAmount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paidAmount: e.target.value }))}
                    className="form-input"
                    placeholder="Enter amount paid"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Discount Amount</label>
                  <input
                    type="number"
                    value={paymentData.discountAmount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, discountAmount: e.target.value }))}
                    className="form-input"
                    placeholder="Enter discount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Discount Configuration */}
              {parseFloat(paymentData.discountAmount) > 0 && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Discount Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Discount Type</label>
                      <select
                        value={paymentData.discountType}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, discountType: e.target.value }))}
                        className="form-input"
                      >
                        <option value="fixed">Fixed Amount (৳)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Apply Discount To</label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Select specific months for discount or leave empty to apply to all selected months
                      </p>
                    </div>
                  </div>

                  {/* Month-specific Discount Selection */}
                  {paymentData.selectedMonths.length > 0 && (
                    <div>
                      <label className="form-label">Select Months for Discount (Optional)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {getAvailableMonths()
                          .filter(month => paymentData.selectedMonths.includes(month._id))
                          .map((month: any) => (
                          <label key={`discount-${month._id}`} className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input
                              type="checkbox"
                              checked={paymentData.discountedMonths.includes(month._id)}
                              onChange={(e) => {
                                setPaymentData(prev => ({
                                  ...prev,
                                  discountedMonths: e.target.checked
                                    ? [...prev.discountedMonths, month._id]
                                    : prev.discountedMonths.filter(id => id !== month._id)
                                }));
                              }}
                              className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {month.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ৳{month.payment} - {month.courseName}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {paymentData.discountedMonths.length === 0 
                          ? "No months selected - discount will apply to all selected months"
                          : `Discount will apply to ${paymentData.discountedMonths.length} selected month(s)`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Reference</label>
                  <select
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select Reference</option>
                    {referenceOptions.map((option: any) => (
                      <option key={option._id} value={option.name}>{option.name}</option>
                    ))}
                    <option value="custom">Custom Reference</option>
                  </select>
                  {paymentData.reference === 'custom' && (
                    <input
                      type="text"
                      value={paymentData.customReference}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customReference: e.target.value }))}
                      className="form-input mt-2"
                      placeholder="Enter custom reference"
                    />
                  )}
                </div>
              </div>

              {/* Auto-filled Received By Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Received By:</strong> {user?.name || user?.username || 'System'}
                </div>
              </div>

              <button
                type="submit"
                disabled={createPaymentMutation.isLoading}
                className="w-full btn btn-primary"
              >
                <CreditCard className="w-4 h-4" />
                {createPaymentMutation.isLoading ? 'Processing...' : 'Process Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Thermal Printer Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        invoiceData={invoiceData}
        paidMonths={getAvailableMonths().filter(month => 
          invoiceData?.paymentDetails?.selectedMonths?.includes(month._id)
        )}
      />
    </div>
  );
}