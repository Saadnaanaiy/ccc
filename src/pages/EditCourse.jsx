import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiTrash2, FiArrowLeft, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Mock categories - in a real app, fetch from API
  const categories = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Data Science' },
    { id: 3, name: 'Business' },
    { id: 4, name: 'Design' },
    { id: 5, name: 'Marketing' }
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/instructor/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        });
        
        const course = response.data.course;
        setFormData({
          title: course.title,
          description: course.description,
          price: course.price,
          category_id: course.category_id,
          image: null
        });
        
        if (course.image) {
          setImagePreview(`http://localhost:8000/storage/${course.image}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setFormData({
        ...formData,
        image: files[0]
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const data = new FormData();
      data.append('_method', 'PUT'); // Laravel requires this for PUT requests with FormData
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category_id', formData.category_id);
      
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      const response = await axios.post(`http://localhost:8000/api/instructor/courses/${courseId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      alert('Course updated successfully!');
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.response?.data?.message || 'Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:8000/api/instructor/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      alert('Course deleted successfully!');
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err.response?.data?.message || 'Failed to delete course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom text-center">
          <p>Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="heading-lg mb-2">Edit Course</h1>
            <p className="text-neutral-600">Update your course information</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/instructor/dashboard')}
              className="btn py-2 px-4 border border-neutral-300 flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <button 
              onClick={handleDelete}
              className="btn py-2 px-4 border border-red-300 text-red-600 hover:bg-red-50 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete Course
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Course Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price (MAD)*
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category*
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a category