import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/landing/info
 * Fetch public landing page information
 */
router.get('/info', asyncHandler(async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('landing_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Default landing info if not in database
    const defaultInfo = {
      title: 'Coddy - School Management Platform',
      subtitle: 'Manage your school with ease',
      description: 'A comprehensive platform for managing students, payments, attendance, and more.',
      features: [
        {
          title: 'Student Management',
          description: 'Manage student records and information'
        },
        {
          title: 'Payment Tracking',
          description: 'Track and manage school payments'
        },
        {
          title: 'Attendance System',
          description: 'Automated attendance and reporting'
        },
        {
          title: 'Multi-language Support',
          description: 'Available in multiple languages'
        }
      ],
      cta_primary: 'Get Started',
      cta_secondary: 'Learn More'
    };

    res.status(200).json({
      status: 'success',
      data: settings || defaultInfo
    });
  } catch (error) {
    console.error('Error fetching landing info:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to fetch landing information'
    });
  }
}));

/**
 * GET /api/landing/testimonials
 * Fetch public testimonials
 */
router.get('/testimonials', asyncHandler(async (req, res) => {
  try {
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .limit(6)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      data: testimonials || [],
      count: testimonials?.length || 0
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to fetch testimonials'
    });
  }
}));

/**
 * GET /api/landing/stats
 * Fetch public platform statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    // Fetch counts from various tables (only public/aggregated data)
    const [{ count: studentCount }, { count: courseCount }, { count: schoolCount }] = await Promise.all([
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student'),
      supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true),
      supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        total_students: studentCount || 0,
        total_courses: courseCount || 0,
        total_schools: schoolCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to fetch statistics'
    });
  }
}));

export default router;
