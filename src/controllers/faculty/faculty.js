import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = (req, res) => {
    const sortBy = req.query.sort || 'name';
    const faculty = getSortedFaculty(sortBy);

    res.render('faculty/list', {
        title: 'Faculty List',
        faculty: faculty,
        currentSort: sortBy
    })
}

const facultyDetailPage = (req, res, next) => {
    const facultyId = req.params.facultyId;
    const faculty = getFacultyById(facultyId);

    if (!faculty) {
        const err = new Error(`Faculty "${facultyId}" not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        title: 'faculty',
        faculty: faculty
    })
}

export { facultyListPage, facultyDetailPage }