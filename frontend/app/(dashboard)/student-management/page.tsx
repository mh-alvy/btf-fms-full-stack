'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { institutionsApi, studentsApi, batchesApi, coursesApi, monthsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Users, Building } from 'lucide-react';

export default function StudentManagement() {
  const queryClient = useQueryClient();
  
  // Institution form state
  const [institutionName, setInstitutionName] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  
  // Student form state
  const [studentData, setStudentData] = useState({
    name: '',
    institutionId: '',
    gender: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    batchId: '',
    enrolledCourses: [] as any[],
  });

  // Queries
  const { data: institutions = [] } = useQuery('institutions', () => institutionsApi.getAll().then(res => res.data));
  const { data: batches = [] } = useQuery('batches', () => batchesApi.getAll().then(res => res.data));
  const { data: courses = [] } = useQuery('courses', () => coursesApi.getAll().then(res => res.data));
  const { data: months = [] } = useQuery('months', () => monthsApi.getAll().then(res => res.data));

  // Mutations
  const createInstitutionMutation = useMutation(institutionsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('institutions');
      setInstitutionName('');
      setInstitutionAddress('');
      toast.success('Institution created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create institution');
    },
  });

  const createStudentMutation = useMutation(studentsApi.create, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('students');
      setStudentData({
        name: '',
        institutionId: '',
        gender: '',
        phone: '',
        guardianName: '',
        guardianPhone: '',
        batchId: '',
        enrolledCourses: [],
      });
      toast.success(`Student added successfully with ID: ${data.data.studentId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add student');
    },
  });

  const deleteInstitutionMutation = useMutation(institutionsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('institutions');
      toast.success('Institution deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete institution');
    },
  });

  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() || !institutionAddress.trim()) return;
    
    createInstitutionMutation.mutate({
      name: institutionName.trim(),
      address: institutionAddress.trim(),
    });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentData.name.trim() || !studentData.institutionId || !studentData.gender || 
        !studentData.phone.trim() || !studentData.guardianName.trim() || 
        !studentData.guardianPhone.trim() || !studentData.batchId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (studentData.enrolledCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    createStudentMutation.mutate(studentData);
  };

  const handleDeleteInstitution = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteInstitutionMutation.mutate(id);
    }
  };

  const updateStudentData = (field: string, value: any) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCourseEnrollment = (courseId: string, startingMonthId: string, endingMonthId?: string) => {
    const existingIndex = studentData.enrolledCourses.findIndex(ec => ec.courseId === courseId);
    
    if (existingIndex >= 0) {
      // Remove enrollment
      setStudentData(prev => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.filter(ec => ec.courseId !== courseId)
      }));
    } else {
      // Add enrollment
      const enrollment: any = { courseId, startingMonthId };
      if (endingMonthId) enrollment.endingMonthId = endingMonthId;
      
      setStudentData(prev => ({
        ...prev,
        enrolledCourses: [...prev.enrolledCourses, enrollment]
      }));
    }
  };

  const getCoursesForBatch = (batchId: string) => {
    return courses.filter((course: any) => {
      // Handle both populated and non-populated batchId
      const courseBatchId = course.batchId?._id || course.batchId;
      return courseBatchId === batchId;
    });
  };

  const getMonthsForCourse = (courseId: string) => {
    return months.filter((month: any) => {
      // Handle both populated and non-populated courseId
      const monthCourseId = month.courseId?._id || month.courseId;
      return monthCourseId === courseId;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Students</h1>
        <p className="text-gray-600 dark:text-gray-400">Create institutions and add students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Institution */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Institution</h3>
          </div>
          
          <form onSubmit={handleCreateInstitution} className="space-y-4">
            <div>
              <label className="form-label">Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="form-input"
                placeholder="Enter institution name"
                required
              />
            </div>
            <div>
              <label className="form-label">Institution Address</label>
              <textarea
                value={institutionAddress}
                onChange={(e) => setInstitutionAddress(e.target.value)}
                className="form-input"
                placeholder="Enter institution address"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={createInstitutionMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createInstitutionMutation.isLoading ? 'Creating...' : 'Create Institution'}
            </button>
          </form>

          {/* Existing Institutions */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Existing Institutions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {institutions.map((institution: any) => (
                <div key={institution._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{institution.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{institution.address}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteInstitution(institution._id, institution.name)}
                      className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Student Form */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Student</h3>
          </div>
          
          <form onSubmit={handleCreateStudent} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white border-b pb-2">Personal Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Student Name</label>
                  <input
                    type="text"
                    value={studentData.name}
                    onChange={(e) => updateStudentData('name', e.target.value)}
                    className="form-input"
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select
                    value={studentData.gender}
                    onChange={(e) => updateStudentData('gender', e.target.value)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Student Phone</label>
                  <input
                    type="tel"
                    value={studentData.phone}
                    onChange={(e) => updateStudentData('phone', e.target.value)}
                    className="form-input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Institution</label>
                  <select
                    value={studentData.institutionId}
                    onChange={(e) => updateStudentData('institutionId', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((institution: any) => (
                      <option key={institution._id} value={institution._id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white border-b pb-2">Guardian Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Guardian Name</label>
                  <input
                    type="text"
                    value={studentData.guardianName}
                    onChange={(e) => updateStudentData('guardianName', e.target.value)}
                    className="form-input"
                    placeholder="Enter guardian name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Guardian Phone</label>
                  <input
                    type="tel"
                    value={studentData.guardianPhone}
                    onChange={(e) => updateStudentData('guardianPhone', e.target.value)}
                    className="form-input"
                    placeholder="Enter guardian phone"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white border-b pb-2">Academic Information</h4>
              
              <div>
                <label className="form-label">Batch</label>
                <select
                  value={studentData.batchId}
                  onChange={(e) => updateStudentData('batchId', e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch: any) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Enrollment */}
              {studentData.batchId && (
                <div>
                  <label className="form-label">Course Enrollment</label>
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    {getCoursesForBatch(studentData.batchId).map((course: any) => {
                      const courseMonths = getMonthsForCourse(course._id);
                      const isEnrolled = studentData.enrolledCourses.some(ec => ec.courseId === course._id);
                      const enrollment = studentData.enrolledCourses.find(ec => ec.courseId === course._id);
                      
                      return (
                        <div key={course._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              id={`course-${course._id}`}
                              checked={isEnrolled}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  toggleCourseEnrollment(course._id, courseMonths[0]?._id);
                                } else {
                                  toggleCourseEnrollment(course._id, '');
                                }
                              }}
                              className="w-4 h-4 text-primary-600"
                            />
                            <label htmlFor={`course-${course._id}`} className="font-medium">
                              {course.name}
                            </label>
                          </div>
                          
                          {isEnrolled && (
                            <div className="ml-6 space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Starting Month</label>
                                <select
                                  value={enrollment?.startingMonthId || ''}
                                  onChange={(e) => {
                                    const newEnrollments = studentData.enrolledCourses.map(ec => 
                                      ec.courseId === course._id 
                                        ? { ...ec, startingMonthId: e.target.value }
                                        : ec
                                    );
                                    updateStudentData('enrolledCourses', newEnrollments);
                                  }}
                                  className="form-input"
                                  required
                                >
                                  <option value="">Select Starting Month</option>
                                  {courseMonths.map((month: any) => (
                                    <option key={month._id} value={month._id}>
                                      {month.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Ending Month (Optional)</label>
                                <select
                                  value={enrollment?.endingMonthId || ''}
                                  onChange={(e) => {
                                    const newEnrollments = studentData.enrolledCourses.map(ec => 
                                      ec.courseId === course._id 
                                        ? { ...ec, endingMonthId: e.target.value || undefined }
                                        : ec
                                    );
                                    updateStudentData('enrolledCourses', newEnrollments);
                                  }}
                                  className="form-input"
                                >
                                  <option value="">No End Date</option>
                                  {courseMonths.map((month: any) => (
                                    <option key={month._id} value={month._id}>
                                      {month.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={createStudentMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createStudentMutation.isLoading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}