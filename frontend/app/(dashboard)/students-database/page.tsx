'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { studentsApi, batchesApi, institutionsApi, coursesApi, monthsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Filter, Download, Eye, CreditCard, Edit, X, Plus, BookOpen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentsDatabase() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: '',
    batch: '',
    institution: '',
    gender: '',
    paymentStatus: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Queries
  const { data: students = [], isLoading } = useQuery('students', () => 
    studentsApi.getAll().then(res => res.data)
  );
  const { data: batches = [] } = useQuery('batches', () => 
    batchesApi.getAll().then(res => res.data)
  );
  const { data: institutions = [] } = useQuery('institutions', () => 
    institutionsApi.getAll().then(res => res.data)
  );

  // Filter students based on current filters
  const filteredStudents = students.filter((student: any) => {
    const matchesSearch = !filters.search || 
      student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.phone.includes(filters.search);

    const matchesBatch = !filters.batch || student.batchId?._id === filters.batch;
    const matchesInstitution = !filters.institution || student.institutionId?._id === filters.institution;
    const matchesGender = !filters.gender || student.gender === filters.gender;

    return matchesSearch && matchesBatch && matchesInstitution && matchesGender;
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      batch: '',
      institution: '',
      gender: '',
      paymentStatus: '',
    });
  };

  const exportData = () => {
    // Implement CSV export functionality
    toast.success('Export functionality will be implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students Database</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all students</p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Students</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="form-input"
              placeholder="Name, ID, or phone..."
            />
          </div>
          
          <div>
            <label className="form-label">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => updateFilter('batch', e.target.value)}
              className="form-input"
            >
              <option value="">All Batches</option>
              {batches.map((batch: any) => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Institution</label>
            <select
              value={filters.institution}
              onChange={(e) => updateFilter('institution', e.target.value)}
              className="form-input"
            >
              <option value="">All Institutions</option>
              {institutions.map((institution: any) => (
                <option key={institution._id} value={institution._id}>{institution.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => updateFilter('gender', e.target.value)}
              className="form-input"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              className="form-input"
            >
              <option value="">All Students</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button onClick={clearFilters} className="btn btn-outline flex-1">
              Clear
            </button>
            <button onClick={exportData} className="btn btn-secondary">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-500">{students.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{filteredStudents.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-500">৳0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">৳0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Dues</div>
        </div>
      </div>

      {/* Students List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Students ({filteredStudents.length})
        </h3>
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-500 dark:text-gray-400">No students found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((student: any) => (
              <div key={student._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                    <p className="text-sm text-primary-500">ID: {student.studentId}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Institution:</span>
                    <span>{student.institutionId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                    <span>{student.batchId?.name || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowDetailModal(true);
                    }}
                    className="btn btn-small btn-outline flex-1"
                    title="View student details"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowEditModal(true);
                    }}
                    className="btn btn-small btn-secondary flex-1"
                    title="Edit student information"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      router.push(`/fee-payment?studentId=${student.studentId}`);
                    }}
                    className="btn btn-small btn-primary flex-1"
                    title="Make payment for this student"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Fee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Student Details Modal */}
      {showDetailModal && selectedStudent && (
        <StudentDetailsModal 
          student={selectedStudent}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
      
      {/* Student Edit Modal */}
      {showEditModal && selectedStudent && (
        <StudentEditModal 
          student={selectedStudent}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
            // Refetch students data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// Student Details Modal Component
function StudentDetailsModal({ student, isOpen, onClose }: any) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                <p className="text-gray-900 dark:text-white">{student.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Student ID</label>
                <p className="text-gray-900 dark:text-white">{student.studentId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                <p className="text-gray-900 dark:text-white">{student.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</label>
                <p className="text-gray-900 dark:text-white">{student.gender}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Academic Information</h4>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Institution</label>
                <p className="text-gray-900 dark:text-white">{student.institutionId?.name || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Batch</label>
                <p className="text-gray-900 dark:text-white">{student.batchId?.name || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Guardian Name</label>
                <p className="text-gray-900 dark:text-white">{student.guardianName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Guardian Phone</label>
                <p className="text-gray-900 dark:text-white">{student.guardianPhone || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Enrolled Courses</h4>
            {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
              <div className="space-y-2">
                {student.enrolledCourses.map((course: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Course:</span> {course.courseId?.name || course.courseId || 'Course ID: ' + course.courseId}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Starting Month:</span> {course.startingMonthId?.name || course.startingMonthId || 'Not specified'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ending Month:</span> {course.endingMonthId?.name || course.endingMonthId || 'Not specified'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No courses enrolled</p>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn btn-outline">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Edit Modal Component
function StudentEditModal({ student, isOpen, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    phone: student?.phone || '',
    gender: student?.gender || '',
    institutionId: student?.institutionId?._id || '',
    batchId: student?.batchId?._id || '',
    guardianName: student?.guardianName || '',
    guardianPhone: student?.guardianPhone || '',
    enrolledCourses: student?.enrolledCourses?.map((course: any) => ({
      courseId: course.courseId?._id || course.courseId || '',
      startingMonthId: course.startingMonthId?._id || course.startingMonthId || '',
      endingMonthId: course.endingMonthId?._id || course.endingMonthId || ''
    })) || []
  });
  const [saving, setSaving] = useState(false);

  const { data: batches = [] } = useQuery('batches', () => 
    batchesApi.getAll().then(res => res.data)
  );
  const { data: institutions = [] } = useQuery('institutions', () => 
    institutionsApi.getAll().then(res => res.data)
  );
  const { data: courses = [] } = useQuery('courses', () => 
    coursesApi.getAll().then(res => res.data)
  );
  const { data: months = [] } = useQuery('months', () => 
    monthsApi.getAll().then(res => res.data)
  );

  // Helper functions for managing enrolled courses
  const addEnrolledCourse = () => {
    setFormData(prev => ({
      ...prev,
      enrolledCourses: [
        ...prev.enrolledCourses,
        {
          courseId: '',
          startingMonthId: '',
          endingMonthId: ''
        }
      ]
    }));
  };

  const removeEnrolledCourse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      enrolledCourses: prev.enrolledCourses.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateEnrolledCourse = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      enrolledCourses: prev.enrolledCourses.map((course: any, i: number) => {
        if (i === index) {
          const updatedCourse = { ...course, [field]: value };
          
          // If course is changed, clear the month selections
          if (field === 'courseId') {
            updatedCourse.startingMonthId = '';
            updatedCourse.endingMonthId = '';
          }
          
          return updatedCourse;
        }
        return course;
      })
    }));
  };

  // Helper function to get months for a specific course
  const getMonthsForCourse = (courseId: string) => {
    if (!courseId) return [];
    return months.filter((month: any) => {
      const monthCourseId = month.courseId?._id || month.courseId;
      return monthCourseId === courseId;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Clean the form data to handle empty endingMonthId values
      const cleanedFormData = {
        ...formData,
        enrolledCourses: formData.enrolledCourses.map((course: any) => ({
          courseId: course.courseId,
          startingMonthId: course.startingMonthId,
          // Only include endingMonthId if it's not empty
          ...(course.endingMonthId && course.endingMonthId.trim() !== '' && { endingMonthId: course.endingMonthId })
        }))
      };
      
      await studentsApi.update(student._id, cleanedFormData);
      toast.success('Student updated successfully');
      onSave();
    } catch (error: any) {
      toast.error('Failed to update student: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Student</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Academic Information</h4>
              <div>
                <label className="form-label">Institution</label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, institutionId: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select Institution</option>
                  {institutions.map((institution: any) => (
                    <option key={institution._id} value={institution._id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Batch</label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch: any) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Guardian Name</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Guardian Phone</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Enrolled Courses</h4>
              <button
                type="button"
                onClick={addEnrolledCourse}
                className="btn btn-small btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>
            
            {formData.enrolledCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No courses enrolled. Click "Add Course" to add a course.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.enrolledCourses.map((enrolledCourse: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">Course #{index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeEnrolledCourse(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Course *</label>
                        <select
                          value={enrolledCourse.courseId?._id || enrolledCourse.courseId || ''}
                          onChange={(e) => updateEnrolledCourse(index, 'courseId', e.target.value)}
                          className="form-input"
                          required
                        >
                          <option value="">Select Course</option>
                          {courses.map((course: any) => (
                            <option key={course._id} value={course._id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label">Starting Month *</label>
                        <select
                          value={enrolledCourse.startingMonthId?._id || enrolledCourse.startingMonthId || ''}
                          onChange={(e) => updateEnrolledCourse(index, 'startingMonthId', e.target.value)}
                          className="form-input"
                          required
                          disabled={!enrolledCourse.courseId}
                        >
                          <option value="">
                            {enrolledCourse.courseId ? 'Select Starting Month' : 'Select Course First'}
                          </option>
                          {getMonthsForCourse(enrolledCourse.courseId?._id || enrolledCourse.courseId).map((month: any) => (
                            <option key={month._id} value={month._id}>
                              {month.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label">Ending Month</label>
                        <select
                          value={enrolledCourse.endingMonthId?._id || enrolledCourse.endingMonthId || ''}
                          onChange={(e) => updateEnrolledCourse(index, 'endingMonthId', e.target.value)}
                          className="form-input"
                          disabled={!enrolledCourse.courseId}
                        >
                          <option value="">
                            {enrolledCourse.courseId ? 'Select Ending Month (Optional)' : 'Select Course First'}
                          </option>
                          {getMonthsForCourse(enrolledCourse.courseId?._id || enrolledCourse.courseId).map((month: any) => (
                            <option key={month._id} value={month._id}>
                              {month.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}