import { getAllCourses, getCourseById, getCoursesByDepartment, getSortedSections } from '../../models/catalog/catalog.js';

// Show the course catalog list page
const catalogPage = (req, res) => {
    const courses = getAllCourses();

    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Show the individual course detail page
const courseDetailPage = (req, res, next) => {
    const courseId = req.params.courseId;
    const course = getCourseById(courseId);

    // If course doesn't exist, create 404 error
    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    // Handle sorting if requested
    const sortBy = req.query.sort || 'time';
    const sortedSections = getSortedSections(course.sections, sortBy);

    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
};

// Show courses by department
const departmentPage = (req, res, next) => {
    const departments = getCoursesByDepartment();

    if(!departments) {
        const err = new Error(`Departments ${deptId} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('departments', {
        title: 'Departments',
        departments: departments,
    })
}

export { catalogPage, courseDetailPage, departmentPage };