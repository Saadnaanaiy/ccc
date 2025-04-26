import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiEdit, FiTrash2, FiBookOpen, FiDollarSign, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const InstructorDashboard = () => {
  const { user, isInstructor } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_courses: 0,
    total_students: 0,
    total_income: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not instructor
    if (user && !isInstructor()) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch courses and analytics in parallel
        const [coursesResponse, analyticsResponse] = await Promise.all([
          axios.get('/instructor/courses'),
          axios.get('/instructor/analytics')
        ]);

        setCourses(coursesResponse.data.courses);
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        console.error('Error fetching instructor data:', err);
        setError('Failed to load instructor data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, isInstructor, navigate]);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await axios.delete(`/instructor/courses/${courseId}`);
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-neutral-600">Manage your courses and profile, {user?.nom}.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Analytics Cards */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-2">
              <FiBookOpen className="text-primary mr-2" size={20} />
              <h3 className="font-semibold text-lg">Total Courses</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{analytics.total_courses}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-2">
              <FiUsers className="text-primary mr-2" size={20} />
              <h3 className="font-semibold text-lg">Total Students</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{analytics.total_students}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-2">
              <FiDollarSign className="text-primary mr-2" size={20} />
              <h3 className="font-semibold text-lg">Total Income</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{analytics.total_income.toFixed(2)} MAD</p>
          </div>
        </div>
        
        {/* Course Management Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <FiBookOpen className="mr-2 text-primary" />
              My Courses
            </h2>
            <Link to="/instructor/courses/new" className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md flex items-center">
              <FiPlusCircle className="mr-2" /> Create New Course
            </Link>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="p-6 flex justify-between items-center hover:bg-neutral-50 transition-colors">
                  <div>
                    <h3 className="font-semibold mb-1">{course.titre}</h3>
                    <p className="text-sm text-neutral-600">
                      {course.students_count || 0} Students | 
                      <span className={`font-medium ml-1 ${course.estPublic ? 'text-green-600' : 'text-amber-600'}`}>
                        {course.estPublic ? 'Published' : 'Draft'}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Link 
                      to={`/instructor/courses/${course.id}`} 
                      className="text-neutral-500 hover:text-primary mr-3"
                      title="View course"
                    >
                      <FiBarChart2 size={18} />
                    </Link>
                    <Link 
                      to={`/instructor/courses/${course.id}/edit`} 
                      className="text-neutral-500 hover:text-primary mr-3"
                      title="Edit course"
                    >
                      <FiEdit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-neutral-500 hover:text-red-600"
                      title="Delete course"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-600 mb-4">You haven't created any courses yet.</p>
                <Link 
                  to="/instructor/courses/new" 
                  className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md inline-flex items-center"
                >
                  <FiPlusCircle className="mr-2" /> Create your first course
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;