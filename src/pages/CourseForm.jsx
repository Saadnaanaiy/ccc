import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlusCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isInstructor } = useAuth();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const [course, setCourse] = useState({
    titre: '',
    description: '',
    prix: 0,
    niveau: 'debutant',
    categorie_id: '',
    dureeMinutes: 0,
    estPublic: false,
    image: ''
  });
  
  // Form validation state
  const [validation, setValidation] = useState({});

  useEffect(() => {
    // Redirect if not instructor
    if (user && !isInstructor()) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('/categories');
        setCategories(categoriesResponse.data);
        
        // If editing, fetch course details
        if (isEditMode) {
          const courseResponse = await axios.get(`/instructor/courses/${id}`);
          setCourse(courseResponse.data.course);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, isInstructor, navigate, id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse({
      ...course,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is edited
    if (validation[name]) {
      setValidation({
        ...validation,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!course.titre.trim()) errors.titre = 'Title is required';
    if (!course.description.trim()) errors.description = 'Description is required';
    if (course.prix < 0) errors.prix = 'Price cannot be negative';
    if (!course.categorie_id) errors.categorie_id = 'Category is required';
    if (course.dureeMinutes <= 0) errors.dureeMinutes = 'Duration must be greater than 0';
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      if (isEditMode) {
        await axios.put(`/instructor/courses/${id}`, course);
      } else {
        await axios.post('/instructor/courses', course);
      }
      
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error('Error saving course:', err);
      
      // Handle validation errors from backend
      if (err.response?.status === 422) {
        setValidation(err.response.data.errors);
      } else {
        setError('Failed to save course. Please try again.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-neutral-600 hover:text-neutral-800"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                name="titre"
                value={course.titre}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${validation.titre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Complete JavaScript Bootcamp"
              />
              {validation.titre && (
                <p className="mt-1 text-sm text-red-600">{validation.titre}</p>
              )}
            </div>
            
            {/* Course Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={course.description}
                onChange={handleChange}
                rows="4"
                className={`w-full p-2 border rounded-md ${validation.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe your course content and what students will learn"
              ></textarea>
              {validation.description && (
                <p className="mt-1 text-sm text-red-600">{validation.description}</p>
              )}
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (MAD) *
              </label>
              <input
                type="number"
                name="prix"
                value={course.prix}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full p-2 border rounded-md ${validation.prix ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validation.prix && (
                <p className="mt-1 text-sm text-red-600">{validation.prix}</p>
              )}
            </div>
            
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="dureeMinutes"
                value={course.dureeMinutes}
                onChange={handleChange}
                min="1"
                className={`w-full p-2 border rounded-md ${validation.dureeMinutes ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validation.dureeMinutes && (
                <p className="mt-1 text-sm text-red-600">{validation.dureeMinutes}</p>
              )}
            </div>
            
            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level *
              </label>
              <select
                name="niveau"
                value={course.niveau}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="debutant">Beginner</option>
                <option value="intermediaire">Intermediate</option>
                <option value="avance">Advanced</option>
                <option value="tous">All Levels</option>
              </select>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="categorie_id"
                value={course.categorie_id}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${validation.categorie_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nom}
                  </option>
                ))}
              </select>
              {validation.categorie_id && (
                <p className="mt-1 text-sm text-red-600">{validation.categorie_id}</p>
              )}
            </div>
            
            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                name="image"
                value={course.image}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">Enter a URL for your course thumbnail image</p>
            </div>
            
            {/* Published Status */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="estPublic"
                  name="estPublic"
                  checked={course.estPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="estPublic" className="ml-2 block text-sm text-gray-700">
                  Make this course public (publish)
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Unpublished courses are only visible to you
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {formSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;