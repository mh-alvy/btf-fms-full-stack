'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { batchesApi, coursesApi, monthsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function BatchManagement() {
  const queryClient = useQueryClient();
  const [batchName, setBatchName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [monthName, setMonthName] = useState('');
  const [monthNumber, setMonthNumber] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [coursePayment, setCoursePayment] = useState('');

  // Queries
  const { data: batches = [] } = useQuery('batches', () => batchesApi.getAll().then(res => res.data));
  const { data: courses = [] } = useQuery('courses', () => coursesApi.getAll().then(res => res.data));
  const { data: months = [] } = useQuery('months', () => monthsApi.getAll().then(res => res.data));

  // Mutations
  const createBatchMutation = useMutation(batchesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('batches');
      setBatchName('');
      toast.success('Batch created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create batch');
    },
  });

  const createCourseMutation = useMutation(coursesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('courses');
      setCourseName('');
      setSelectedBatch('');
      toast.success('Course created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    },
  });

  const createMonthMutation = useMutation(monthsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('months');
      setMonthName('');
      setMonthNumber('');
      setSelectedCourse('');
      setCoursePayment('');
      toast.success('Month created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create month');
    },
  });

  const deleteBatchMutation = useMutation(batchesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['batches', 'courses', 'months']);
      toast.success('Batch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete batch');
    },
  });

  const deleteCourseMutation = useMutation(coursesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['courses', 'months']);
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    },
  });

  const deleteMonthMutation = useMutation(monthsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('months');
      toast.success('Month deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete month');
    },
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    createBatchMutation.mutate({ name: batchName.trim() });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !selectedBatch) return;
    createCourseMutation.mutate({ 
      name: courseName.trim(), 
      batchId: selectedBatch 
    });
  };

  const handleCreateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthName.trim() || !monthNumber || !selectedCourse || !coursePayment) return;
    
    createMonthMutation.mutate({
      name: monthName.trim(),
      monthNumber: parseInt(monthNumber),
      courseId: selectedCourse,
      payment: parseFloat(coursePayment)
    });
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm('Are you sure you want to delete this batch? This will also delete all related courses and months.')) {
      deleteBatchMutation.mutate(id);
    }
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course? This will also delete all related months.')) {
      deleteCourseMutation.mutate(id);
    }
  };

  const handleDeleteMonth = (id: string) => {
    if (confirm('Are you sure you want to delete this month?')) {
      deleteMonthMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Batch</h1>
        <p className="text-gray-600 dark:text-gray-400">Create and manage batches, courses, and months</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Batch */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Batch</h3>
          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div>
              <label className="form-label">Batch Name</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="form-input"
                placeholder="Enter batch name"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createBatchMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createBatchMutation.isLoading ? 'Creating...' : 'Create Batch'}
            </button>
          </form>

          {/* Existing Batches */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Existing Batches</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batches.map((batch: any) => (
                <div key={batch._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium">{batch.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteBatch(batch._id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Course */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Course</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="form-label">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="form-input"
                placeholder="Enter course name"
                required
              />
            </div>
            <div>
              <label className="form-label">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select Batch</option>
                {batches.map((batch: any) => (
                  <option key={batch._id} value={batch._id}>{batch.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createCourseMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createCourseMutation.isLoading ? 'Creating...' : 'Create Course'}
            </button>
          </form>

          {/* Existing Courses */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Existing Courses</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {courses.map((course: any) => {
                // Use populated batchId data if available, otherwise fall back to manual lookup
                const batchName = course.batchId?.name || batches.find((b: any) => b._id === course.batchId)?.name || 'Unknown';
                return (
                  <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm font-medium block">{course.name}</span>
                      <span className="text-xs text-gray-500">Batch: {batchName}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create Month */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Month</h3>
          <form onSubmit={handleCreateMonth} className="space-y-4">
            <div>
              <label className="form-label">Month Name</label>
              <select
                value={monthName}
                onChange={(e) => setMonthName(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Month Number</label>
              <input
                type="number"
                value={monthNumber}
                onChange={(e) => setMonthNumber(e.target.value)}
                className="form-input"
                placeholder="Enter month number (1-12)"
                min="1"
                max="24"
                required
              />
            </div>
            <div>
              <label className="form-label">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => {
                  // Use populated batchId data if available, otherwise fall back to manual lookup
                  const batchName = course.batchId?.name || batches.find((b: any) => b._id === course.batchId)?._name || 'Unknown Batch';
                  return (
                    <option key={course._id} value={course._id}>
                      {course.name} ({batchName})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="form-label">Course Payment (৳)</label>
              <input
                type="number"
                value={coursePayment}
                onChange={(e) => setCoursePayment(e.target.value)}
                className="form-input"
                placeholder="Enter payment amount"
                min="0"
                step="0.01"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createMonthMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createMonthMutation.isLoading ? 'Creating...' : 'Create Month'}
            </button>
          </form>

          {/* Existing Months */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Existing Months</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {months.map((month: any) => {
                // Use the populated courseId from the API response
                const course = month.courseId;
                const batchName = course?.batchId?.name || 'Unknown';
                return (
                  <div key={month._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm font-medium block">{month.name}</span>
                      <span className="text-xs text-gray-500">
                        Course: {course?.name || 'Unknown'} | 
                        Batch: {batchName} | 
                        Fee: ৳{month.payment}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteMonth(month._id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}