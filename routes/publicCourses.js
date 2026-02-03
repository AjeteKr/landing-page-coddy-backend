import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/public/courses
 * Fetch all publicly available courses (no auth required)
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, description, category, instructor, level, image_url, price, is_public')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching public courses:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to fetch courses'
    });
  }
}));

/**
 * GET /api/public/courses/:id
 * Fetch single course details (no auth required)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          status: 'error',
          code: 404,
          message: 'Course not found'
        });
      }
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to fetch course details'
    });
  }
}));

/**
 * GET /api/public/courses/category/:category
 * Fetch courses by category (no auth required)
 */
router.get('/category/:category', asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;

    const { data, error } = await supabase
      .from('courses')
      .select('id, name, description, category, instructor, level, image_url, price')
      .eq('is_public', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to fetch courses by category'
    });
  }
}));

export default router;
