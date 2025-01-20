import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { publicRoutes } from './routes';
import { DefaultLayout, RecruiterLayout } from '~/components/Layouts';
import { SidebarProvider } from '~/context/SidebarContext';

function App() {
    return (
        <SidebarProvider>
            <Router>
                <div className="App">
                    <ToastContainer
                        position="top-right"
                        autoClose={10000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;

                            let Layout = DefaultLayout;

                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = Fragment;
                            } else if (route.layout === RecruiterLayout) {
                                Layout = RecruiterLayout;
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                </div>
            </Router>
        </SidebarProvider>
    );
}

export default App;
