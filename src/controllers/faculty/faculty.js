import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = async (req, res) => {
    const validSortOptions = ['name', 'department', 'title'];
    const sortBy = validSortOptions.includes(req.query.sort) ? req.query.sort : 'name';
    const faculty = await getSortedFaculty(sortBy);

    res.render('faculty/list', {
        title: 'Faculty List',
        faculty: faculty,
        currentSort: sortBy
    })
}

const facultyDetailPage = async (req, res, next) => {
    const facultySlug = req.params.facultySlug;
    const faculty = await getFacultyBySlug(facultySlug);

    if (Object.keys(faculty).length === 0) {
        const err = new Error(`Faculty "${facultySlug}" not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        title: `${faculty.name} - Faculty Profile`,
        faculty: faculty
    })
}

export { facultyListPage, facultyDetailPage }