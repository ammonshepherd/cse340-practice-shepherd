import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = (req, res) => {
    res.send("faculty page");
    // const faculty = getSortedFaculty();

    // res.render('faculty/list', {
    //     title: 'Faculty List',
    //     faculty: faculty
    // })
}

const facultyDetailPage = (req, res) => {
    const facultyId = req.params.facultyId;
    const faculty = getFacultyById(facultyId);

    if (!faculty) {
        const err = new Error(`Faculty ${facultyId} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        title: 'faculty',
        faculty: faculty
    })
}

export { facultyListPage, facultyDetailPage }