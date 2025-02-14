const routes = {
    home: '/',
    dashboard: '/admin/dashboard/',
    user: '/admin/users/',
    payment: '/admin/payments/',
    job: '/admin/job',
    giftcode: '/admin/giftcodes/',
    model: '/admin/models/',
    blogAdmin: '/blogs/',
    role: '/roles/',

    blog: '/blog',
    live: '/live',
    profile:(slug) => `/${slug}`,
    upload: '/upload',
    search: '/search',
    createPayment: (course_id) => `/payment/${course_id}`,
    courseDetails: (course_id) => `course/${course_id}`,
    myCourseDetails: (course_id) => `my-course/${course_id}`,

    registeredCourse: '/registered-course',
    myCourse: '/my-course',
    createCourse: '/new-course/',
    roadmap: '/roadmap',
    bookmark: '/me/bookmark',
    myBlog: '/me/posts',
    createBlog: '/new-post',
    blogDetails:(id) => `/blog/${id}`,
    editBlog:(id) => `/posts/${id}/edit`,
    
    loginEmail: '/login/email',
    registerEmail: '/register/email',
    forgotPassword: '/forgot-password',
    
    postJob: '/post-job',

    paymentReturn: '/payment/return',
}

export default routes